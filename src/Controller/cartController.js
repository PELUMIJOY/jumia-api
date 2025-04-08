const Cart = require("../models/cart.js");

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
    return res.status(400).json({ error: "User ID and Product ID are required" });
  }

  try {
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Filter out the item to remove
    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId
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
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    
    res.status(200).json({ 
      message: "Item quantity updated", 
      item: cart.items[itemIndex] 
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

// Create checkout/order from cart
const checkout = async function (req, res) {
  const { userId } = req.params;
  const { shippingDetails } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  if (!shippingDetails || !shippingDetails.phoneNumber || !shippingDetails.address) {
    return res.status(400).json({ error: "Shipping details are required" });
  }

  try {
    // Get cart with populated product details
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    
    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ message: "Cart is empty" });
    }

    // Here you would create an order from the cart
    // This is a placeholder for the actual order creation logic
    // In a real implementation, you would:
    // 1. Create an order in your Order model
    // 2. Process payment if necessary
    // 3. Update inventory
    // 4. Clear the cart after successful order creation

    // For demonstration purposes, let's just calculate the total
    const orderItems = cart.items.map(item => ({
      product: item.productId._id,
      name: item.productId.title || item.productId.name,
      price: item.productId.price,
      quantity: item.quantity,
      image: item.productId.imageUrl || item.productId.url
    }));

    const totalAmount = cart.items.reduce((sum, item) => 
      sum + (item.productId.price * item.quantity), 0);
    
    const orderData = {
      user: userId,
      items: orderItems,
      totalAmount,
      shippingDetails,
      status: "Processing",
      createdAt: new Date()
    };

    // Clear the cart after successful order creation
    cart.items = [];
    await cart.save();
    
    res.status(200).json({ 
      message: "Order created successfully", 
      order: orderData 
    });
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
  checkout
};