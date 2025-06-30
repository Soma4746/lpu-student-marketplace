const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../middleware/validation');
const Order = require('../models/Order');
const Item = require('../models/Item');
const TalentProduct = require('../models/TalentProduct');
const User = require('../models/User');

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      seller,
      item,
      talentProduct,
      type,
      amount,
      paymentMethod,
      deliveryInfo,
      metadata
    } = req.body;

    // Validate required fields
    if (!seller || !type || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: seller, type, amount, paymentMethod'
      });
    }

    // Validate type and corresponding item/talent
    if (type === 'item' && !item) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required for item orders'
      });
    }

    if (type === 'talent' && !talentProduct) {
      return res.status(400).json({
        success: false,
        message: 'Talent product ID is required for talent orders'
      });
    }

    // Verify seller exists
    const sellerUser = await User.findById(seller);
    if (!sellerUser) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Verify item/talent exists and is available
    let productData = null;
    if (type === 'item') {
      productData = await Item.findById(item);
      if (!productData || !productData.isActive || productData.availability.status !== 'available') {
        return res.status(400).json({
          success: false,
          message: 'Item is not available for purchase'
        });
      }
    } else {
      productData = await TalentProduct.findById(talentProduct);
      if (!productData || !productData.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Talent product is not available for purchase'
        });
      }
    }

    // Prevent self-purchase
    if (seller.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot purchase your own items'
      });
    }

    // Create order
    const order = await Order.create({
      buyer: req.user._id,
      seller,
      item: type === 'item' ? item : undefined,
      talentProduct: type === 'talent' ? talentProduct : undefined,
      type,
      amount,
      paymentMethod,
      deliveryInfo,
      metadata
    });

    // If it's an item order, mark item as pending
    if (type === 'item') {
      await Item.findByIdAndUpdate(item, {
        'availability.status': 'pending',
        'availability.reservedBy': req.user._id,
        'availability.reservedAt': new Date()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating order'
    });
  }
});

// @route   GET /api/orders
// @desc    Get user's orders (buyer or seller)
// @access  Private
router.get('/', 
  protect,
  validatePagination,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        type,
        role = 'buyer' // buyer or seller
      } = req.query;

      // Build query based on role
      const query = {};
      if (role === 'buyer') {
        query.buyer = req.user._id;
      } else if (role === 'seller') {
        query.seller = req.user._id;
      } else {
        // Both buyer and seller orders
        query.$or = [
          { buyer: req.user._id },
          { seller: req.user._id }
        ];
      }

      // Add filters
      if (status) {
        query.status = status;
      }
      if (type) {
        query.type = type;
      }

      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        Order.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Order.countDocuments(query)
      ]);

      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalOrders: total,
            hasNext: page * limit < total,
            hasPrev: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Orders fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error fetching orders'
      });
    }
  }
);

// @route   GET /api/orders/:id
// @desc    Get single order details
// @access  Private
router.get('/:id', 
  protect,
  validateObjectId('id'),
  async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Check if user is buyer or seller
      const isBuyer = order.buyer._id.toString() === req.user._id.toString();
      const isSeller = order.seller._id.toString() === req.user._id.toString();

      if (!isBuyer && !isSeller) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own orders.'
        });
      }

      res.json({
        success: true,
        data: { order }
      });

    } catch (error) {
      console.error('Order fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error fetching order'
      });
    }
  }
);

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private
router.put('/:id/status',
  protect,
  validateObjectId('id'),
  async (req, res) => {
    try {
      const { status, metadata } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Check permissions based on status change
      const isBuyer = order.buyer._id.toString() === req.user._id.toString();
      const isSeller = order.seller._id.toString() === req.user._id.toString();

      // Define who can change what status
      const statusPermissions = {
        'paid': ['buyer'], // Only buyer can mark as paid
        'delivered': ['seller'], // Only seller can mark as delivered
        'completed': ['buyer'], // Only buyer can mark as completed
        'cancelled': ['buyer', 'seller'], // Both can cancel
        'refunded': ['seller'] // Only seller can refund
      };

      const allowedRoles = statusPermissions[status] || [];
      const userRole = isBuyer ? 'buyer' : isSeller ? 'seller' : null;

      if (!userRole || !allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to change order to this status'
        });
      }

      // Update order status
      await order.updateStatus(status, metadata);

      // Handle side effects based on status
      if (status === 'cancelled' && order.type === 'item') {
        // Release item reservation
        await Item.findByIdAndUpdate(order.item._id, {
          'availability.status': 'available',
          $unset: {
            'availability.reservedBy': 1,
            'availability.reservedAt': 1
          }
        });
      } else if (status === 'completed' && order.type === 'item') {
        // Mark item as sold
        await Item.findByIdAndUpdate(order.item._id, {
          'availability.status': 'sold',
          'availability.soldAt': new Date(),
          'availability.soldTo': order.buyer._id
        });
      }

      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: { order }
      });

    } catch (error) {
      console.error('Order status update error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error updating order status'
      });
    }
  }
);

// @route   POST /api/orders/:id/messages
// @desc    Add message to order
// @access  Private
router.post('/:id/messages',
  protect,
  validateObjectId('id'),
  async (req, res) => {
    try {
      const { message } = req.body;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Message content is required'
        });
      }

      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Check if user is buyer or seller
      const isBuyer = order.buyer._id.toString() === req.user._id.toString();
      const isSeller = order.seller._id.toString() === req.user._id.toString();

      if (!isBuyer && !isSeller) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only message on your own orders.'
        });
      }

      // Add message
      await order.addMessage(req.user._id, message.trim());

      res.json({
        success: true,
        message: 'Message added successfully',
        data: { order }
      });

    } catch (error) {
      console.error('Add message error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error adding message'
      });
    }
  }
);

// @route   PUT /api/orders/:id/messages/read
// @desc    Mark messages as read
// @access  Private
router.put('/:id/messages/read',
  protect,
  validateObjectId('id'),
  async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Check if user is buyer or seller
      const isBuyer = order.buyer._id.toString() === req.user._id.toString();
      const isSeller = order.seller._id.toString() === req.user._id.toString();

      if (!isBuyer && !isSeller) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only mark messages as read on your own orders.'
        });
      }

      // Mark messages as read
      await order.markMessagesAsRead(req.user._id);

      res.json({
        success: true,
        message: 'Messages marked as read',
        data: { order }
      });

    } catch (error) {
      console.error('Mark messages read error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error marking messages as read'
      });
    }
  }
);

// @route   GET /api/orders/stats
// @desc    Get order statistics for user
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const { role = 'buyer' } = req.query;

    const buyerStats = await Order.getStats(req.user._id, 'buyer');
    const sellerStats = await Order.getStats(req.user._id, 'seller');

    res.json({
      success: true,
      data: {
        buyer: buyerStats,
        seller: sellerStats
      }
    });

  } catch (error) {
    console.error('Order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching order statistics'
    });
  }
});

module.exports = router;
