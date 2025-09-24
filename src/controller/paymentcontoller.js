const axios = require("axios");
const Order = require("../models/Order");

const initiatePayment = async (req, res) => {
  try {
    const { userId, items, totalAmount, shippingDetails, email } = req.body;

    // Validate required fields
    if (!userId || !items || !totalAmount || !email) {
      return res.status(400).json({
        error: "Missing required fields: userId, items, totalAmount, email",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items array cannot be empty" });
    }

    // Create Paystack transaction
    const paystackResponse = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: totalAmount * 100,
        callback_url: process.env.PAYSTACK_CALLBACK_URL,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reference = paystackResponse.data.data.reference;
    // Save order with Processing status
    const newOrder = new Order({
      user: userId,
      items: items.map((item) => ({
        product: item.product,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      totalAmount,
      shippingDetails: {
        phoneNumber: shippingDetails?.phoneNumber || "",
        address: shippingDetails?.address || "",
      },
      reference,
      status: "Processing",
    });

    await newOrder.save();

    res.json({
      authorization_url: paystackResponse.data.data.authorization_url,
      reference,
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("Payment initiation error:", error);

    // Handle Paystack API errors
    if (error.response?.data) {
      return res.status(400).json({
        error: error.response.data.message || "Payment initialization failed",
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        error: "Order already exists with this reference",
      });
    }

    res.status(500).json({ error: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({ error: "Reference is required" });
    }

    // Verify with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = response.data.data;

    // Find and update order
    const order = await Order.findOne({ reference }).populate(
      "user",
      "name email"
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update order status based on payment status
    if (data.status === "success") {
      order.status = "Paid";
      order.updatedAt = new Date();
    } else if (data.status === "failed") {
      order.status = "Failed";
      order.updatedAt = new Date();
    }

    await order.save();

    res.json({
      message: `Payment ${data.status}`,
      order: {
        _id: order._id,
        status: order.status,
        totalAmount: order.totalAmount,
        reference: order.reference,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    if (error.response?.data) {
      return res.status(400).json({
        error: error.response.data.message || "Payment verification failed",
      });
    }

    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  initiatePayment,
  verifyPayment,
};
