const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../middleware/validation');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// @route   GET /api/messages/conversations
// @desc    Get user's conversations
// @access  Private
router.get('/conversations', 
  protect,
  validatePagination,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        search
      } = req.query;

      const result = await Conversation.getUserConversations(req.user._id, {
        page,
        limit,
        type,
        search
      });

      // Add unread count for each conversation
      const conversationsWithUnread = await Promise.all(
        result.conversations.map(async (conversation) => {
          const unreadCount = await Message.getUnreadCount(conversation._id, req.user._id);
          return {
            ...conversation.toObject(),
            unreadCount
          };
        })
      );

      res.json({
        success: true,
        data: {
          conversations: conversationsWithUnread,
          pagination: result.pagination
        }
      });

    } catch (error) {
      console.error('Conversations fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error fetching conversations'
      });
    }
  }
);

// @route   POST /api/messages/conversations
// @desc    Create or get conversation
// @access  Private
router.post('/conversations', protect, async (req, res) => {
  try {
    const { participantId, orderId, itemId, talentProductId, message } = req.body;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required'
      });
    }

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    // Prevent conversation with self
    if (participantId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot start a conversation with yourself'
      });
    }

    // Find or create conversation
    const conversation = await Conversation.findOrCreateDirectConversation(
      req.user._id,
      participantId,
      { orderId, itemId, talentProductId }
    );

    // Send initial message if provided
    if (message && message.trim().length > 0) {
      const newMessage = await Message.create({
        conversation: conversation._id,
        sender: req.user._id,
        content: message.trim()
      });

      await conversation.updateLastActivity(newMessage._id);
    }

    res.json({
      success: true,
      message: 'Conversation created/found successfully',
      data: { conversation }
    });

  } catch (error) {
    console.error('Conversation creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating conversation'
    });
  }
});

// @route   GET /api/messages/conversations/:id
// @desc    Get conversation details
// @access  Private
router.get('/conversations/:id',
  protect,
  validateObjectId('id'),
  async (req, res) => {
    try {
      const conversation = await Conversation.findById(req.params.id);

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      // Check if user is participant
      if (!conversation.isParticipant(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not a participant in this conversation.'
        });
      }

      const unreadCount = await Message.getUnreadCount(conversation._id, req.user._id);

      res.json({
        success: true,
        data: { 
          conversation: {
            ...conversation.toObject(),
            unreadCount
          }
        }
      });

    } catch (error) {
      console.error('Conversation fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error fetching conversation'
      });
    }
  }
);

// @route   GET /api/messages/conversations/:id/messages
// @desc    Get messages in conversation
// @access  Private
router.get('/conversations/:id/messages',
  protect,
  validateObjectId('id'),
  validatePagination,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 50,
        before // Message ID to get messages before (for pagination)
      } = req.query;

      const conversation = await Conversation.findById(req.params.id);

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      // Check if user is participant
      if (!conversation.isParticipant(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not a participant in this conversation.'
        });
      }

      // Build query
      const query = {
        conversation: req.params.id,
        isDeleted: false
      };

      if (before) {
        const beforeMessage = await Message.findById(before);
        if (beforeMessage) {
          query.createdAt = { $lt: beforeMessage.createdAt };
        }
      }

      const skip = (page - 1) * limit;

      const [messages, total] = await Promise.all([
        Message.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Message.countDocuments(query)
      ]);

      // Reverse to show oldest first
      messages.reverse();

      res.json({
        success: true,
        data: {
          messages,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalMessages: total,
            hasNext: page * limit < total,
            hasPrev: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Messages fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error fetching messages'
      });
    }
  }
);

// @route   POST /api/messages/conversations/:id/messages
// @desc    Send message in conversation
// @access  Private
router.post('/conversations/:id/messages',
  protect,
  validateObjectId('id'),
  async (req, res) => {
    try {
      const { content, type = 'text', replyTo, attachments } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Message content is required'
        });
      }

      const conversation = await Conversation.findById(req.params.id);

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      // Check if user is participant
      if (!conversation.isParticipant(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not a participant in this conversation.'
        });
      }

      // Create message
      const message = await Message.create({
        conversation: req.params.id,
        sender: req.user._id,
        content: content.trim(),
        type,
        replyTo,
        attachments: attachments || []
      });

      // Update conversation last activity
      await conversation.updateLastActivity(message._id);

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: { message }
      });

    } catch (error) {
      console.error('Message send error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error sending message'
      });
    }
  }
);

// @route   PUT /api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put('/:id/read',
  protect,
  validateObjectId('id'),
  async (req, res) => {
    try {
      const message = await Message.findById(req.params.id);

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message not found'
        });
      }

      // Check if user is participant in the conversation
      const conversation = await Conversation.findById(message.conversation);
      if (!conversation.isParticipant(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      await message.markAsRead(req.user._id);

      res.json({
        success: true,
        message: 'Message marked as read'
      });

    } catch (error) {
      console.error('Mark message read error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error marking message as read'
      });
    }
  }
);

// @route   PUT /api/messages/conversations/:id/read-all
// @desc    Mark all messages in conversation as read
// @access  Private
router.put('/conversations/:id/read-all',
  protect,
  validateObjectId('id'),
  async (req, res) => {
    try {
      const conversation = await Conversation.findById(req.params.id);

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      // Check if user is participant
      if (!conversation.isParticipant(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Get all unread messages in conversation
      const unreadMessages = await Message.find({
        conversation: req.params.id,
        sender: { $ne: req.user._id },
        'readBy.user': { $ne: req.user._id },
        isDeleted: false
      });

      // Mark all as read
      const markReadPromises = unreadMessages.map(message =>
        message.markAsRead(req.user._id)
      );

      await Promise.all(markReadPromises);

      res.json({
        success: true,
        message: `${unreadMessages.length} messages marked as read`
      });

    } catch (error) {
      console.error('Mark all messages read error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error marking messages as read'
      });
    }
  }
);

// @route   PUT /api/messages/:id
// @desc    Edit message
// @access  Private
router.put('/:id',
  protect,
  validateObjectId('id'),
  async (req, res) => {
    try {
      const { content } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Message content is required'
        });
      }

      const message = await Message.findById(req.params.id);

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message not found'
        });
      }

      // Check if user is the sender
      if (message.sender._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only edit your own messages'
        });
      }

      // Check if message is too old to edit (e.g., 15 minutes)
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      if (message.createdAt < fifteenMinutesAgo) {
        return res.status(400).json({
          success: false,
          message: 'Message is too old to edit'
        });
      }

      await message.editMessage(content.trim());

      res.json({
        success: true,
        message: 'Message updated successfully',
        data: { message }
      });

    } catch (error) {
      console.error('Message edit error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error editing message'
      });
    }
  }
);

// @route   DELETE /api/messages/:id
// @desc    Delete message
// @access  Private
router.delete('/:id',
  protect,
  validateObjectId('id'),
  async (req, res) => {
    try {
      const message = await Message.findById(req.params.id);

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message not found'
        });
      }

      // Check if user is the sender
      if (message.sender._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own messages'
        });
      }

      await message.deleteMessage();

      res.json({
        success: true,
        message: 'Message deleted successfully'
      });

    } catch (error) {
      console.error('Message deletion error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error deleting message'
      });
    }
  }
);

// @route   GET /api/messages/unread-count
// @desc    Get total unread message count for user
// @access  Private
router.get('/unread-count', protect, async (req, res) => {
  try {
    // Get all conversations user is part of
    const conversations = await Conversation.find({
      participants: req.user._id,
      isActive: true
    }).select('_id');

    const conversationIds = conversations.map(conv => conv._id);

    // Count unread messages across all conversations
    const totalUnread = await Message.countDocuments({
      conversation: { $in: conversationIds },
      sender: { $ne: req.user._id },
      'readBy.user': { $ne: req.user._id },
      isDeleted: false
    });

    res.json({
      success: true,
      data: { totalUnread }
    });

  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching unread count'
    });
  }
});

module.exports = router;
