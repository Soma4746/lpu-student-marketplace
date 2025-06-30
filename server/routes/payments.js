const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');
const Order = require('../models/Order');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @route   POST /api/payments/create-order
// @desc    Create Razorpay order for payment
// @access  Private
router.post('/create-order', protect, async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and amount are required'
      });
    }

    // Verify order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.buyer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This is not your order.'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Order is not in pending status'
      });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `order_${orderId}`,
      notes: {
        orderId: orderId,
        buyerId: req.user._id.toString(),
        sellerId: order.seller._id.toString()
      }
    });

    // Update order with Razorpay order ID
    order.paymentDetails.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      success: true,
      message: 'Razorpay order created successfully',
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID
      }
    });

  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating payment order'
    });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify Razorpay payment
// @access  Private
router.post('/verify', protect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification data'
      });
    }

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.buyer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This is not your order.'
      });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Invalid signature.'
      });
    }

    // Update order with payment details
    order.paymentDetails.razorpayPaymentId = razorpay_payment_id;
    order.paymentDetails.razorpaySignature = razorpay_signature;
    order.status = 'paid';
    await order.save();

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error verifying payment'
    });
  }
});

// @route   POST /api/payments/upi-upload
// @desc    Upload UPI payment screenshot
// @access  Private
router.post('/upi-upload', protect, async (req, res) => {
  try {
    const { orderId, transactionId, screenshot } = req.body;

    if (!orderId || !transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and transaction ID are required'
      });
    }

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.buyer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This is not your order.'
      });
    }

    if (order.paymentMethod !== 'upi') {
      return res.status(400).json({
        success: false,
        message: 'This order is not set for UPI payment'
      });
    }

    // Update order with UPI details
    order.paymentDetails.upiTransactionId = transactionId;
    if (screenshot) {
      order.paymentDetails.screenshot = screenshot;
    }
    order.status = 'paid'; // Mark as paid, seller can verify later
    await order.save();

    res.json({
      success: true,
      message: 'UPI payment details uploaded successfully',
      data: { order }
    });

  } catch (error) {
    console.error('UPI upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading UPI payment details'
    });
  }
});

// @route   GET /api/payments/order/:orderId
// @desc    Get payment details for an order
// @access  Private
router.get('/order/:orderId', 
  protect,
  validateObjectId('orderId'),
  async (req, res) => {
    try {
      const order = await Order.findById(req.params.orderId);

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
          message: 'Access denied. You can only view payment details for your own orders.'
        });
      }

      // Return payment details (sensitive info only to relevant parties)
      const paymentDetails = {
        orderId: order._id,
        amount: order.amount,
        paymentMethod: order.paymentMethod,
        status: order.status,
        createdAt: order.createdAt,
        paymentDetails: {
          razorpayOrderId: order.paymentDetails.razorpayOrderId,
          upiTransactionId: order.paymentDetails.upiTransactionId,
          // Don't expose sensitive payment IDs and signatures to frontend
        }
      };

      res.json({
        success: true,
        data: { payment: paymentDetails }
      });

    } catch (error) {
      console.error('Payment details fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error fetching payment details'
      });
    }
  }
);

// @route   POST /api/payments/refund
// @desc    Process refund (admin/seller only)
// @access  Private
router.post('/refund', protect, async (req, res) => {
  try {
    const { orderId, reason, amount } = req.body;

    if (!orderId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and reason are required'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is seller or admin
    const isSeller = order.seller._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isSeller && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only seller or admin can process refunds.'
      });
    }

    if (order.status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order must be in paid status to process refund'
      });
    }

    // Process refund based on payment method
    if (order.paymentMethod === 'razorpay' && order.paymentDetails.razorpayPaymentId) {
      try {
        const refundAmount = amount ? Math.round(amount * 100) : Math.round(order.amount * 100);
        
        const refund = await razorpay.payments.refund(
          order.paymentDetails.razorpayPaymentId,
          {
            amount: refundAmount,
            notes: {
              reason: reason,
              orderId: orderId
            }
          }
        );

        // Update order status
        order.status = 'refunded';
        order.metadata.refund = {
          refundId: refund.id,
          amount: refund.amount / 100,
          reason: reason,
          processedAt: new Date(),
          processedBy: req.user._id
        };
        await order.save();

        res.json({
          success: true,
          message: 'Refund processed successfully',
          data: { 
            refundId: refund.id,
            amount: refund.amount / 100,
            order 
          }
        });

      } catch (razorpayError) {
        console.error('Razorpay refund error:', razorpayError);
        return res.status(500).json({
          success: false,
          message: 'Failed to process refund through Razorpay'
        });
      }
    } else {
      // For UPI/cash payments, just mark as refunded
      order.status = 'refunded';
      order.metadata.refund = {
        amount: amount || order.amount,
        reason: reason,
        processedAt: new Date(),
        processedBy: req.user._id,
        note: 'Manual refund - processed outside platform'
      };
      await order.save();

      res.json({
        success: true,
        message: 'Order marked as refunded. Manual refund process required.',
        data: { order }
      });
    }

  } catch (error) {
    console.error('Refund processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing refund'
    });
  }
});

module.exports = router;
