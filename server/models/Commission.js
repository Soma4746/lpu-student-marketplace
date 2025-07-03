const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  // Commission Period
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  batchId: {
    type: String,
    required: true,
    unique: true
  },

  // Commission Summary
  totalCommission: {
    type: Number,
    required: true,
    default: 0
  },
  totalTransactions: {
    type: Number,
    required: true,
    default: 0
  },
  totalVolume: {
    type: Number,
    required: true,
    default: 0
  },
  averageCommissionRate: {
    type: Number,
    required: true,
    default: 3
  },

  // Commission Breakdown by Category
  categoryBreakdown: [{
    category: {
      type: String,
      required: true
    },
    commission: {
      type: Number,
      required: true
    },
    transactions: {
      type: Number,
      required: true
    },
    volume: {
      type: Number,
      required: true
    }
  }],

  // Top Sellers (for insights)
  topSellers: [{
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    commissionGenerated: {
      type: Number,
      required: true
    },
    transactions: {
      type: Number,
      required: true
    },
    volume: {
      type: Number,
      required: true
    }
  }],

  // Payment Status
  status: {
    type: String,
    enum: ['calculated', 'processed', 'paid'],
    default: 'calculated'
  },
  processedAt: Date,
  paidAt: Date,

  // Bank Details for Commission Transfer
  bankTransfer: {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    transferId: String,
    transferDate: Date,
    transferAmount: Number
  },

  // Metadata
  notes: String,
  calculatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
commissionSchema.index({ year: 1, month: 1 });
commissionSchema.index({ batchId: 1 });
commissionSchema.index({ status: 1 });
commissionSchema.index({ createdAt: -1 });

// Generate batch ID
commissionSchema.pre('save', function(next) {
  if (!this.batchId) {
    this.batchId = `COMM_${this.year}_${this.month.toString().padStart(2, '0')}_${Date.now()}`;
  }
  next();
});

// Methods
commissionSchema.methods.calculateCommission = async function() {
  const Payment = mongoose.model('Payment');
  
  const startDate = new Date(this.year, this.month - 1, 1);
  const endDate = new Date(this.year, this.month, 0);
  
  // Get total commission for the month
  const summary = await Payment.aggregate([
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
        totalVolume: { $sum: '$totalAmount' },
        avgCommissionRate: { $avg: '$commissionRate' }
      }
    }
  ]);

  if (summary.length > 0) {
    this.totalCommission = summary[0].totalCommission || 0;
    this.totalTransactions = summary[0].totalTransactions || 0;
    this.totalVolume = summary[0].totalVolume || 0;
    this.averageCommissionRate = summary[0].avgCommissionRate || 3;
  }

  // Get category breakdown
  const categoryData = await Payment.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'completed',
        escrowStatus: 'released'
      }
    },
    {
      $lookup: {
        from: 'orders',
        localField: 'orderId',
        foreignField: '_id',
        as: 'order'
      }
    },
    {
      $unwind: '$order'
    },
    {
      $lookup: {
        from: 'items',
        localField: 'order.item',
        foreignField: '_id',
        as: 'item'
      }
    },
    {
      $lookup: {
        from: 'talentproducts',
        localField: 'order.talentProduct',
        foreignField: '_id',
        as: 'talent'
      }
    },
    {
      $addFields: {
        category: {
          $cond: {
            if: { $gt: [{ $size: '$item' }, 0] },
            then: { $arrayElemAt: ['$item.category', 0] },
            else: { $arrayElemAt: ['$talent.category', 0] }
          }
        }
      }
    },
    {
      $group: {
        _id: '$category',
        commission: { $sum: '$platformCommission' },
        transactions: { $sum: 1 },
        volume: { $sum: '$totalAmount' }
      }
    }
  ]);

  this.categoryBreakdown = categoryData.map(cat => ({
    category: cat._id || 'Unknown',
    commission: cat.commission,
    transactions: cat.transactions,
    volume: cat.volume
  }));

  // Get top sellers
  const topSellersData = await Payment.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'completed',
        escrowStatus: 'released'
      }
    },
    {
      $group: {
        _id: '$seller',
        commissionGenerated: { $sum: '$platformCommission' },
        transactions: { $sum: 1 },
        volume: { $sum: '$totalAmount' }
      }
    },
    {
      $sort: { commissionGenerated: -1 }
    },
    {
      $limit: 10
    }
  ]);

  this.topSellers = topSellersData.map(seller => ({
    seller: seller._id,
    commissionGenerated: seller.commissionGenerated,
    transactions: seller.transactions,
    volume: seller.volume
  }));

  return this.save();
};

commissionSchema.methods.markAsProcessed = function(processedBy) {
  this.status = 'processed';
  this.processedAt = new Date();
  this.processedBy = processedBy;
  return this.save();
};

commissionSchema.methods.markAsPaid = function(bankDetails) {
  this.status = 'paid';
  this.paidAt = new Date();
  this.bankTransfer = bankDetails;
  return this.save();
};

// Static methods
commissionSchema.statics.getYearlyCommission = function(year) {
  return this.aggregate([
    {
      $match: { year: year }
    },
    {
      $group: {
        _id: null,
        totalCommission: { $sum: '$totalCommission' },
        totalTransactions: { $sum: '$totalTransactions' },
        totalVolume: { $sum: '$totalVolume' },
        monthlyData: {
          $push: {
            month: '$month',
            commission: '$totalCommission',
            transactions: '$totalTransactions',
            volume: '$totalVolume'
          }
        }
      }
    }
  ]);
};

commissionSchema.statics.createMonthlyCommission = async function(year, month, calculatedBy) {
  const existingCommission = await this.findOne({ year, month });
  if (existingCommission) {
    throw new Error('Commission for this month already exists');
  }

  const commission = new this({
    year,
    month,
    calculatedBy
  });

  await commission.calculateCommission();
  return commission;
};

module.exports = mongoose.model('Commission', commissionSchema);
