const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../middleware/validation');
const { uploadConfigs, handleMulterError, processUploadedFiles } = require('../middleware/upload');
const User = require('../models/User');
const Item = require('../models/Item');
const TalentProduct = require('../models/TalentProduct');
const Order = require('../models/Order');

// @route   GET /api/users
// @desc    Get all users (public profiles)
// @access  Public
router.get('/', 
  validatePagination,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        program,
        year
      } = req.query;

      // Build query
      const query = { isActive: true };

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { program: { $regex: search, $options: 'i' } }
        ];
      }

      if (program) {
        query.program = { $regex: program, $options: 'i' };
      }

      if (year) {
        query.year = year;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [users, total] = await Promise.all([
        User.find(query)
          .select('name avatar bio university program year stats.rating stats.itemsSold stats.talentProductsSold createdAt')
          .sort({ 'stats.rating': -1, createdAt: -1 })
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
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error fetching users'
      });
    }
  }
);

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id',
  validateObjectId(),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id)
        .select('-password -email -phone -preferences');

      if (!user || !user.isActive) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get user's active items
      const items = await Item.find({
        seller: user._id,
        isActive: true,
        'availability.status': 'available'
      })
      .select('title price images condition createdAt views likes')
      .sort({ createdAt: -1 })
      .limit(6);

      // Get user's talent products
      const talentProducts = await TalentProduct.find({
        creator: user._id,
        isActive: true
      })
      .select('name price images category type stats.rating stats.orders createdAt')
      .sort({ createdAt: -1 })
      .limit(6);

      res.json({
        success: true,
        data: {
          user,
          items,
          talentProducts
        }
      });

    } catch (error) {
      console.error('Get user profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error fetching user profile'
      });
    }
  }
);

// @route   GET /api/users/:id/items
// @desc    Get user's items
// @access  Public
router.get('/:id/items',
  validateObjectId(),
  validatePagination,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 12,
        status = 'available'
      } = req.query;

      const user = await User.findById(req.params.id);
      if (!user || !user.isActive) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const query = {
        seller: req.params.id,
        isActive: true
      };

      if (status !== 'all') {
        query['availability.status'] = status;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [items, total] = await Promise.all([
        Item.find(query)
          .sort({ createdAt: -1 })
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
      console.error('Get user items error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error fetching user items'
      });
    }
  }
);

// @route   GET /api/users/:id/talent
// @desc    Get user's talent products
// @access  Public
router.get('/:id/talent',
  validateObjectId(),
  validatePagination,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 12
      } = req.query;

      const user = await User.findById(req.params.id);
      if (!user || !user.isActive) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [talentProducts, total] = await Promise.all([
        TalentProduct.find({
          creator: req.params.id,
          isActive: true
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
        TalentProduct.countDocuments({
          creator: req.params.id,
          isActive: true
        })
      ]);

      res.json({
        success: true,
        data: {
          talentProducts,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalProducts: total,
            productsPerPage: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('Get user talent products error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error fetching user talent products'
      });
    }
  }
);

// @route   POST /api/users/upload-avatar
// @desc    Upload user avatar
// @access  Private
router.post('/upload-avatar',
  protect,
  uploadConfigs.avatar.single('avatar'),
  handleMulterError,
  processUploadedFiles('avatars'),
  async (req, res) => {
    try {
      if (!req.uploadedFiles || req.uploadedFiles.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No avatar file provided'
        });
      }

      const avatarUrl = req.uploadedFiles[0].url;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { avatar: avatarUrl },
        { new: true }
      ).select('-password');

      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          user,
          avatarUrl
        }
      });

    } catch (error) {
      console.error('Upload avatar error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error uploading avatar'
      });
    }
  }
);

// @route   GET /api/users/me/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/me/dashboard', protect, async (req, res) => {
  try {
    // Get user's statistics
    const [
      activeItems,
      soldItems,
      talentProducts,
      buyerOrders,
      sellerOrders
    ] = await Promise.all([
      Item.countDocuments({
        seller: req.user._id,
        isActive: true,
        'availability.status': 'available'
      }),
      Item.countDocuments({
        seller: req.user._id,
        'availability.status': 'sold'
      }),
      TalentProduct.countDocuments({
        creator: req.user._id,
        isActive: true
      }),
      Order.find({ buyer: req.user._id }).limit(5).sort({ createdAt: -1 }),
      Order.find({ seller: req.user._id }).limit(5).sort({ createdAt: -1 })
    ]);

    // Get recent items
    const recentItems = await Item.find({
      seller: req.user._id,
      isActive: true
    })
    .select('title price images views likes createdAt availability.status')
    .sort({ createdAt: -1 })
    .limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          activeItems,
          soldItems,
          talentProducts,
          totalViews: recentItems.reduce((sum, item) => sum + item.views, 0),
          totalLikes: recentItems.reduce((sum, item) => sum + item.likes.length, 0)
        },
        recentItems,
        recentBuyerOrders: buyerOrders,
        recentSellerOrders: sellerOrders
      }
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard data'
    });
  }
});

module.exports = router;
