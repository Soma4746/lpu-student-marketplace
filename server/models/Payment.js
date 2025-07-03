const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Basic Payment Info
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Payment Amounts
  totalAmount: {
    type: Number,
    required: true
  },
  platformCommission: {
    type: Number,
    required: true
  },
  sellerAmount: {
    type: Number,
    required: true
  },
  commissionRate: {
    type: Number,
    required: true,
    default: 3 // 3% commission
  },

  // Payment Gateway Details
  gateway: {
    type: String,
    enum: ['razorpay', 'stripe', 'paytm', 'upi'],
    required: true
  },
  gatewayPaymentId: {
    type: String,
    required: true
  },
  gatewayOrderId: {
    type: String
  },
  gatewaySignature: {
    type: String
  },

  // Payment Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'disputed'],
    default: 'pending'
  },
  escrowStatus: {
    type: String,
    enum: ['held', 'released', 'refunded'],
    default: 'held'
  },

  // Verification & Proof
  paymentProof: {
    transactionId: String,
    screenshot: String,
    receiptUrl: String,
    timestamp: Date
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,

  // Delivery Confirmation (for escrow release)
  deliveryConfirmed: {
    type: Boolean,
    default: false
  },
  deliveryConfirmedAt: Date,
  deliveryConfirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Dispute Management
  disputeRaised: {
    type: Boolean,
    default: false
  },
  disputeReason: String,
  disputeRaisedAt: Date,
  disputeResolvedAt: Date,
  disputeResolution: String,

  // Refund Details
  refundAmount: Number,
  refundReason: String,
  refundProcessedAt: Date,
  refundTransactionId: String,

  // Commission Tracking
  commissionPaid: {
    type: Boolean,
    default: false
  },
  commissionPaidAt: Date,
  monthlyCommissionBatch: String,

  // Metadata
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet', 'emi']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  notes: String,
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Indexes for better performance
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ buyer: 1 });
paymentSchema.index({ seller: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ escrowStatus: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ monthlyCommissionBatch: 1 });

// Pre-save middleware to calculate amounts
paymentSchema.pre('save', function(next) {
  if (this.isModified('totalAmount') || this.isModified('commissionRate')) {
    this.platformCommission = Math.round(this.totalAmount * (this.commissionRate / 100));
    this.sellerAmount = this.totalAmount - this.platformCommission;
  }
  next();
});

// Methods
paymentSchema.methods.generatePaymentProof = function() {
  return {
    paymentId: this.paymentId,
    orderId: this.orderId,
    amount: this.totalAmount,
    status: this.status,
    timestamp: this.createdAt,
    gateway: this.gateway,
    transactionId: this.gatewayPaymentId
  };
};

paymentSchema.methods.confirmDelivery = function(confirmedBy) {
  this.deliveryConfirmed = true;
  this.deliveryConfirmedAt = new Date();
  this.deliveryConfirmedBy = confirmedBy;
  this.escrowStatus = 'released';
  return this.save();
};

paymentSchema.methods.raiseDispute = function(reason, raisedBy) {
  this.disputeRaised = true;
  this.disputeReason = reason;
  this.disputeRaisedAt = new Date();
  this.status = 'disputed';
  return this.save();
};

// Static methods
paymentSchema.statics.getMonthlyCommissions = function(year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'completed',
        escrowStatus: 'released'
      }
    },
    {
      $group: {
        _id: null,
        totalCommission: { $sum: '$platformCommission' },
        totalTransactions: { $sum: 1 },
        totalVolume: { $sum: '$totalAmount' }
      }
    }
  ]);
};

paymentSchema.statics.getSellerEarnings = function(sellerId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        seller: mongoose.Types.ObjectId(sellerId),
        createdAt: { $gte: startDate, $lte: endDate },
        escrowStatus: 'released'
      }
    },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: '$sellerAmount' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$totalAmount' }
      }
    }
  ]);
};

module.exports = mongoose.model('Payment', paymentSchema);
