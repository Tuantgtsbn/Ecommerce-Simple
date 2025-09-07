const {mongoose} = require("../config/db");
const Schema = mongoose.Schema;

const PaymentSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "paypal", "credit_card"],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    transactionId: {
      type: String,
    },
    payerName: String,
    payerEmail: String,
    amount: Number,
    paymentId: String,
    currency: {type: String, default: "USD"},
    paymentDate: {type: Date, default: Date.now},
  },
  {timestamps: true, collection: "payments"},
);

const PaymentModel = mongoose.model("Payment", PaymentSchema);

module.exports = {PaymentModel};
