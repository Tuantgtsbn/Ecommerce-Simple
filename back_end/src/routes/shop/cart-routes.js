const {
  fetchCartItems,
  addProductToCart,
  updateCartItemQty,
  deleteCartItem,
} = require("../../controllers/shop/cart-controllers");

const router = require("express").Router();
router.get("/:userId", fetchCartItems);
router.post("/", addProductToCart);
router.put("/", updateCartItemQty);
router.delete("/", deleteCartItem);
module.exports = router;
