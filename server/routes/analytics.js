const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const User = require('../models/User');
const Item = require('../models/Item');
const TalentProduct = require('../models/TalentProduct');
const Order = require('../models/Order');
const Review = require('../models/Review');

// @route   GET /api/analytics/dashboard
// @desc    Get analytics dashboard data
// @access  Private (Admin only)
router.get('/dashboard', protect, admin, async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const [
      totalUsers,
      newUsers,
      totalItems,
      newItems,
      totalOrders,
      newOrders,
      totalRevenue,
      newRevenue,
      averageOrderValue,
      topCategories,
      userGrowth,
      orderTrends,
      revenueByDay
    ] = await Promise.all([
      // Total counts
      User.countDocuments({ isActive: true }),
      User.countDocuments({ createdAt: { $gte: startDate }, isActive: true }),
      Item.countDocuments({ isActive: true }),
      Item.countDocuments({ createdAt: { $gte: startDate }, isActive: true }),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startDate } }),
      
      // Revenue calculations
      Order.aggregate([
        { $match: { status: { $in: ['paid', 'delivered', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: startDate },
            status: { $in: ['paid', 'delivered', 'completed'] }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      
      // Average order value
      Order.aggregate([
        { $match: { status: { $in: ['paid', 'delivered', 'completed'] } } },
        { $group: { _id: null, avg: { $avg: '$amount' } } }
      ]),

      // Top categories
      Item.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // User growth over time
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Order trends
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            count: { $sum: 1 },
            revenue: { $sum: '$amount' }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Revenue by day
      Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: startDate },
            status: { $in: ['paid', 'delivered', 'completed'] }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            revenue: { $sum: '$amount' }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          newUsers,
          totalItems,
          newItems,
          totalOrders,
          newOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          newRevenue: newRevenue[0]?.total || 0,
          averageOrderValue: averageOrderValue[0]?.avg || 0
        },
        charts: {
          topCategories,
          userGrowth,
          orderTrends,
          revenueByDay
        },
        period
      }
    });

  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching analytics data'
    });
  }
});

// @route   GET /api/analytics/user-stats/:userId
// @desc    Get user-specific analytics
// @access  Private
router.get('/user-stats/:userId', protect, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if user is requesting their own stats or is admin
    if (userId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own statistics.'
      });
    }

    const [
      buyerStats,
      sellerStats,
      itemStats,
      talentStats,
      reviewStats,
      recentActivity
    ] = await Promise.all([
      // Buyer statistics
      Order.getStats(userId, 'buyer'),
      
      // Seller statistics
      Order.getStats(userId, 'seller'),
      
      // Item statistics
      Item.aggregate([
        { $match: { seller: userId } },
        {
          $group: {
            _id: null,
            totalItems: { $sum: 1 },
            activeItems: { $sum: { $cond: ['$isActive', 1, 0] } },
            soldItems: { 
              $sum: { 
                $cond: [{ $eq: ['$availability.status', 'sold'] }, 1, 0] 
              }
            },
            totalViews: { $sum: '$stats.views' },
            totalWishlisted: { $sum: '$stats.wishlisted' }
          }
        }
      ]),

      // Talent product statistics
      TalentProduct.aggregate([
        { $match: { creator: userId } },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            activeProducts: { $sum: { $cond: ['$isActive', 1, 0] } },
            totalViews: { $sum: '$stats.views' },
            totalOrders: { $sum: '$stats.orders' }
          }
        }
      ]),

      // Review statistics
      Review.aggregate([
        { $match: { reviewee: userId, isActive: true } },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            averageRating: { $avg: '$rating' },
            ratingDistribution: {
              $push: '$rating'
            }
          }
        }
      ]),

      // Recent activity (last 30 days)
      Promise.all([
        Order.find({
          $or: [{ buyer: userId }, { seller: userId }],
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }).sort({ createdAt: -1 }).limit(10),
        
        Item.find({
          seller: userId,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }).sort({ createdAt: -1 }).limit(5),
        
        Review.find({
          reviewee: userId,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }).sort({ createdAt: -1 }).limit(5)
      ])
    ]);

    // Process rating distribution
    let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (reviewStats[0]?.ratingDistribution) {
      reviewStats[0].ratingDistribution.forEach(rating => {
        ratingDistribution[rating]++;
      });
    }

    res.json({
      success: true,
      data: {
        buyer: buyerStats,
        seller: sellerStats,
        items: itemStats[0] || {
          totalItems: 0,
          activeItems: 0,
          soldItems: 0,
          totalViews: 0,
          totalWishlisted: 0
        },
        talent: talentStats[0] || {
          totalProducts: 0,
          activeProducts: 0,
          totalViews: 0,
          totalOrders: 0
        },
        reviews: {
          totalReviews: reviewStats[0]?.totalReviews || 0,
          averageRating: reviewStats[0]?.averageRating || 0,
          ratingDistribution
        },
        recentActivity: {
          orders: recentActivity[0],
          items: recentActivity[1],
          reviews: recentActivity[2]
        }
      }
    });

  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user statistics'
    });
  }
});

// @route   GET /api/analytics/popular-items
// @desc    Get popular items analytics
// @access  Public
router.get('/popular-items', async (req, res) => {
  try {
    const { period = '30d', limit = 10 } = req.query;

    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const [mostViewed, mostWishlisted, recentlyAdded] = await Promise.all([
      // Most viewed items
      Item.find({
        isActive: true,
        createdAt: { $gte: startDate }
      })
      .sort({ 'stats.views': -1 })
      .limit(parseInt(limit))
      .populate('seller', 'name avatar')
      .select('title price images category stats'),

      // Most wishlisted items
      Item.find({
        isActive: true,
        createdAt: { $gte: startDate }
      })
      .sort({ 'stats.wishlisted': -1 })
      .limit(parseInt(limit))
      .populate('seller', 'name avatar')
      .select('title price images category stats'),

      // Recently added popular items
      Item.find({
        isActive: true,
        createdAt: { $gte: startDate },
        'stats.views': { $gte: 10 }
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('seller', 'name avatar')
      .select('title price images category stats createdAt')
    ]);

    res.json({
      success: true,
      data: {
        mostViewed,
        mostWishlisted,
        recentlyAdded,
        period
      }
    });

  } catch (error) {
    console.error('Popular items analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching popular items analytics'
    });
  }
});

module.exports = router;
