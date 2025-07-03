const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const User = require('../models/User');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_key_secret'
});

class PaymentService {
  // Create Razorpay order
  static async createRazorpayOrder(orderData) {
    try {
      const { orderId, amount, currency = 'INR' } = orderData;
      
      const options = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        receipt: `order_${orderId}`,
        notes: {
          orderId: orderId.toString(),
          platform: 'LPU_Marketplace'
        }
      };

      const razorpayOrder = await razorpay.orders.create(options);
      return razorpayOrder;
    } catch (error) {
      throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }
  }

  // Verify Razorpay payment signature
  static verifyPaymentSignature(paymentData) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;
    
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === razorpay_signature;
  }

  // Process payment and create payment record
  static async processPayment(paymentData) {
    try {
      const {
        orderId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        paymentMethod
      } = paymentData;

      // Verify payment signature
      if (!this.verifyPaymentSignature(paymentData)) {
        throw new Error('Invalid payment signature');
      }

      // Get order details
      const order = await Order.findById(orderId)
        .populate('buyer')
        .populate('seller');

      if (!order) {
        throw new Error('Order not found');
      }

      // Calculate commission (3% default, can be configured)
      const commissionRate = process.env.COMMISSION_RATE || 3;
      const totalAmount = order.totalAmount;
      const platformCommission = Math.round(totalAmount * (commissionRate / 100));
      const sellerAmount = totalAmount - platformCommission;

      // Create payment record
      const payment = new Payment({
        paymentId: `PAY_${Date.now()}_${orderId}`,
        orderId: order._id,
        buyer: order.buyer._id,
        seller: order.seller._id,
        totalAmount,
        platformCommission,
        sellerAmount,
        commissionRate,
        gateway: 'razorpay',
        gatewayPaymentId: razorpay_payment_id,
        gatewayOrderId: razorpay_order_id,
        gatewaySignature: razorpay_signature,
        status: 'completed',
        escrowStatus: 'held', // Hold in escrow until delivery confirmation
        paymentMethod,
        paymentProof: {
          transactionId: razorpay_payment_id,
          timestamp: new Date()
        },
        verificationStatus: 'verified'
      });

      await payment.save();

      // Update order status
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      await order.save();

      // Send notifications
      await this.sendPaymentNotifications(payment, order);

      return payment;
    } catch (error) {
      throw new Error(`Payment processing failed: ${error.message}`);
    }
  }

  // Confirm delivery and release escrow
  static async confirmDeliveryAndReleaseEscrow(paymentId, confirmedBy) {
    try {
      const payment = await Payment.findOne({ paymentId })
        .populate('buyer')
        .populate('seller');

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.escrowStatus !== 'held') {
        throw new Error('Payment is not in escrow');
      }

      // Confirm delivery
      await payment.confirmDelivery(confirmedBy);

      // Update order status
      const order = await Order.findById(payment.orderId);
      order.status = 'delivered';
      order.deliveredAt = new Date();
      await order.save();

      // Send notifications
      await this.sendEscrowReleaseNotifications(payment);

      return payment;
    } catch (error) {
      throw new Error(`Escrow release failed: ${error.message}`);
    }
  }

  // Raise payment dispute
  static async raiseDispute(paymentId, disputeData) {
    try {
      const { reason, raisedBy } = disputeData;
      
      const payment = await Payment.findOne({ paymentId });
      if (!payment) {
        throw new Error('Payment not found');
      }

      await payment.raiseDispute(reason, raisedBy);

      // Send dispute notifications
      await this.sendDisputeNotifications(payment, reason);

      return payment;
    } catch (error) {
      throw new Error(`Dispute creation failed: ${error.message}`);
    }
  }

  // Process refund
  static async processRefund(paymentId, refundData) {
    try {
      const { amount, reason, processedBy } = refundData;
      
      const payment = await Payment.findOne({ paymentId });
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Create Razorpay refund
      const refund = await razorpay.payments.refund(payment.gatewayPaymentId, {
        amount: amount * 100, // Amount in paise
        notes: {
          reason,
          processedBy: processedBy.toString()
        }
      });

      // Update payment record
      payment.status = 'refunded';
      payment.escrowStatus = 'refunded';
      payment.refundAmount = amount;
      payment.refundReason = reason;
      payment.refundProcessedAt = new Date();
      payment.refundTransactionId = refund.id;

      await payment.save();

      // Update order status
      const order = await Order.findById(payment.orderId);
      order.status = 'refunded';
      await order.save();

      return { payment, refund };
    } catch (error) {
      throw new Error(`Refund processing failed: ${error.message}`);
    }
  }

  // Get seller earnings
  static async getSellerEarnings(sellerId, period = 'month') {
    try {
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

      const earnings = await Payment.aggregate([
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
            averageOrderValue: { $avg: '$totalAmount' },
            totalCommissionPaid: { $sum: '$platformCommission' }
          }
        }
      ]);

      const pendingEarnings = await Payment.aggregate([
        {
          $match: {
            seller: mongoose.Types.ObjectId(sellerId),
            escrowStatus: 'held'
          }
        },
        {
          $group: {
            _id: null,
            pendingAmount: { $sum: '$sellerAmount' },
            pendingOrders: { $sum: 1 }
          }
        }
      ]);

      return {
        period,
        earnings: earnings[0] || {
          totalEarnings: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          totalCommissionPaid: 0
        },
        pending: pendingEarnings[0] || {
          pendingAmount: 0,
          pendingOrders: 0
        }
      };
    } catch (error) {
      throw new Error(`Failed to get seller earnings: ${error.message}`);
    }
  }

  // Send payment notifications
  static async sendPaymentNotifications(payment, order) {
    // Implementation for sending email/SMS notifications
    // This would integrate with your notification service
    console.log(`Payment notification sent for payment ${payment.paymentId}`);
  }

  // Send escrow release notifications
  static async sendEscrowReleaseNotifications(payment) {
    console.log(`Escrow release notification sent for payment ${payment.paymentId}`);
  }

  // Send dispute notifications
  static async sendDisputeNotifications(payment, reason) {
    console.log(`Dispute notification sent for payment ${payment.paymentId}: ${reason}`);
  }

  // Generate payment receipt
  static generatePaymentReceipt(payment) {
    return {
      receiptId: `RCP_${payment.paymentId}`,
      paymentId: payment.paymentId,
      orderId: payment.orderId,
      amount: payment.totalAmount,
      commission: payment.platformCommission,
      sellerAmount: payment.sellerAmount,
      gateway: payment.gateway,
      transactionId: payment.gatewayPaymentId,
      timestamp: payment.createdAt,
      status: payment.status
    };
  }
}

module.exports = PaymentService;
