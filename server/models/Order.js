const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer is required']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller is required']
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
    enum: ['item', 'talent'],
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'upi', 'cash', 'other'],
    required: true
  },
  paymentDetails: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    upiTransactionId: String,
    screenshot: String // For UPI payments
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'delivered', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  deliveryInfo: {
    type: {
      type: String,
      enum: ['pickup', 'delivery', 'digital', 'service']
    },
    address: String,
    phone: String,
    instructions: String,
    estimatedDelivery: Date,
    actualDelivery: Date
  },
  communication: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: [500, 'Message cannot exceed 500 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  rating: {
    buyerRating: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      createdAt: Date
    },
    sellerRating: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      createdAt: Date
    }
  },
  metadata: {
    packageSelected: String, // For talent products with packages
    customRequirements: String,
    files: [String], // URLs of delivered files
    notes: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for order age
orderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Indexes
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, createdAt: -1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'paymentDetails.razorpayOrderId': 1 });

// Pre-save middleware to generate order ID
orderSchema.pre('save', function(next) {
  if (this.isNew && !this.orderId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.orderId = `LPU${timestamp}${random}`.toUpperCase();
  }
  next();
});

// Middleware to populate references
orderSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'buyer',
    select: 'name email phone avatar'
  }).populate({
    path: 'seller',
    select: 'name email phone avatar whatsapp upiId'
  }).populate({
    path: 'item',
    select: 'title images price category'
  }).populate({
    path: 'talentProduct',
    select: 'name images price category type'
  });
  next();
});

// Method to add communication message
orderSchema.methods.addMessage = function(fromUserId, message) {
  this.communication.push({
    from: fromUserId,
    message: message
  });
  return this.save();
};

// Method to mark messages as read
orderSchema.methods.markMessagesAsRead = function(userId) {
  this.communication.forEach(msg => {
    if (msg.from.toString() !== userId.toString()) {
      msg.isRead = true;
    }
  });
  return this.save();
};

// Method to update status
orderSchema.methods.updateStatus = function(newStatus, metadata = {}) {
  this.status = newStatus;
  
  // Update metadata based on status
  if (newStatus === 'delivered' && !this.deliveryInfo.actualDelivery) {
    this.deliveryInfo.actualDelivery = new Date();
  }
  
  // Merge additional metadata
  this.metadata = { ...this.metadata, ...metadata };
  
  return this.save();
};

// Static method to get order statistics
orderSchema.statics.getStats = async function(userId, userType = 'buyer') {
  const matchCondition = userType === 'buyer' ? { buyer: userId } : { seller: userId };
  
  const stats = await this.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalOrders: 0,
    totalAmount: 0,
    completedOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0
  };
};

module.exports = mongoose.model('Order', orderSchema);
