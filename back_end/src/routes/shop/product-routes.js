const router = require("express").Router();
const {get} = require("mongoose");
const {
  fetchFilteredProducts,
  getProductDetail,
  findRelatedProducts,
} = require("../../controllers/shop/product-controllers");

router.get("/", fetchFilteredProducts);
router.get("/:id", getProductDetail);
router.get("/related/:id", findRelatedProducts);
module.exports = router;
