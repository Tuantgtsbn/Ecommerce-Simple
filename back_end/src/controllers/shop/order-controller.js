const {
  OrderModel: Order,
  OrderStatusHistoryModel: OrderStatusHistory,
} = require("../../models/Orders");

const {
  ProductModel: Product,
  ProductVariantModel,
} = require("../../models/Product");
const {CartItemModel: CartItem} = require("../../models/Cart");
const {AddressModel: Address} = require("../../models/Address");
const paypal = require("../../helpers/paypal");
const {CouponModel} = require("../../models/Coupon");
const UserModel = require("../../models/User");
const {ShippingProviderModel} = require("../../models/ShippingProvider");
const {PaymentModel} = require("../../models/Payment");

// Hàm tạo order number duy nhất
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(16);
  const random = Math.floor(Math.random() * 1000)
    .toString(16)
    .padStart(3, "0");
  return `ORD${timestamp}${random}`;
};

const createOrder = async (req, res) => {
  const {id: userId} = req.user;
  try {
    const {
      items,
      addressId,
      couponIds,
      paymentMethod = "cash",
      shippingId,
    } = req.body;

    // Validate required fields
    if ((Array.isArray(items) && items.length === 0) || !addressId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Lấy thông tin user
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const shippingProvider = await ShippingProviderModel.findById(shippingId);
    if (!shippingProvider) {
      return res.status(404).json({
        success: false,
        message: "Shipping provider not found",
      });
    }
    // Lấy thông tin địa chỉ
    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    let shippingFee = 0; // Có thể tính dựa trên địa chỉ
    let tmpSubTotal = 0; // Tạm thời, sẽ tính sau
    let totalDiscount = 0; // Tạm thời, sẽ tính sau
    let totalAmount = 0; // Tạm thời, sẽ tính sau

    // Kiểm tra và validate cart items
    const orderItems = [];

    for (const {itemId, quantity = 1} of items) {
      if (!itemId || quantity <= 0) continue;
      const productVariant = await ProductVariantModel.findOne({
        _id: itemId,
        isActive: true,
      }).populate("productId", "_id name slug categoryId");

      if (!productVariant) {
        return res.status(404).json({
          success: false,
          message: `Product with variant ${itemId} not found`,
        });
      }

      if (productVariant.quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${productVariant.name}. Available: ${productVariant.quantity || 0}`,
          errors: {
            variantId: "Quantity exceeds available stock",
          },
        });
      }

      const price =
        (quantity *
          (productVariant.price || 0) *
          (100 - (productVariant.discount || 0))) /
        100;
      tmpSubTotal += price;
      orderItems.push({
        variantId: productVariant._id,
        sku: productVariant.sku,
        name: productVariant.name,
        imageUrl: productVariant.imageUrl,
        price: productVariant.price,
        quantity,
        discount: productVariant.discount || 0,
        attributes: productVariant.attributeValues,
        product: productVariant.productId
          ? {
              id: productVariant.productId._id,
              name: productVariant.productId.name,
              slug: productVariant.productId.slug,
              categoryId: productVariant.productId.categoryId,
            }
          : null,
      });
    }

    // Tính toán tổng tiền (có thể thêm logic coupon, shipping fee)
    let tmpCoupons = [];
    if (typeof couponIds === "string" && couponIds.trim() !== "") {
      tmpCoupons = [couponIds];
    } else if (Array.isArray(couponIds) && couponIds.length > 0) {
      tmpCoupons = couponIds;
    }
    const coupons = await CouponModel.find({
      _id: {$in: tmpCoupons},
      isActive: true,
      startDate: {$lte: new Date()},
      $or: [{endDate: null}, {endDate: {$gte: new Date()}}],
      usageLimit: {$gt: "$usedCount"},
    });

    for (const couponId of coupons) {
      const coupon = await CouponModel.findById(couponId);
      if (coupon) {
        // Áp dụng logic giảm giá dựa trên coupon
        if (
          coupon.isActive &&
          (!coupon.endDate || new Date() <= coupon.endDate)
        ) {
          if (coupon.type === "all") {
            totalDiscount += Math.min(
              coupon.maxDiscountAmount,
              coupon.discountType === "percentage"
                ? (tmpSubTotal * coupon.discountValue) / 100
                : coupon.discountValue,
            );
          } else if (coupon.type === "category") {
            // Giảm giá theo category (nếu có sản phẩm trong đơn thuộc category này)
            const categoryIds = coupon.couponCategories.map((cat) =>
              cat.categoryId.toString(),
            );
            const totalPriceFromCategory = orderItems
              .filter((item) =>
                categoryIds.includes(item.product.categoryId.toString()),
              )
              .reduce((acc, item) => {
                const totalItemPrice =
                  (item.quantity *
                    (item.price || 0) *
                    (100 - (item.discount || 0))) /
                  100;
                return acc + totalItemPrice;
              }, 0);
            if (totalPriceFromCategory > 0) {
              totalDiscount += Math.min(
                coupon.maxDiscountAmount,
                coupon.discountType === "percentage"
                  ? (totalPriceFromCategory * coupon.discountValue) / 100
                  : coupon.discountValue,
              );
            }
          } else if (coupon.type === "product") {
            // Giảm giá theo sản phẩm (nếu có sản phẩm trong đơn thuộc sản phẩm này)
            const totalPriceFromProduct = orderItems
              .filter((item) =>
                coupon.couponProducts
                  .map((prod) => prod.productId.toString())
                  .includes(item.product.id.toString()),
              )
              .reduce((acc, item) => {
                const totalItemPrice =
                  (item.quantity *
                    (item.price || 0) *
                    (100 - (item.discount || 0))) /
                  100;
                return acc + totalItemPrice;
              }, 0);
            if (totalPriceFromProduct > 0) {
              totalDiscount += Math.min(
                coupon.maxDiscountAmount,
                coupon.discountType === "percentage"
                  ? (totalPriceFromProduct * coupon.discountValue) / 100
                  : coupon.discountValue,
              );
            }
          }
        }
      }
    }

    totalAmount = tmpSubTotal - totalDiscount + shippingFee;
    if (totalAmount < 0) totalAmount = 0;

    // Tạo order
    const orderNumber = generateOrderNumber();
    const newOrder = new Order({
      orderNumber,
      userId,
      customer: {
        username: user.userName,
        email: user.email,
      },
      orderItems,
      shippingAddress: {
        addressId: address._id,
        detail: address.detail,
        ward: address.ward,
        district: address.district,
        city: address.city,
        country: address.country,
        phone: address.phone,
        notes: address.notes,
      },
      orderStatus: "pending",
      coupon: coupons.map((coupon) => ({
        couponId: coupon._id,
        code: coupon.code,
        discount: coupon.discountValue,
        discountType: coupon.discountType,
      })),
      shippingFee,
      subTotal,
      totalDiscount,
      totalAmount,
      notes,
      shipping: {
        providerId: shippingId,
        providerName: shippingProvider.name,
      },
    });

    if (paymentMethod === "cash") {
      // Xử lý thanh toán tiền mặt - Confirm order và update stock
      Promise.allSettled([
        newOrder.save(),
        updateStock(newOrder._id),
        handleDeleteCartItems(userId, orderItems),
        new OrderStatusHistory({
          orderId: newOrder._id,
          status: "Pending",
          message: "Order is created. Waiting for confirmation",
        }).save(),
        new PaymentModel({
          orderId: newOrder._id,
          paymentMethod: "cash",
          paymentStatus: "pending",
          transactionId: null,
        }).save(),
      ]);
      return res.status(200).json({
        success: true,
        message: "Order created successfully",
        data: newOrder,
      });
    } else if (paymentMethod === "paypal") {
      // Xử lý PayPal payment
      try {
        const payment = await createPayPalPayment(newOrder.toObject());
        Promise.allSettled([
          newOrder.save(),
          new PaymentModel({
            orderId: newOrder._id,
            paymentMethod: "paypal",
            paymentStatus: "pending",
            transactionId: payment.id,
          }).save(),
        ]);
        const approvalURL = payment.links.find(
          (link) => link.rel === "approval_url",
        )?.href;
        return res.status(201).json({
          success: true,
          message: "Order created, please complete Paypal payment",
          data: {
            approvalURL,
            orderId: newOrder._id,
          },
        });
      } catch (error) {
        console.log("Paypal error: ", error);
        return res.status(500).json({
          success: false,
          message: "Paypal payment is unavailable, please try again later",
        });
      }
    }
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating order",
    });
  }
};

const handleDeleteCartItems = async (userId, orderItems) => {
  await CartItem.deleteMany({
    userId,
    variantId: {$in: orderItems.map((item) => item.variantId)},
  });
  return true;
};

const createPayPalPayment = async (order) => {
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url:
        "http://localhost:5000/api/shop/orders/paypal/success?orderId=" +
        order.id,
      cancel_url:
        "http://localhost:5000/api/shop/orders/paypal/cancel?orderId=" +
        order.id,
    },
    transactions: [
      {
        item_list: {
          items: order.orderItems.map((item) => ({
            name: item.name,
            sku: item.sku,
            price: item.price.toFixed(2),
            currency: "USD",
            quantity: item.quantity,
          })),
        },
        amount: {
          currency: "USD",
          total: order.totalAmount.toFixed(2),
        },
        description: `Payment for order ${order.orderNumber}`,
      },
    ],
  };

  return new Promise((resolve, reject) => {
    paypal.payment.create(create_payment_json, async (error, payment) => {
      if (error) {
        reject(error);
      } else {
        resolve(payment);
      }
    });
  });
};

/**
 * Cập nhật stock khi order được xác nhận
 * @param {string} orderId
 * @returns {Promise<void>}
 */
const updateStock = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) return;

  // Update stock cho các variants
  for (const item of order.orderItems) {
    const productVariant = await ProductVariantModel.findById(item.variantId);
    if (productVariant) {
      productVariant.quantity -= item.quantity;
      if (productVariant.quantity < 0) productVariant.quantity = 0;
      await productVariant.save();
    }
  }
};

const rollbackStock = async (orderId) => {
  if (!orderId) return;
  const order = await Order.findById(orderId);
  if (!order) return;
  for (const item of order.orderItems) {
    const productVariant = await ProductVariantModel.findById(item.variantId);
    if (productVariant) {
      productVariant.quantity += item.quantity;
      await productVariant.save();
    }
  }
};
/**
 * Tạo thanh toán PayPal
 * @param {*} order
 * @returns
 */

const paymentPaypalSuccess = async (req, res) => {
  const {paymentId, payerId, orderId} = req.query;
  try {
    if (!paymentId || !payerId || !orderId) {
      return res.redirect(
        `/checkout?orderId=${orderId}&success=false&message=Missing required payment information`,
      );
    } else {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error("Order not found");
      }
      // Execute PayPal payment
      const execute_payment_json = {
        payer_id: payerId,
        transactions: [
          {
            amount: {
              currency: "USD",
              total: order.totalAmount.toFixed(2),
            },
          },
        ],
      };

      paypal.payment.execute(
        paymentId,
        execute_payment_json,
        async (error, payment) => {
          if (error) {
            Promise.allSettled([
              rollbackStock(order._id),
              PaymentModel.findByIdAndUpdate(
                {orderId: order._id},
                {paymentStatus: "failed"},
              ).exec(),
            ]);
            return res.redirect(
              `/checkout?orderId=${orderId}&success=false&message=Payment execution failed`,
            );
          } else {
            Promise.allSettled([
              updateStock(order._id),
              handleDeleteCartItems(order.userId, order.orderItems),
              PaymentModel.findByIdAndUpdate(
                {orderId: order._id},
                {paymentStatus: "paid"},
              ).exec(),
            ]);

            return res.redirect(
              `/checkout?orderId=${orderId}&success=true&message=Payment completed successfully`,
            );
          }
        },
      );
    }
  } catch (error) {
    return res.redirect(
      `/checkout?orderId=${orderId}&success=false&message=${error.message || "Error processing payment"}`,
    );
  }
};

const paymentPaypalCancel = async (req, res) => {
  const {orderId} = req.query;
  Promise.allSettled([
    Order.findByIdAndUpdate(orderId, {orderStatus: "cancelled"}).exec(),
    PaymentModel.findOneAndUpdate({orderId}, {paymentStatus: "failed"}).exec(),
  ]);
  return res.redirect(
    `/checkout?orderId=${orderId}&success=false&message=Payment cancelled by user`,
  );
};

const getOrdersByUserId = async (req, res) => {
  try {
    const {userId} = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const {page = 1, limit = 10, status} = req.query;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {userId};
    if (status) {
      filter.orderStatus = status;
    }

    const orders = await Order.find(filter)
      .sort({createdAt: -1})
      .skip(skip)
      .limit(Number(limit))
      .populate("shippingAddress.addressId", "detail ward district city");

    const totalOrders = await Order.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalOrders,
        pages: Math.ceil(totalOrders / limit),
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching orders",
    });
  }
};

const getOneOrderByUserId = async (req, res) => {
  try {
    const {orderId} = req.params;

    const order = await Order.findById(orderId)
      .populate("shippingAddress.addressId")
      .populate("userId", "username email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Lấy order status history
    const statusHistory = await OrderStatusHistory.find({orderId}).sort({
      createdAt: 1,
    });

    return res.status(200).json({
      success: true,
      data: {
        ...order.toObject(),
        statusHistory,
      },
    });
  } catch (error) {
    console.error("Get order error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching order",
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const {orderId} = req.params;
    const {reason} = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Chỉ cho phép hủy order khi đang pending hoặc confirmed
    if (!["pending", "confirmed"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel order in current status",
      });
    }

    // Restore stock nếu order đã confirmed
    if (order.orderStatus === "confirmed") {
      for (const item of order.orderItems) {
        const product = await Product.findOne({"variants._id": item.variantId});
        if (product) {
          const variant = product.variants.id(item.variantId);
          if (variant) {
            variant.quantity += item.quantity;
            await product.save();
          }
        }
      }
    }

    // Update order
    order.orderStatus = "cancelled";
    order.cancellation = {
      reason: reason || "Cancelled by customer",
      cancelledBy: "customer",
      cancelledAt: new Date(),
    };
    await order.save();

    // Add status history
    await new OrderStatusHistory({
      orderId: order._id,
      status: "cancelled",
      message: reason || "Order cancelled by customer",
    }).save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    return res.status(500).json({
      success: false,
      message: "Error cancelling order",
    });
  }
};
module.exports = {
  createOrder,
  getOrdersByUserId,
  getOneOrderByUserId,
  cancelOrder,
  paymentPaypalSuccess,
  paymentPaypalCancel,
};
