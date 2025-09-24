const express = require("express");
const {
  addToCart,
  viewCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} = require("../controller/cartController");

const router = express.Router();

// Cart management routes
router.post("/add", addToCart);
router.get("/:userId", viewCart);
router.delete("/:userId/item/:productId", removeFromCart);
router.put("/:userId/item/:productId", updateQuantity);
router.delete("/:userId/clear", clearCart);

module.exports = router;
