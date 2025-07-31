const express = require("express");
const router = express.Router();
const {
  getBlogCategories,
  getBlogCategoryBySlug,
} = require("../../controllers/shop/blogcategory-controller");
router.get("/", getBlogCategories);
router.get("/:slug", getBlogCategoryBySlug);
module.exports = router;
