const express = require("express");
const router = express.Router();
const {searchProducts} = require("../../controllers/shop/search-controller");
router.get("/", searchProducts);
module.exports = router;
