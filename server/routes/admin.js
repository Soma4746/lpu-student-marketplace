const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const { requireSuperAdmin, requireAdminAccess } = require('../middleware/superAdmin');
const { validateObjectId, validatePagination } = require('../middleware/validation');
const User = require('../models/User');
const Item = require('../models/Item');
const TalentProduct = require('../models/TalentProduct');
const Category = require('../models/Category');
const Order = require('../models/Order');

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Super Admin only)
router.get('/dashboard', protect, requireSuperAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalItems,
      activeItems,
      soldItems,
      totalTalentProducts,
      totalOrders,
      totalCategories,
      recentUsers,
      recentItems,
      recentOrders
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Item.countDocuments(),
      Item.countDocuments({ isActive: true, 'availability.status': 'available' }),
      Item.countDocuments({ 'availability.status': 'sold' }),
      TalentProduct.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Category.countDocuments({ isActive: true }),
      User.find({ isActive: true }).sort({ createdAt: -1 }).limit(5).select('name email createdAt'),
      Item.find({ isActive: true }).sort({ createdAt: -1 }).limit(5).select('title price seller createdAt'),
      Order.find().sort({ createdAt: -1 }).limit(5)
    ]);

    // Calculate growth rates (simplified - you might want to implement proper date-based calculations)
    const userGrowthRate = 5.2; // Placeholder
    const itemGrowthRate = 8.7; // Placeholder
    const orderGrowthRate = 12.3; // Placeholder

    res.json({
      success: true,
      data: {
        stats: {
          users: {
            total: totalUsers,
            active: activeUsers,
            growthRate: userGrowthRate
          },
          items: {
            total: totalItems,
            active: activeItems,
            sold: soldItems,
            growthRate: itemGrowthRate
          },
          talentProducts: totalTalentProducts,
          orders: {
            total: totalOrders,
            growthRate: orderGrowthRate
          },
          categories: totalCategories
        },
        recent: {
          users: recentUsers,
          items: recentItems,
          orders: recentOrders
        }
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard data'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users for admin management
// @access  Private (Super Admin only)
router.get('/users',
  protect,
  requireSuperAdmin,
  validatePagination,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        status,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build query
      const query = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { program: { $regex: search, $options: 'i' } }
        ];
      }

      if (status) {
        query.isActive = status === 'active';
      }

      // Sort options
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [users, total] = await Promise.all([
        User.find(query)
          .select('-password')
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit)),
        User.countDocuments(query)
      ]);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalUsers: total,
            usersPerPage: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Admin get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error fetching users'
      });
    }
  }
);

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (activate/deactivate)
// @access  Private (Super Admin only)
router.put('/users/:id/status',
  protect,
  requireSuperAdmin,
  validateObjectId(),
  async (req, res) => {
    try {
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'isActive must be a boolean value'
        });
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: { user }
      });

    } catch (error) {
      console.error('Admin update user status error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error updating user status'
      });
    }
  }
);

// @route   GET /api/admin/items
// @desc    Get all items for admin management
// @access  Private (Super Admin only)
router.get('/items',
  protect,
  requireSuperAdmin,
  validatePagination,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        status,
        reported,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build query
      const query = {};

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      if (status) {
        if (status === 'active') {
          query.isActive = true;
        } else if (status === 'inactive') {
          query.isActive = false;
        } else {
          query['availability.status'] = status;
        }
      }

      if (reported === 'true') {
        query['reports.0'] = { $exists: true };
      }

      // Sort options
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [items, total] = await Promise.all([
        Item.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit)),
        Item.countDocuments(query)
      ]);

      res.json({
        success: true,
        data: {
          items,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalItems: total,
            itemsPerPage: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Admin get items error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error fetching items'
      });
    }
  }
);

// @route   PUT /api/admin/items/:id/status
// @desc    Update item status
// @access  Private (Super Admin only)
router.put('/items/:id/status',
  protect,
  requireSuperAdmin,
  validateObjectId(),
  async (req, res) => {
    try {
      const { isActive, availabilityStatus } = req.body;

      const updates = {};
      if (typeof isActive === 'boolean') {
        updates.isActive = isActive;
      }
      if (availabilityStatus) {
        updates['availability.status'] = availabilityStatus;
      }

      const item = await Item.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true }
      );

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      res.json({
        success: true,
        message: 'Item status updated successfully',
        data: { item }
      });

    } catch (error) {
      console.error('Admin update item status error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error updating item status'
      });
    }
  }
);

// @route   GET /api/admin/reports
// @desc    Get reported items
// @access  Private (Super Admin only)
router.get('/reports',
  protect,
  requireSuperAdmin,
  validatePagination,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        reason,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build query for items with reports
      const query = { 'reports.0': { $exists: true } };

      if (reason) {
        query['reports.reason'] = reason;
      }

      // Sort options
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [items, total] = await Promise.all([
        Item.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit)),
        Item.countDocuments(query)
      ]);

      res.json({
        success: true,
        data: {
          reportedItems: items,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalItems: total,
            itemsPerPage: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Admin get reports error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error fetching reports'
      });
    }
  }
);

// @route   POST /api/admin/items/:id/resolve-reports
// @desc    Resolve reports for an item
// @access  Private (Super Admin only)
router.post('/items/:id/resolve-reports',
  protect,
  requireSuperAdmin,
  validateObjectId(),
  async (req, res) => {
    try {
      const { action } = req.body; // 'dismiss' or 'remove'

      const item = await Item.findById(req.params.id);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found'
        });
      }

      if (action === 'dismiss') {
        // Clear all reports
        item.reports = [];
        await item.save();
      } else if (action === 'remove') {
        // Deactivate the item
        item.isActive = false;
        item.reports = [];
        await item.save();
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Use "dismiss" or "remove"'
        });
      }

      res.json({
        success: true,
        message: `Reports ${action === 'dismiss' ? 'dismissed' : 'resolved and item removed'} successfully`,
        data: { item }
      });

    } catch (error) {
      console.error('Admin resolve reports error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error resolving reports'
      });
    }
  }
);

module.exports = router;
