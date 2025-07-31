const Review = require("../../models/Review");
const Order = require("../../models/Orders");
const Product = require("../../models/Product");
const addReview = async (req, res) => {
  try {
    const {userId, productId, comment, rating} = req.body;
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "UserId or productId must be provided",
      });
    }
    const order = await Order.findOne({
      userId,
      "cartItems.productId": productId,
    });
    if (!order) {
      return res.status(400).json({
        success: false,
        message: "You have not purchased this product",
      });
    }
    const existingReview = await Review.findOne({userId, productId});
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }
    const newReview = new Review({
      userId,
      productId,
      comment,
      rating,
    });
    await newReview.save();
    const reviews = await Review.find({productId});
    const totalReviews = reviews.length;
    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    const product = await Product.findById(productId);
    product.averageRating = averageRating;
    product.totalReviews = totalReviews;
    await product.save();
    return res.status(200).json({
      success: true,
      message: "Review added successfully",
      data: newReview.toObject(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getReviewsByProductId = async (req, res) => {
  try {
    const {productId} = req.params;
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "ProductId must be provided",
      });
    }
    const reviews = await Review.find({productId}).populate({
      path: "userId",
      select: "userName avatar",
    });
    if (!reviews) {
      return res.status(404).json({
        success: false,
        message: "No reviews found",
      });
    }
    return res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  addReview,
  getReviewsByProductId,
};
