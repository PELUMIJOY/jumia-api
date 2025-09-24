const express = require("express");
// const { signup, login, logout, getProtectedData } = require("../controller/authController.js");
const { verifyToken } = require("../middleware/authMiddleware.js");
const {
  signup,
  login,
  logout,
  getProtectedData,
} = require("../Controller/authController.js");

const router = express.Router();

// Custom auth routes (will work alongside Better-Auth)
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/protected", verifyToken, getProtectedData);

module.exports = router;
