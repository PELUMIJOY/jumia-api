// const Item = require("../Models/Item.js");
const Review = require("../models/review.js");
const Item = require("../models/item.js");
const mongoose = require("mongoose");

// Get all reviews for a product
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { sort = "recent", page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    // Check if product exists
    const product = await Item.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    let sortOption = {};
    switch (sort) {
      case "recent":
        sortOption = { createdAt: -1 };
        break;
      case "helpful":
        sortOption = { helpfulCount: -1, createdAt: -1 };
        break;
      case "highest":
        sortOption = { rating: -1, createdAt: -1 };
        break;
      case "lowest":
        sortOption = { rating: 1, createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ product: productId })
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const totalReviews = await Review.countDocuments({ product: productId });

    res.json({
      reviews,
      totalReviews,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalReviews / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get review statistics for a product
const getReviewStats = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const stats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          rating5: {
            $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] },
          },
          rating4: {
            $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] },
          },
          rating3: {
            $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] },
          },
          rating2: {
            $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] },
          },
          rating1: {
            $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] },
          },
        },
      },
    ]);

    if (stats.length === 0) {
      return res.json({
        averageRating: 0,
        totalReviews: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      });
    }

    res.json({
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
      distribution: {
        5: stats[0].rating5,
        4: stats[0].rating4,
        3: stats[0].rating3,
        2: stats[0].rating2,
        1: stats[0].rating1,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new review
const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user.id;
    const userName = req.user.name
      ? `${req.user.name} ${req.user.lastName || ""}`.trim()
      : "Anonymous User";

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    // Check if product exists
    const product = await Item.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: userId,
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ error: "You have already reviewed this product" });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Validate title
    if (!title || title.trim().length < 5 || title.trim().length > 100) {
      return res
        .status(400)
        .json({ error: "Title must be between 5 and 100 characters" });
    }

    // Validate comment
    if (
      !comment ||
      comment.trim().length < 10 ||
      comment.trim().length > 1000
    ) {
      return res
        .status(400)
        .json({ error: "Comment must be between 10 and 1000 characters" });
    }

    const review = await Review.create({
      product: productId,
      user: userId,
      userName,
      rating,
      title: title.trim(),
      comment: comment.trim(),
    });

    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ error: "You have already reviewed this product" });
    }
    res.status(400).json({ error: error.message });
  }
};

// Update a review
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ error: "Invalid review ID" });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Check if user owns this review
    if (review.user !== userId) {
      return res
        .status(403)
        .json({ error: "You can only update your own reviews" });
    }

    // Validate if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    if (title && (title.trim().length < 5 || title.trim().length > 100)) {
      return res
        .status(400)
        .json({ error: "Title must be between 5 and 100 characters" });
    }

    if (
      comment &&
      (comment.trim().length < 10 || comment.trim().length > 1000)
    ) {
      return res
        .status(400)
        .json({ error: "Comment must be between 10 and 1000 characters" });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      {
        ...(rating && { rating }),
        ...(title && { title: title.trim() }),
        ...(comment && { comment: comment.trim() }),
      },
      { new: true, runValidators: true }
    );

    res.json(updatedReview);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ error: "Invalid review ID" });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Allow deletion if user owns review or is admin
    if (review.user !== userId && userRole !== "admin") {
      return res
        .status(403)
        .json({ error: "You can only delete your own reviews" });
    }

    await Review.findByIdAndDelete(reviewId);

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark review as helpful
const markHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ error: "Invalid review ID" });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Check if user already marked as helpful
    if (review.helpfulBy.includes(userId)) {
      return res
        .status(400)
        .json({ error: "You have already marked this review as helpful" });
    }

    review.helpfulBy.push(userId);
    review.helpfulCount += 1;
    await review.save();

    res.json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get user's own reviews
const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ user: userId })
      .populate("product", "name imageUrl price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalReviews = await Review.countDocuments({ user: userId });

    res.json({
      reviews,
      totalReviews,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalReviews / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProductReviews,
  getReviewStats,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
  getUserReviews,
};