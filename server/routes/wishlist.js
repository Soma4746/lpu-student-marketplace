const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../middleware/validation');
const User = require('../models/User');
const Item = require('../models/Item');
const TalentProduct = require('../models/TalentProduct');

// @route   GET /api/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get('/', 
  protect,
  validatePagination,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 12,
        type // 'items' or 'talent' or undefined for both
      } = req.query;

      const user = await User.findById(req.user._id)
        .populate({
          path: 'wishlist.items',
          match: { isActive: true },
          select: 'title price images category seller availability createdAt',
          populate: {
            path: 'seller',
            select: 'name avatar'
          }
        })
        .populate({
          path: 'wishlist.talentProducts',
          match: { isActive: true },
          select: 'name price images category creator type createdAt',
          populate: {
            path: 'creator',
            select: 'name avatar'
          }
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      let wishlistItems = [];

      // Combine items and talent products based on type filter
      if (!type || type === 'items') {
        const items = user.wishlist.items.map(item => ({
          ...item.toObject(),
          wishlistType: 'item'
        }));
        wishlistItems = [...wishlistItems, ...items];
      }

      if (!type || type === 'talent') {
        const talentProducts = user.wishlist.talentProducts.map(product => ({
          ...product.toObject(),
          wishlistType: 'talent'
        }));
        wishlistItems = [...wishlistItems, ...talentProducts];
      }

      // Sort by date added to wishlist (most recent first)
      wishlistItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Implement pagination
      const skip = (page - 1) * limit;
      const paginatedItems = wishlistItems.slice(skip, skip + parseInt(limit));
      const total = wishlistItems.length;

      res.json({
        success: true,
        data: {
          wishlist: paginatedItems,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            hasNext: skip + parseInt(limit) < total,
            hasPrev: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Wishlist fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error fetching wishlist'
      });
    }
  }
);

// @route   POST /api/wishlist/items/:itemId
// @desc    Add item to wishlist
// @access  Private
router.post('/items/:itemId',
  protect,
  validateObjectId('itemId'),
  async (req, res) => {
    try {
      const itemId = req.params.itemId;

      // Check if item exists and is active
      const item = await Item.findById(itemId);
      if (!item || !item.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Item not found or not available'
        });
      }

      // Check if user is trying to add their own item
      if (item.seller.toString() === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'You cannot add your own item to wishlist'
        });
      }

      const user = await User.findById(req.user._id);

      // Check if item is already in wishlist
      if (user.wishlist.items.includes(itemId)) {
        return res.status(400).json({
          success: false,
          message: 'Item is already in your wishlist'
        });
      }

      // Add item to wishlist
      user.wishlist.items.push(itemId);
      await user.save();

      res.json({
        success: true,
        message: 'Item added to wishlist successfully'
      });

    } catch (error) {
      console.error('Add to wishlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error adding item to wishlist'
      });
    }
  }
);

// @route   POST /api/wishlist/talent/:productId
// @desc    Add talent product to wishlist
// @access  Private
router.post('/talent/:productId',
  protect,
  validateObjectId('productId'),
  async (req, res) => {
    try {
      const productId = req.params.productId;

      // Check if talent product exists and is active
      const product = await TalentProduct.findById(productId);
      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Talent product not found or not available'
        });
      }

      // Check if user is trying to add their own product
      if (product.creator.toString() === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'You cannot add your own talent product to wishlist'
        });
      }

      const user = await User.findById(req.user._id);

      // Check if product is already in wishlist
      if (user.wishlist.talentProducts.includes(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Talent product is already in your wishlist'
        });
      }

      // Add product to wishlist
      user.wishlist.talentProducts.push(productId);
      await user.save();

      res.json({
        success: true,
        message: 'Talent product added to wishlist successfully'
      });

    } catch (error) {
      console.error('Add talent to wishlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error adding talent product to wishlist'
      });
    }
  }
);

// @route   DELETE /api/wishlist/items/:itemId
// @desc    Remove item from wishlist
// @access  Private
router.delete('/items/:itemId',
  protect,
  validateObjectId('itemId'),
  async (req, res) => {
    try {
      const itemId = req.params.itemId;

      const user = await User.findById(req.user._id);

      // Check if item is in wishlist
      if (!user.wishlist.items.includes(itemId)) {
        return res.status(400).json({
          success: false,
          message: 'Item is not in your wishlist'
        });
      }

      // Remove item from wishlist
      user.wishlist.items = user.wishlist.items.filter(
        id => id.toString() !== itemId
      );
      await user.save();

      res.json({
        success: true,
        message: 'Item removed from wishlist successfully'
      });

    } catch (error) {
      console.error('Remove from wishlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error removing item from wishlist'
      });
    }
  }
);

// @route   DELETE /api/wishlist/talent/:productId
// @desc    Remove talent product from wishlist
// @access  Private
router.delete('/talent/:productId',
  protect,
  validateObjectId('productId'),
  async (req, res) => {
    try {
      const productId = req.params.productId;

      const user = await User.findById(req.user._id);

      // Check if product is in wishlist
      if (!user.wishlist.talentProducts.includes(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Talent product is not in your wishlist'
        });
      }

      // Remove product from wishlist
      user.wishlist.talentProducts = user.wishlist.talentProducts.filter(
        id => id.toString() !== productId
      );
      await user.save();

      res.json({
        success: true,
        message: 'Talent product removed from wishlist successfully'
      });

    } catch (error) {
      console.error('Remove talent from wishlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error removing talent product from wishlist'
      });
    }
  }
);

// @route   DELETE /api/wishlist/clear
// @desc    Clear entire wishlist
// @access  Private
router.delete('/clear', protect, async (req, res) => {
  try {
    const { type } = req.query; // 'items', 'talent', or undefined for both

    const user = await User.findById(req.user._id);

    if (!type || type === 'items') {
      user.wishlist.items = [];
    }

    if (!type || type === 'talent') {
      user.wishlist.talentProducts = [];
    }

    await user.save();

    res.json({
      success: true,
      message: 'Wishlist cleared successfully'
    });

  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error clearing wishlist'
    });
  }
});

// @route   GET /api/wishlist/check/:type/:id
// @desc    Check if item/talent is in wishlist
// @access  Private
router.get('/check/:type/:id',
  protect,
  validateObjectId('id'),
  async (req, res) => {
    try {
      const { type, id } = req.params;

      if (!['items', 'talent'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Type must be either "items" or "talent"'
        });
      }

      const user = await User.findById(req.user._id);

      let isInWishlist = false;
      if (type === 'items') {
        isInWishlist = user.wishlist.items.includes(id);
      } else {
        isInWishlist = user.wishlist.talentProducts.includes(id);
      }

      res.json({
        success: true,
        data: { isInWishlist }
      });

    } catch (error) {
      console.error('Check wishlist error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error checking wishlist'
      });
    }
  }
);

module.exports = router;
