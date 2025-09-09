const {ReviewModel: Review} = require("../../models/Review");
const {OrderModel: Order} = require("../../models/Orders");
const {ProductModel: Product} = require("../../models/Product");

const addReview = async (req, res) => {
  const {id: userId} = req.user;
  try {
    const {productId, variantId, comment, rating} = req.body;

    if (!userId || (!productId && !variantId) || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message:
          "UserId, productId, variantId, rating, and comment are required",
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
      $or: [
        {
          "orderItems.variantId": variantId,
        },
        {
          "orderItems.product.productId": productId,
        },
      ],
      orderStatus: {$in: ["delivered", "confirmed"]},
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
      productId: productId || null,
      variantId: variantId || null,
      comment: comment || "",
      rating,
    });

    await newReview.save();

    // Cập nhật average rating và total reviews cho product
    updateProductRating(productId, "new", rating);

    const fullReview = await Review.findById(newReview._id)
      .populate("userId", "username avatar")
      .populate("variantId")
      .populate("productId", "name slug images");

    return res.status(200).json({
      success: true,
      message: "Review added successfully",
      data: fullReview,
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
    const {page = 1, limit = 10, sortBy} = req.query;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "ProductId is required",
      });
    }

    const skip = (page - 1) * limit;
    const sortOptions = {};
    switch (sortBy) {
      case "newest":
        sortOptions.createdAt = -1;
        break;
      case "oldest":
        sortOptions.createdAt = 1;
        break;
      default:
        sortOptions.createdAt = -1;
    }
    // Build filter
    const filter = {productId};

    const p1 = Review.countDocuments(filter).exec();
    const p2 = Review.find(filter)
      .populate("userId", "username avatar")
      .populate("variantId")
      .populate("productId", "name slug images")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .exec();

    const [totalReviews, reviews] = await Promise.all(
      [p1, p2].map((p) => p.catch((err) => null)),
    );

    return res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalItems: totalReviews || 0,
        totalPages: Math.ceil(totalReviews || 0 / limit),
        hasNextPage:
          reviews && totalReviews && skip + reviews.length < totalReviews,
        hasPrevPage: page > 1,
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
  const {id: userId} = req.user;
  try {
    const {reviewId} = req.params;
    const {comment, rating} = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId is required",
      });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you don't have permission to update",
      });
    }
    if (review.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this review",
      });
    }

    if (rating) {
      if (typeof rating !== "number" || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }
      review.rating = rating;
    }

    if (comment) {
      review.comment = comment;
    }

    await review.save();

    // Cập nhật lại average rating cho product
    if (rating) updateProductRating(review.productId, "update", _, rating);

    const fullReview = await Review.findById(reviewId)
      .populate("userId", "username avatar")
      .populate("variantId")
      .populate("productId", "name slug images");

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: fullReview,
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
  const {id: userId} = req.user;
  try {
    const {reviewId} = req.params;
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

    updateProductRating(review.productId, "delete", _, review.rating);

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

// Helper function để cập nhật product rating
const updateProductRating = async (
  productId,
  type,
  newRating = 0,
  oldRating = 0,
) => {
  try {
    const product = await Product.findById(productId);
    if (!product) return true;

    if (type === "new") {
      product.totalRatings = (product.totalRatings || 0) + 1;
      product.averageRating =
        ((product.averageRating || 0) * (product.totalRatings - 1) +
          newRating) /
        product.totalRatings;
    } else if (type === "update") {
      product.totalRatings = product.totalRatings || 0;
      product.averageRating =
        ((product.averageRating || 0) * product.totalRatings -
          oldRating +
          newRating) /
        product.totalRatings;
    } else if (type === "delete") {
      product.totalRatings = (product.totalRatings || 0) - 1;
      product.averageRating =
        ((product.averageRating || 0) * (product.totalRatings + 1) -
          oldRating) /
        product.totalRatings;
    }
    await product.save();
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = {
  addReview,
  getReviewsByProductId,
  updateReview,
  deleteReview,
};
