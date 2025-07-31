const express = require("express");
const {
  createOrder,
  capturePayment,
  getOrdersByUserId,
  getOneOrderByUserId,
} = require("../../controllers/shop/order-controller");
const router = express.Router();
router.post("/create-order", createOrder);
router.post("/capture-payment", capturePayment);
router.post("/get-orders", getOrdersByUserId);
router.get("/:orderId", getOneOrderByUserId);
module.exports = router;
