const {mongoose} = require("../config/db");
const Schema = mongoose.Schema;

const CartItemSchema = new Schema(
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

CartItemSchema.index({userId: 1});
CartItemSchema.index({userId: 1, variantId: 1}, {unique: true});

const CartItemModel = mongoose.model("CartItem", CartItemSchema);
module.exports = {CartItemModel};
