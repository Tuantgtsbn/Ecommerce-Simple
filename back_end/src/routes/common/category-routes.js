const express = require("express");
const router = express.Router();
const {getCategories} = require("../../controllers/common/category-controller");
router.get("/", getCategories);
module.exports = router;
