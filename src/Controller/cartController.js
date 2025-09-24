const Cart = require("../models/cart.js");
const axios = require("axios");
const crypto = require("crypto");

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;

if (!PAYSTACK_SECRET_KEY) {
  console.error("PAYSTACK_SECRET_KEY is not set in environment variables");
}

// Add item to cart
const addToCart = async function (req, res) {
  const { userId, productId, quantity } = req.body;

  if (!userId || !productId || !quantity) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    res.status(200).json({ message: "Item added to cart", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// View cart
const viewCart = async function (req, res) {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart) {
      return res.status(404).json({ message: "Cart is empty" });
    }

    res.status(200).json({ cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove item from cart
const removeFromCart = async function (req, res) {
  const { userId, productId } = req.params;

  if (!userId || !productId) {
    return res
      .status(400)
      .json({ error: "User ID and Product ID are required" });
  }

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();
    res.status(200).json({ message: "Item removed from cart", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update item quantity
const updateQuantity = async function (req, res) {
  const { userId, productId } = req.params;
  const { quantity } = req.body;

  if (!userId || !productId || !quantity) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (quantity < 1) {
    return res.status(400).json({ error: "Quantity must be at least 1" });
  }

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    res.status(200).json({
      message: "Item quantity updated",
      item: cart.items[itemIndex],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Clear cart
const clearCart = async function (req, res) {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addToCart,
  viewCart,
  removeFromCart,
  updateQuantity,
  clearCart,
};
