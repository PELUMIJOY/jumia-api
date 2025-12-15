// controller/chatController.js
const Conversation = require("../models/conversation");
const Message = require("../models/message");
const user = require("../Models/user");
// const User = require("../models/user");

// Customer creates/gets their support conversation
const getOrCreateSupportConversation = async (req, res) => {
  try {
    const customerId = req.userId;
    const { category, relatedOrderId, relatedProductId } = req.body;

    // Check if customer has an open conversation
    let conversation = await Conversation.findOne({
      customer: customerId,
      status: { $in: ["open", "in_progress", "waiting_customer"] }
    })
      .populate("customer", "name email")
      .populate("assignedAgent", "name email")
      .populate("relatedProduct", "name price imageUrl")
      .populate("relatedOrder");

    if (conversation) {
      return res.status(200).json({
        success: true,
        conversation,
        message: "Existing conversation found"
      });
    }

    // Create new conversation
    const customer = await user.findById(customerId);
    
    conversation = await Conversation.create({
      customer: customerId,
      customerName: customer.name,
      customerEmail: customer.email,
      category: category || "other",
      relatedOrder: relatedOrderId || null,
      relatedProduct: relatedProductId || null,
      status: "open",
      priority: "medium",
      agentUnreadCount: 1 // New conversation counts as unread for agents
    });

    // Create welcome system message
    await Message.create({
      conversation: conversation._id,
      sender: customerId,
      senderName: "System",
      senderType: "system",
      content: "Thank you for contacting support! An agent will be with you shortly.",
      systemMessageType: "conversation_started",
      readByCustomer: true,
      readByAgent: false
    });

    // Try to auto-assign to available agent
    const agentId = await Conversation.assignToAgent();
    if (agentId) {
      conversation.assignedAgent = agentId;
      conversation.status = "in_progress";
      await conversation.save();
    }

    await conversation.populate("customer", "name email");
    await conversation.populate("assignedAgent", "name email");
    if (relatedProductId) {
      await conversation.populate("relatedProduct", "name price imageUrl");
    }

    res.status(201).json({
      success: true,
      conversation,
      message: "Support conversation created"
    });
  } catch (error) {
    console.error("Create support conversation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create support conversation"
    });
  }
};

// Get customer's conversation history
const getCustomerConversations = async (req, res) => {
  try {
    const customerId = req.userId;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { customer: customerId };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const conversations = await Conversation.find(query)
      .populate("customer", "name email")
      .populate("assignedAgent", "name email")
      .populate("relatedProduct", "name price imageUrl")
      .populate("relatedOrder")
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Conversation.countDocuments(query);

    res.status(200).json({
      success: true,
      conversations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get customer conversations error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch conversations"
    });
  }
};

// Admin: Get all support conversations
const getAllSupportConversations = async (req, res) => {
  try {
    // Only admins can access this
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: "Unauthorized: Admin access required"
      });
    }

    const { 
      status, 
      priority, 
      category,
      assignedAgent,
      search,
      page = 1, 
      limit = 20 
    } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (assignedAgent) query.assignedAgent = assignedAgent;
    
    // Search by customer name or email
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const conversations = await Conversation.find(query)
      .populate("customer", "name email phone")
      .populate("assignedAgent", "name email")
      .populate("relatedProduct", "name price imageUrl")
      .populate("relatedOrder")
      .sort({ priority: -1, lastMessageAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Conversation.countDocuments(query);

    // Get statistics
    const stats = await Conversation.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      conversations,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get all conversations error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch conversations"
    });
  }
};

// Get messages for a conversation
const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;
    const { page = 1, limit = 50 } = req.query;

    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found"
      });
    }

    // Check authorization
    const isCustomer = conversation.customer.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized access"
      });
    }

    const skip = (page - 1) * limit;

    // Customers don't see internal messages
    const query = {
      conversation: conversationId,
      isDeleted: false
    };
    
    if (isCustomer) {
      query.isInternal = false;
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("sender", "name email role");

    const totalMessages = await Message.countDocuments(query);

    res.status(200).json({
      success: true,
      messages: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalMessages,
        pages: Math.ceil(totalMessages / limit)
      }
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch messages"
    });
  }
};

// Admin: Assign conversation to agent
const assignConversation = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: "Unauthorized: Admin access required"
      });
    }

    const { conversationId } = req.params;
    const { agentId } = req.body;

    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found"
      });
    }

    // Verify agent exists and is admin
    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'admin') {
      return res.status(400).json({
        success: false,
        error: "Invalid agent"
      });
    }

    conversation.assignedAgent = agentId;
    conversation.status = "in_progress";
    await conversation.save();

    // Create system message
    await Message.create({
      conversation: conversationId,
      sender: agentId,
      senderName: "System",
      senderType: "system",
      content: `${agent.name} was assigned to this conversation`,
      systemMessageType: "agent_assigned",
      readByCustomer: false,
      readByAgent: true
    });

    await conversation.populate("assignedAgent", "name email");

    res.status(200).json({
      success: true,
      conversation,
      message: "Conversation assigned successfully"
    });
  } catch (error) {
    console.error("Assign conversation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to assign conversation"
    });
  }
};

// Admin: Update conversation status
const updateConversationStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: "Unauthorized: Admin access required"
      });
    }

    const { conversationId } = req.params;
    const { status, internalNotes } = req.body;

    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found"
      });
    }

    conversation.status = status;
    if (internalNotes) {
      conversation.internalNotes = internalNotes;
    }
    await conversation.save();

    // Create system message
    await Message.create({
      conversation: conversationId,
      sender: req.userId,
      senderName: "System",
      senderType: "system",
      content: `Conversation status changed to ${status}`,
      systemMessageType: "status_changed",
      readByCustomer: false,
      readByAgent: true
    });

    res.status(200).json({
      success: true,
      conversation,
      message: "Status updated successfully"
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update status"
    });
  }
};

// Customer: Rate conversation after resolution
const rateConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { rating, feedback } = req.body;
    const userId = req.userId;

    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found"
      });
    }

    // Verify this is the customer's conversation
    if (conversation.customer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized"
      });
    }

    // Can only rate resolved/closed conversations
    if (!['resolved', 'closed'].includes(conversation.status)) {
      return res.status(400).json({
        success: false,
        error: "Can only rate resolved or closed conversations"
      });
    }

    conversation.rating = rating;
    conversation.feedback = feedback;
    await conversation.save();

    res.status(200).json({
      success: true,
      message: "Thank you for your feedback!",
      conversation
    });
  } catch (error) {
    console.error("Rate conversation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to submit rating"
    });
  }
};

// Get unread count for customer
const getCustomerUnreadCount = async (req, res) => {
  try {
    const customerId = req.userId;

    const conversations = await Conversation.find({
      customer: customerId,
      customerUnreadCount: { $gt: 0 }
    });

    const totalUnread = conversations.reduce((sum, conv) => {
      return sum + conv.customerUnreadCount;
    }, 0);

    res.status(200).json({
      success: true,
      unreadCount: totalUnread
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch unread count"
    });
  }
};

// Get unread count for agents (all customer messages)
const getAgentUnreadCount = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: "Unauthorized: Admin access required"
      });
    }

    const conversations = await Conversation.find({
      agentUnreadCount: { $gt: 0 }
    });

    const totalUnread = conversations.reduce((sum, conv) => {
      return sum + conv.agentUnreadCount;
    }, 0);

    res.status(200).json({
      success: true,
      unreadCount: totalUnread,
      conversationsWithUnread: conversations.length
    });
  } catch (error) {
    console.error("Get agent unread count error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch unread count"
    });
  }
};

module.exports = {
  getOrCreateSupportConversation,
  getCustomerConversations,
  getAllSupportConversations,
  getConversationMessages,
  assignConversation,
  updateConversationStatus,
  rateConversation,
  getCustomerUnreadCount,
  getAgentUnreadCount
};