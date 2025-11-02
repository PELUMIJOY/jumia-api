const express = require("express");
const {
  getProductReviews,
  getReviewStats,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
  getUserReviews,
} = require("../controller/reviewController.js");
const { verifyToken, optionalAuth } = require("../middleware/authMiddleware.js");
const { authenticateUser } = require("../validations/authenticateUser.js");
// const { verifyToken, optionalAuth } = require("../middleware/auth.js");

const router = express.Router();

// Public routes (no auth required)
router.get("/product/:productId", optionalAuth, getProductReviews);
router.get("/product/:productId/stats", getReviewStats);

// Protected routes (auth required)
router.post("/product/:productId", authenticateUser, createReview);
router.put("/:reviewId", authenticateUser, updateReview);
router.delete("/:reviewId", authenticateUser, deleteReview);
router.post("/:reviewId/helpful", authenticateUser, markHelpful);
router.get("/user/my-reviews", authenticateUser, getUserReviews);

module.exports = router;