const {ReviewModel: Review} = require("../../models/Review");
const {OrderModel: Order} = require("../../models/Orders");
const {ProductModel: Product} = require("../../models/Product");

const addReview = async (req, res) => {
  try {
    const {userId, productId, variantId, comment, rating} = req.body;

    if (!userId || !productId || !variantId || !rating) {
      return res.status(400).json({
        success: false,
        message: "UserId, productId, variantId, and rating are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Kiểm tra user đã mua sản phẩm variant này chưa
    const order = await Order.findOne({
      userId,
      "orderItems.variantId": variantId,
      "orderStatus": {$in: ["delivered", "confirmed"]},
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "You can only review products you have purchased",
      });
    }

    // Kiểm tra đã review chưa
    const existingReview = await Review.findOne({
      userId,
      productId,
      variantId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product variant",
      });
    }

    // Tạo review mới
    const newReview = new Review({
      userId,
      productId,
      variantId,
      comment: comment || "",
      rating,
    });

    await newReview.save();

    // Cập nhật average rating và total reviews cho product
    await updateProductRating(productId);

    // Populate user info để trả về
    await newReview.populate("userId", "username avatar");

    return res.status(200).json({
      success: true,
      message: "Review added successfully",
      data: newReview,
    });
  } catch (error) {
    console.error("Add review error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getReviewsByProductId = async (req, res) => {
  try {
    const {productId} = req.params;
    const {page = 1, limit = 10, rating} = req.query;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "ProductId is required",
      });
    }

    const skip = (page - 1) * limit;

    // Build filter
    const filter = {productId};
    if (rating) {
      filter.rating = Number(rating);
    }

    const reviews = await Review.find(filter)
      .populate("userId", "username avatar")
      .populate("variantId")
      .sort({createdAt: -1})
      .skip(skip)
      .limit(Number(limit));

    const totalReviews = await Review.countDocuments(filter);

    // Tính thống kê rating
    const ratingStats = await Review.aggregate([
      {$match: {productId: mongoose.Types.ObjectId(productId)}},
      {
        $group: {
          _id: "$rating",
          count: {$sum: 1},
        },
      },
      {$sort: {_id: -1}},
    ]);

    return res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalReviews,
        pages: Math.ceil(totalReviews / limit),
      },
      stats: {
        ratingDistribution: ratingStats,
      },
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const {reviewId} = req.params;
    const {userId, comment, rating} = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId is required",
      });
    }

    const review = await Review.findOne({_id: reviewId, userId});
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you don't have permission to update",
      });
    }

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }
      review.rating = rating;
    }

    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();

    // Cập nhật lại average rating cho product
    await updateProductRating(review.productId);

    await review.populate("userId", "username avatar");

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    console.error("Update review error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const {reviewId} = req.params;
    const {userId} = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId is required",
      });
    }

    const review = await Review.findOneAndDelete({_id: reviewId, userId});
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you don't have permission to delete",
      });
    }

    // Cập nhật lại average rating cho product
    await updateProductRating(review.productId);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserReviews = async (req, res) => {
  try {
    const {userId} = req.params;
    const {page = 1, limit = 10} = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId is required",
      });
    }

    const skip = (page - 1) * limit;

    const reviews = await Review.find({userId})
      .populate("productId", "name images slug")
      .populate("variantId")
      .sort({createdAt: -1})
      .skip(skip)
      .limit(Number(limit));

    const totalReviews = await Review.countDocuments({userId});

    return res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalReviews,
        pages: Math.ceil(totalReviews / limit),
      },
    });
  } catch (error) {
    console.error("Get user reviews error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper function để cập nhật product rating
const updateProductRating = async (productId) => {
  try {
    const reviews = await Review.find({productId});
    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      await Product.findByIdAndUpdate(productId, {
        averageRating: 0,
        totalReviews: 0,
      });
      return;
    }

    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

    await Product.findByIdAndUpdate(productId, {
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews,
    });
  } catch (error) {
    console.error("Update product rating error:", error);
  }
};
const mongoose = require("mongoose");

module.exports = {
  addReview,
  getReviewsByProductId,
  updateReview,
  deleteReview,
  getUserReviews,
};
