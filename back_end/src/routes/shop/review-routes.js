const {
  addReview,
  getReviewsByProductId,
} = require("../../controllers/shop/review-controller");

const router = require("express").Router();
router.post("/", addReview);
router.get("/:productId", getReviewsByProductId);
module.exports = router;
