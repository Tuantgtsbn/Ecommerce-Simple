const express = require("express");
const router = express.Router();
const {upload} = require("../../helpers/upLoad");
const {
  addProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  statisticalProducts,
} = require("../../controllers/admin/product-controller");
router.post(
  "/addProduct",
  upload.fields([
    {name: "thumbnail", maxCount: 1},
    {name: "images", maxCount: 5},
  ]),
  addProduct,
);
router.put("/updateProduct/:id", updateProduct);
router.delete("/deleteProduct/:id", deleteProduct);
router.get("/getAllProducts", getAllProducts);
router.get("/statisticalProducts", statisticalProducts);
module.exports = router;
