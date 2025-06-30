const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewer is required']
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewee is required']
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order is required']
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  },
  talentProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TalentProduct'
  },
  type: {
    type: String,
    enum: ['item', 'talent', 'user'],
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Review title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Review comment cannot exceed 1000 characters']
  },
  images: [{
    type: String // URLs of review images
  }],
  isVerified: {
    type: Boolean,
    default: false // True if the reviewer actually purchased/used the item/service
  },
  helpfulVotes: {
    type: Number,
    default: 0
  },
  votedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    helpful: {
      type: Boolean,
      required: true
    }
  }],
  response: {
    comment: String,
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  moderationNote: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
reviewSchema.index({ reviewee: 1, createdAt: -1 });
reviewSchema.index({ item: 1, createdAt: -1 });
reviewSchema.index({ talentProduct: 1, createdAt: -1 });
reviewSchema.index({ order: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ reviewer: 1, reviewee: 1, order: 1 }, { unique: true }); // Prevent duplicate reviews

// Virtual for review age
reviewSchema.virtual('reviewAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Middleware to populate references
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'reviewer',
    select: 'name avatar'
  }).populate({
    path: 'reviewee',
    select: 'name avatar'
  });
  next();
});

// Method to add helpful vote
reviewSchema.methods.addHelpfulVote = function(userId, isHelpful) {
  // Remove existing vote from this user
  this.votedBy = this.votedBy.filter(vote => 
    vote.user.toString() !== userId.toString()
  );
  
  // Add new vote
  this.votedBy.push({
    user: userId,
    helpful: isHelpful
  });
  
  // Recalculate helpful votes
  this.helpfulVotes = this.votedBy.filter(vote => vote.helpful).length;
  
  return this.save();
};

// Method to add response
reviewSchema.methods.addResponse = function(comment, responderId) {
  this.response = {
    comment: comment,
    respondedAt: new Date(),
    respondedBy: responderId
  };
  return this.save();
};

// Static method to get average rating for a user/item/talent
reviewSchema.statics.getAverageRating = async function(targetId, targetType) {
  let matchCondition = {};
  
  switch (targetType) {
    case 'user':
      matchCondition = { reviewee: targetId };
      break;
    case 'item':
      matchCondition = { item: targetId };
      break;
    case 'talent':
      matchCondition = { talentProduct: targetId };
      break;
    default:
      throw new Error('Invalid target type');
  }

  const stats = await this.aggregate([
    { $match: { ...matchCondition, isActive: true, moderationStatus: 'approved' } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  const result = stats[0];
  
  // Calculate rating distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  result.ratingDistribution.forEach(rating => {
    distribution[rating]++;
  });

  return {
    averageRating: Math.round(result.averageRating * 10) / 10, // Round to 1 decimal
    totalReviews: result.totalReviews,
    ratingDistribution: distribution
  };
};

// Static method to check if user can review
reviewSchema.statics.canUserReview = async function(reviewerId, targetId, targetType, orderId) {
  // Check if order exists and is completed
  const Order = mongoose.model('Order');
  const order = await Order.findById(orderId);
  
  if (!order || order.status !== 'completed') {
    return { canReview: false, reason: 'Order must be completed to leave a review' };
  }

  // Check if reviewer is part of the order
  const isReviewerInOrder = order.buyer.toString() === reviewerId.toString() || 
                           order.seller.toString() === reviewerId.toString();
  
  if (!isReviewerInOrder) {
    return { canReview: false, reason: 'You can only review orders you were part of' };
  }

  // Check if review already exists
  const existingReview = await this.findOne({
    reviewer: reviewerId,
    order: orderId
  });

  if (existingReview) {
    return { canReview: false, reason: 'You have already reviewed this order' };
  }

  return { canReview: true };
};

module.exports = mongoose.model('Review', reviewSchema);
