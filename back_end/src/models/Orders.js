const {mongoose} = require("../config/db");
const Schema = mongoose.Schema;

const OrderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customer: {
      username: {type: String, required: true},
      email: {type: String, required: true},
    },
    orderItems: [
      {
        variantId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        imageUrl: {
          desktop: {
            type: [String],
          },
          tablet: {
            type: [String],
          },
          mobile: {
            type: [String],
          },
        },
        sku: {type: String},
        price: {type: Number, required: true},
        quantity: {type: Number, required: true},
        name: {type: String, required: true},
        discount: {type: Number, default: 0},
        attributes: [
          {
            name: {type: String, required: true},
            value: {type: String, required: true},
          },
        ],
        product: {
          id: {type: Schema.Types.ObjectId, ref: "Product"},
          name: String,
          slug: String,
          categoryId: {type: Schema.Types.ObjectId, ref: "Category"},
        },
      },
    ],

    shippingAddress: {
      addressId: {type: Schema.Types.ObjectId, ref: "Address"},
      detail: String,
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
        "confirmed",
        "inShipping",
        "delivered",
        "rejected",
        "cancelled",
        "failedDelivery",
        "refunded",
      ],
      default: "pending",
    },
    coupon: [
      {
        couponId: {type: Schema.Types.ObjectId, ref: "Coupon"},
        code: String,
        discount: Number,
      },
    ],
    shippingFee: {type: Number, default: 0},
    subTotal: {type: Number, required: true},
    totalDiscount: {type: Number, required: true},
    totalAmount: {type: Number, required: true},
    paymentId: {type: Schema.Types.ObjectId, ref: "Payment"},
    orderDate: {type: Date, default: Date.now},
    cancellation: {
      reason: {type: String},
      cancelledBy: {type: String, enum: ["customer", "admin"]},
      cancelledAt: {type: Date},
    },
    shipping: {
      providerId: {type: Schema.Types.ObjectId, ref: "ShippingProvider"},
      providerName: {type: String},
      trackingNumber: {type: String},
      estimatedDelivery: {type: Date},
      actualDelivery: {type: Date},
    },
    notes: {type: String},
  },
  {timestamps: true, collection: "orders"},
);

OrderSchema.index({userId: 1});
OrderSchema.index({userId: 1, orderDate: 1});
// orderNumber has `unique: true` on field, no separate index() needed
OrderSchema.index({createdAt: 1});

const OrderStatusHistorySchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    message: String,
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "inShipping",
        "delivered",
        "rejected",
        "cancelled",
        "failedDelivery",
        "refunded",
      ],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {collection: "orderStatusHistories"},
);

const OrderModel = mongoose.model("Order", OrderSchema);

const OrderStatusHistoryModel = mongoose.model(
  "OrderStatusHistory",
  OrderStatusHistorySchema,
);

module.exports = {OrderModel, OrderStatusHistoryModel};
