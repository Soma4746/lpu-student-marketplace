const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  type: {
    type: String,
    enum: ['direct', 'group', 'order'],
    default: 'direct'
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Conversation title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Conversation description cannot exceed 500 characters']
  },
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  relatedItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  },
  relatedTalentProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TalentProduct'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    allowNewMembers: {
      type: Boolean,
      default: false
    },
    muteNotifications: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      mutedUntil: Date
    }]
  },
  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    tags: [String],
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
conversationSchema.index({ participants: 1, lastActivity: -1 });
conversationSchema.index({ relatedOrder: 1 });
conversationSchema.index({ relatedItem: 1 });
conversationSchema.index({ relatedTalentProduct: 1 });
conversationSchema.index({ type: 1, isActive: 1 });

// Virtual for participant count
conversationSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Middleware to populate references
conversationSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'participants',
    select: 'name avatar lastActive'
  }).populate({
    path: 'lastMessage',
    select: 'content sender createdAt type',
    populate: {
      path: 'sender',
      select: 'name'
    }
  }).populate({
    path: 'relatedOrder',
    select: 'orderId amount status'
  }).populate({
    path: 'relatedItem',
    select: 'title price images'
  }).populate({
    path: 'relatedTalentProduct',
    select: 'name price images'
  });
  next();
});

// Method to add participant
conversationSchema.methods.addParticipant = function(userId) {
  if (!this.participants.includes(userId)) {
    this.participants.push(userId);
    this.lastActivity = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove participant
conversationSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(
    id => id.toString() !== userId.toString()
  );
  this.lastActivity = new Date();
  return this.save();
};

// Method to update last activity
conversationSchema.methods.updateLastActivity = function(messageId = null) {
  this.lastActivity = new Date();
  if (messageId) {
    this.lastMessage = messageId;
  }
  return this.save();
};

// Method to check if user is participant
conversationSchema.methods.isParticipant = function(userId) {
  return this.participants.some(id => id.toString() === userId.toString());
};

// Method to mute notifications for user
conversationSchema.methods.muteNotifications = function(userId, duration = null) {
  // Remove existing mute setting for this user
  this.settings.muteNotifications = this.settings.muteNotifications.filter(
    mute => mute.user.toString() !== userId.toString()
  );

  // Add new mute setting
  const muteUntil = duration ? new Date(Date.now() + duration) : null;
  this.settings.muteNotifications.push({
    user: userId,
    mutedUntil: muteUntil
  });

  return this.save();
};

// Method to unmute notifications for user
conversationSchema.methods.unmuteNotifications = function(userId) {
  this.settings.muteNotifications = this.settings.muteNotifications.filter(
    mute => mute.user.toString() !== userId.toString()
  );
  return this.save();
};

// Static method to find or create conversation between users
conversationSchema.statics.findOrCreateDirectConversation = async function(user1Id, user2Id, relatedData = {}) {
  // Look for existing direct conversation between these users
  let conversation = await this.findOne({
    type: 'direct',
    participants: { $all: [user1Id, user2Id], $size: 2 },
    isActive: true
  });

  if (!conversation) {
    // Create new conversation
    conversation = await this.create({
      participants: [user1Id, user2Id],
      type: 'direct',
      relatedOrder: relatedData.orderId,
      relatedItem: relatedData.itemId,
      relatedTalentProduct: relatedData.talentProductId,
      metadata: {
        createdBy: user1Id
      }
    });
  }

  return conversation;
};

// Static method to get conversations for user
conversationSchema.statics.getUserConversations = async function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    type,
    search
  } = options;

  const query = {
    participants: userId,
    isActive: true
  };

  if (type) {
    query.type = type;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  const [conversations, total] = await Promise.all([
    this.find(query)
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    this.countDocuments(query)
  ]);

  return {
    conversations,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalConversations: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};

module.exports = mongoose.model('Conversation', conversationSchema);
