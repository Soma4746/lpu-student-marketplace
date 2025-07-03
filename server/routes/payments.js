const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const PaymentService = require('../services/paymentService');
const Payment = require('../models/Payment');
const Commission = require('../models/Commission');

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

    const razorpayOrder = await PaymentService.createRazorpayOrder({
      orderId,
      amount
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify and process payment
// @access  Private
router.post('/verify', protect, async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentMethod
    } = req.body;

    const payment = await PaymentService.processPayment({
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentMethod
    });

    const receipt = PaymentService.generatePaymentReceipt(payment);

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        payment,
        receipt
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/payments/:paymentId/confirm-delivery
// @desc    Confirm delivery and release escrow
// @access  Private
router.post('/:paymentId/confirm-delivery', protect, async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await PaymentService.confirmDeliveryAndReleaseEscrow(
      paymentId,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: 'Delivery confirmed and payment released to seller',
      data: payment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/payments/:paymentId/dispute
// @desc    Raise payment dispute
// @access  Private
router.post('/:paymentId/dispute', protect, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Dispute reason is required'
      });
    }

    const payment = await PaymentService.raiseDispute(paymentId, {
      reason,
      raisedBy: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Dispute raised successfully',
      data: payment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/payments/my-earnings
// @desc    Get seller earnings
// @access  Private
router.get('/my-earnings', protect, async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    const earnings = await PaymentService.getSellerEarnings(req.user._id, period);

    res.status(200).json({
      success: true,
      data: earnings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/payments/my-payments
// @desc    Get user's payment history
// @access  Private
router.get('/my-payments', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, type = 'all' } = req.query;

    let query = {};

    if (type === 'purchases') {
      query.buyer = req.user._id;
    } else if (type === 'sales') {
      query.seller = req.user._id;
    } else {
      query.$or = [
        { buyer: req.user._id },
        { seller: req.user._id }
      ];
    }

    const payments = await Payment.find(query)
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .populate('orderId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/payments/:paymentId/receipt
// @desc    Get payment receipt
// @access  Private
router.get('/:paymentId/receipt', protect, async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findOne({ paymentId })
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .populate('orderId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user is authorized to view this receipt
    if (payment.buyer._id.toString() !== req.user._id.toString() &&
        payment.seller._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this receipt'
      });
    }

    const receipt = PaymentService.generatePaymentReceipt(payment);

    res.status(200).json({
      success: true,
      data: {
        receipt,
        payment
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Admin Routes

// @route   POST /api/payments/:paymentId/refund
// @desc    Process refund (Admin only)
// @access  Private (Admin)
router.post('/:paymentId/refund', protect, admin, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;

    if (!amount || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Amount and reason are required'
      });
    }

    const result = await PaymentService.processRefund(paymentId, {
      amount,
      reason,
      processedBy: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/payments/admin/dashboard
// @desc    Get payment dashboard for admin
// @access  Private (Admin)
router.get('/admin/dashboard', protect, admin, async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        endDate = now;
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    // Get payment statistics
    const stats = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalCommission: { $sum: '$platformCommission' },
          totalTransactions: { $sum: 1 },
          completedTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          pendingEscrow: {
            $sum: { $cond: [{ $eq: ['$escrowStatus', 'held'] }, '$sellerAmount', 0] }
          },
          releasedEscrow: {
            $sum: { $cond: [{ $eq: ['$escrowStatus', 'released'] }, '$sellerAmount', 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        stats: stats[0] || {
          totalRevenue: 0,
          totalCommission: 0,
          totalTransactions: 0,
          completedTransactions: 0,
          pendingEscrow: 0,
          releasedEscrow: 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
