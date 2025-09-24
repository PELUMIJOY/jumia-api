// routes/paymentRoutes.js
const express = require("express");
const { authenticateUser } = require("../validations/authenticateUser");
const {
  initiatePayment,
  verifyPayment,
} = require("../controller/paymentcontoller");

const router = express.Router();

// Payment routes (protected - require authentication)
router.post("/initiate", authenticateUser, initiatePayment);
router.post("/verify/:reference", authenticateUser, verifyPayment);
// router.get('/order/:orderId', authenticateUser, getOrderDetails);


module.exports = router;
