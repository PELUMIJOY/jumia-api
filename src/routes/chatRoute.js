// routes/chatRoute.js
const express = require("express");
const {
  getOrCreateSupportConversation,
  getCustomerConversations,
  getAllSupportConversations,
  getConversationMessages,
  assignConversation,
  updateConversationStatus,
  rateConversation,
  getCustomerUnreadCount,
  getAgentUnreadCount
} = require("../controller/chatController");
const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// ============ CUSTOMER ROUTES ============

// Customer: Get or create support conversation
router.post("/support", getOrCreateSupportConversation);

// Customer: Get their conversation history
router.get("/conversations/my", getCustomerConversations);

// Customer: Rate a conversation
router.post("/conversations/:conversationId/rate", rateConversation);

// Customer: Get unread message count
router.get("/unread-count", getCustomerUnreadCount);

// ============ ADMIN/AGENT ROUTES ============

// Admin: Get all support conversations (with filters)
router.get("/conversations/all", getAllSupportConversations);

// Admin: Assign conversation to agent
router.put("/conversations/:conversationId/assign", assignConversation);

// Admin: Update conversation status
router.put("/conversations/:conversationId/status", updateConversationStatus);

// Admin: Get agent unread count
router.get("/agent/unread-count", getAgentUnreadCount);

// ============ SHARED ROUTES ============

// Get messages for a specific conversation (both customer and agent)
router.get("/conversations/:conversationId/messages", getConversationMessages);

module.exports = router;