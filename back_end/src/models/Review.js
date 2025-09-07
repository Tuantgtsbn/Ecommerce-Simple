const {mongoose} = require("../config/db");
const Schema = mongoose.Schema;

const ReviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    variantId: {
      type: Schema.Types.ObjectId,
      ref: "Variant",
      default: null,
    },
    comment: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
    collection: "reviews",
  },
);

ReviewSchema.index({userId: 1});
ReviewSchema.index({productId: 1});
ReviewSchema.index({variantId: 1});
ReviewSchema.index({productId: 1, createdAt: -1});

const ReviewModel = mongoose.model("Review", ReviewSchema);

module.exports = {ReviewModel};
