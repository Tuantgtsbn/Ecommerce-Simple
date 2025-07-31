const express = require("express");
const router = express.Router();
const {
  addAddress,
  deleteAddress,
  editAddress,
  getListAddress,
} = require("../../controllers/shop/address-controller");
router.post("/", addAddress);
router.get("/:userId", getListAddress);
router.put("/:addressId", editAddress);
router.delete("/:addressId", deleteAddress);
module.exports = router;
