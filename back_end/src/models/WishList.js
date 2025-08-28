const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WishListSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        type: Schema.Types.ObjectId,
        ref: "ProductVariant",
        required: true,
      },
    ],
  },
  {timestamps: true},
);

WishListSchema.index({userId: 1});

const WishList = mongoose.model("WishList", WishListSchema);
module.exports = WishList;
