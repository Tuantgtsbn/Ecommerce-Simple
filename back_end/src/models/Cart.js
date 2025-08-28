const mongoose = require("mongoose");
const Schema = mongoose.Schema;

CartItemSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    variantId: {
      type: Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {timestamps: true, collection: "cartItems"},
);

CartItemSchema.index({userId: 1, variantId: 1}, {unique: true});
CartItemSchema.index({createdAt: 1});
const CartItemModel = mongoose.model("CartItem", CartItemSchema);

module.exports = {CartItemModel};
