const {
  OrderModel: Order,
  OrderStatusHistoryModel: OrderStatusHistory,
} = require("../../models/Orders");
const {ProductModel: Product} = require("../../models/Product");
const {CartItemModel: CartItem} = require("../../models/Cart");
const {UserModel: User} = require("../../models/User");
const {AddressModel: Address} = require("../../models/Address");
const paypal = require("../../helpers/paypal");

// Hàm tạo order number duy nhất
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `ORD${timestamp}${random}`;
};

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressId,
      paymentMethod = "cash",
      couponCode,
      notes,
    } = req.body;

    // Validate required fields
    if (!userId || !cartItems || cartItems.length === 0 || !addressId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Lấy thông tin user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
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

    // Kiểm tra và validate cart items
    const orderItems = [];
    let subTotal = 0;

    for (const item of cartItems) {
      const product = await Product.findOne({
        "variants._id": item.variantId,
        "isActive": true,
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with variant ${item.variantId} not found`,
        });
      }

      const variant = product.variants.id(item.variantId);
      if (!variant || variant.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${variant?.quantity || 0}`,
        });
      }

      const itemPrice =
        variant.discountPrice || variant.price || product.basePrice;
      const itemTotal = itemPrice * item.quantity;
      subTotal += itemTotal;

      orderItems.push({
        variantId: item.variantId,
        title: product.name,
        name: product.name,
        thumbnail: variant.images?.[0] || product.images?.[0],
        price: itemPrice,
        quantity: item.quantity,
        discount: variant.discount || 0,
        attributes: variant.attributes || [],
      });
    }

    // Tính toán tổng tiền (có thể thêm logic coupon, shipping fee)
    const shippingFee = 0; // Có thể tính dựa trên địa chỉ
    const totalDiscount = 0; // Có thể tính từ coupon
    const totalAmount = subTotal + shippingFee - totalDiscount;

    // Tạo order
    const orderNumber = generateOrderNumber();
    const newOrder = new Order({
      orderNumber,
      userId,
      customer: {
        username: user.username,
        email: user.email,
        phone: user.phone || address.phone,
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
      shippingFee,
      subTotal,
      totalDiscount,
      totalAmount,
      notes,
    });

    await newOrder.save();

    // Tạo order status history
    await new OrderStatusHistory({
      orderId: newOrder._id,
      status: "pending",
      message: "Order created successfully",
    }).save();

    if (paymentMethod === "cash") {
      // Xử lý thanh toán tiền mặt - Confirm order và update stock
      await confirmOrder(newOrder._id);

      // Xóa cart items
      await CartItem.deleteMany({
        userId,
        variantId: {$in: cartItems.map((item) => item.variantId)},
      });

      return res.status(200).json({
        success: true,
        message: "Order created successfully",
        data: newOrder,
      });
    } else if (paymentMethod === "paypal") {
      // Xử lý PayPal payment
      return await createPayPalPayment(newOrder, cartItems, res);
    }
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating order",
    });
  }
};

// Helper function để confirm order và update stock
const confirmOrder = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) return;

  // Update stock cho các variants
  for (const item of order.orderItems) {
    const product = await Product.findOne({"variants._id": item.variantId});
    if (product) {
      const variant = product.variants.id(item.variantId);
      if (variant) {
        variant.quantity -= item.quantity;
        await product.save();
      }
    }
  }

  // Update order status
  order.orderStatus = "confirmed";
  await order.save();

  // Add status history
  await new OrderStatusHistory({
    orderId: order._id,
    status: "confirmed",
    message: "Order confirmed and stock updated",
  }).save();
};

// Helper function để tạo PayPal payment
const createPayPalPayment = async (order, cartItems, res) => {
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: "http://localhost:5173/shop/paypal-return",
      cancel_url: "http://localhost:5173/shop/paypal-cancel",
    },
    transactions: [
      {
        item_list: {
          items: order.orderItems.map((item) => ({
            name: item.title,
            sku: item.variantId.toString(),
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
        console.error("PayPal error:", error);
        return res.status(500).json({
          success: false,
          message: "Error creating PayPal payment",
        });
      } else {
        const approvalURL = payment.links.find(
          (link) => link.rel === "approval_url",
        ).href;

        res.status(201).json({
          success: true,
          approvalURL,
          orderId: order._id,
          message: "Order created, please complete PayPal payment",
        });
      }
    });
  });
};
const capturePayment = async (req, res) => {
  try {
    const {paymentId, payerId, orderId} = req.body;

    if (!paymentId || !payerId || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment information",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
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
          console.error("PayPal execution error:", error);
          return res.status(500).json({
            success: false,
            message: "Payment execution failed",
          });
        } else {
          // Confirm order và update stock
          await confirmOrder(orderId);

          // Xóa cart items
          const cartItems = await CartItem.find({
            userId: order.userId,
            variantId: {$in: order.orderItems.map((item) => item.variantId)},
          });

          await CartItem.deleteMany({
            userId: order.userId,
            variantId: {$in: order.orderItems.map((item) => item.variantId)},
          });

          res.status(200).json({
            success: true,
            message: "Payment captured and order confirmed",
            data: order,
          });
        }
      },
    );
  } catch (error) {
    console.error("Capture payment error:", error);
    res.status(500).json({
      success: false,
      message: "Error capturing payment",
    });
  }
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
  capturePayment,
  getOrdersByUserId,
  getOneOrderByUserId,
  cancelOrder,
};
