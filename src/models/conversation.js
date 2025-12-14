// models/conversation.js
const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  // Support agent handling this conversation
  assignedAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  // What the customer needs help with
  category: {
    type: String,
    enum: ["order_inquiry", "product_question", "payment_issue", "delivery", "return_refund", "account", "other"],
    default: "other"
  },
  // Link to relevant order or product
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order"
  },
  relatedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item"
  },
  status: {
    type: String,
    enum: ["open", "in_progress", "waiting_customer", "resolved", "closed"],
    default: "open"
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium"
  },
  lastMessage: {
    type: String,
    default: ""
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  lastMessageFrom: {
    type: String,
    enum: ["customer", "agent", "system"],
    default: "customer"
  },
  // Track if customer has unread messages from support
  customerUnreadCount: {
    type: Number,
    default: 0
  },
  // Track if support has unread messages from customer
  agentUnreadCount: {
    type: Number,
    default: 0
  },
  // Customer satisfaction rating after resolution
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: String,
  // Tags for categorization
  tags: [String],
  // Notes for internal use by support team
  internalNotes: String
}, { timestamps: true });

// Indexes for faster queries
ConversationSchema.index({ customer: 1, status: 1 });
ConversationSchema.index({ assignedAgent: 1, status: 1 });
ConversationSchema.index({ status: 1, priority: -1, createdAt: -1 });
ConversationSchema.index({ lastMessageAt: -1 });

// Method to increment customer unread count
ConversationSchema.methods.incrementCustomerUnread = function() {
  this.customerUnreadCount += 1;
  return this.save();
};

// Method to increment agent unread count
ConversationSchema.methods.incrementAgentUnread = function() {
  this.agentUnreadCount += 1;
  return this.save();
};

// Method to reset customer unread count
ConversationSchema.methods.resetCustomerUnread = function() {
  this.customerUnreadCount = 0;
  return this.save();
};

// Method to reset agent unread count
ConversationSchema.methods.resetAgentUnread = function() {
  this.agentUnreadCount = 0;
  return this.save();
};

// Auto-assign to available agent (can be enhanced with load balancing)
ConversationSchema.statics.assignToAgent = async function() {
  const User = mongoose.model('User');
  const agents = await User.find({ role: 'admin', status: 'active' });
  
  if (agents.length === 0) return null;
  
  // Simple round-robin assignment (can be enhanced)
  const randomAgent = agents[Math.floor(Math.random() * agents.length)];
  return randomAgent._id;
};

module.exports = mongoose.model("Conversation", ConversationSchema);