const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
    },
    images: [String],
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    brand: String,
    totalReviews: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
  },
  {timestamps: true},
);
const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
