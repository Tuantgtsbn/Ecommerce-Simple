const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cartId: {type: mongoose.Schema.Types.ObjectId, ref: "Cart"},

    cartItems: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        title: {type: String, required: true},
        thumbnail: {type: String, required: true},
        price: {type: Number, required: true},
        quantity: {type: Number, required: true},
        name: {type: String, required: true},
        discount: {type: Number, default: 0}, // discount in percentage
      },
    ],

    addressInfo: {
      addressId: {type: mongoose.Schema.Types.ObjectId, ref: "Address"},
      address: String,
      street: String,
      ward: String,
      district: String,
      city: String,
      country: String,
      phone: String,
      notes: String,
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "inProcess",
        "confirmed",
        "inShipping",
        "delivered",
        "rejected",
        "cancelled",
        "failedDelivery",
      ],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "paypal", "credit_card"],
      default: "cash",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    totalAmount: {type: Number, required: true},

    orderDate: {type: Date, default: Date.now},
    orderUpdateDate: {type: Date, default: Date.now},

    paymentId: {type: String, default: ""},
    payerId: {type: String, default: ""},
    reasonForCancel: String,
    reasonForReject: String,
    reasonForFailedDelivery: String,
  },
  {timestamps: true},
);
const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;
