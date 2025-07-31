const Order = require("../../models/Orders");
const Product = require("../../models/Product");
const Cart = require("../../models/Cart");
const paypal = require("../../helpers/paypal");
const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId,
      payerId,
      cartId,
    } = req.body;
    //Kiểm tra tồn kho cho tất cả sản phẩm
    const stockCheckPromises = cartItems.map(async (item) => {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
        );
      }
      return {
        product,
        requestedQuantity: item.quantity,
      };
    });
    try {
      var stockCheckResults = await Promise.all(stockCheckPromises);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    if (paymentMethod === "cash") {
      const newlyCreatedOrder = new Order({
        userId,
        cartItems,
        addressInfo,
        orderStatus,
        paymentMethod,
        paymentStatus,
        totalAmount,
        orderDate,
        orderUpdateDate,
        cartId,
      });
      await newlyCreatedOrder.save();
      // await Cart.findByIdAndDelete(cartId);
      stockCheckResults.forEach(async (result) => {
        result.product.stock -= result.requestedQuantity;
        await result.product.save();
      });
      await Cart.findByIdAndDelete(cartId);

      return res.status(200).json({
        success: true,
        message: "Order created successfully",
        data: newlyCreatedOrder,
      });
    } else if (paymentMethod === "paypal") {
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
              items: cartItems.map((item) => ({
                name: item.title,
                sku: item.productId,
                price: (
                  item.price -
                  (item.price * item.discount) / 100
                ).toFixed(2),
                currency: "USD",
                quantity: item.quantity,
              })),
            },
            amount: {
              currency: "USD",
              total: totalAmount.toFixed(2),
            },
            description: "This is the payment description.",
          },
        ],
      };
      paypal.payment.create(
        create_payment_json,
        async function (error, payment) {
          if (error) {
            console.log(error);
            return res.status(500).json({
              success: false,
              message: "Error creating payment",
            });
          } else {
            console.log("Payment", payment);
            const newlyCreatedOrder = new Order({
              userId,
              cartItems,
              addressInfo,
              orderStatus,
              paymentMethod,
              paymentStatus,
              totalAmount,
              orderDate,
              orderUpdateDate,
              paymentId,
              payerId,
              cartId,
            });
            await newlyCreatedOrder.save();
            const approvalURL = payment.links.find(
              (link) => link.rel === "approval_url",
            ).href;
            res.status(201).json({
              success: true,
              approvalURL,
              orderId: newlyCreatedOrder._id,
              message: "Order created successfully",
            });
          }
        },
      );
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error creating order",
    });
  }
};
const capturePayment = async (req, res) => {
  try {
    const {paymentId, payerId, orderId} = req.body;

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order can not be found",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "inProcess";
    order.paymentId = paymentId;
    order.payerId = payerId;
    await order.save();
    const stockCheckPromises = order.cartItems.map(async (item) => {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
        );
      }
      return {
        product,
        requestedQuantity: item.quantity,
      };
    });
    try {
      const stockCheckResults = await Promise.all(stockCheckPromises);
      stockCheckResults.forEach(async (result) => {
        result.product.stock -= result.requestedQuantity;
        await result.product.save();
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const getCartId = order.cartId;
    await Cart.findByIdAndDelete(getCartId);
    order.orderStatus = "confirmed";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order confirmed",
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrdersByUserId = async (req, res) => {
  try {
    const {userId} = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const orders = await Order.find({userId}).sort({createdAt: -1}); // Sắp xếp theo thời gian tạo mới nhất

    if (!orders) {
      return res.status(404).json({
        success: false,
        message: "No orders found",
      });
    }

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching orders",
    });
  }
};

const getOneOrderByUserId = async (req, res) => {
  try {
    const {orderId} = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: order.toObject(),
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching order",
    });
  }
};
module.exports = {
  createOrder,
  capturePayment,
  getOrdersByUserId,
  getOneOrderByUserId,
};
