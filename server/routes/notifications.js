const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../middleware/validation');
const emailService = require('../services/emailService');
const Item = require('../models/Item');
const TalentProduct = require('../models/TalentProduct');
const User = require('../models/User');

// @route   POST /api/notifications/contact-seller
// @desc    Send email to seller about item inquiry
// @access  Private
router.post('/contact-seller', protect, async (req, res) => {
  try {
    const { itemId, talentProductId, message, type } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    if (!type || !['item', 'talent'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "item" or "talent"'
      });
    }

    let product, seller;

    if (type === 'item') {
      if (!itemId) {
        return res.status(400).json({
          success: false,
          message: 'Item ID is required for item inquiries'
        });
      }

      product = await Item.findById(itemId).populate('seller');
      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Item not found or not available'
        });
      }
      seller = product.seller;
    } else {
      if (!talentProductId) {
        return res.status(400).json({
          success: false,
          message: 'Talent product ID is required for talent inquiries'
        });
      }

      product = await TalentProduct.findById(talentProductId).populate('creator');
      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Talent product not found or not available'
        });
      }
      seller = product.creator;
    }

    // Prevent self-contact
    if (seller._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot contact yourself'
      });
    }

    // Send email to seller
    await emailService.sendContactSellerEmail(
      product,
      req.user,
      seller,
      message.trim()
    );

    res.json({
      success: true,
      message: 'Your message has been sent to the seller successfully'
    });

  } catch (error) {
    console.error('Contact seller error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending message to seller'
    });
  }
});

// @route   POST /api/notifications/welcome
// @desc    Send welcome email to new user
// @access  Private (Admin only)
router.post('/welcome', protect, async (req, res) => {
  try {
    const { userId } = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Send welcome email
    await emailService.sendWelcomeEmail(user);

    res.json({
      success: true,
      message: 'Welcome email sent successfully'
    });

  } catch (error) {
    console.error('Send welcome email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending welcome email'
    });
  }
});

// @route   POST /api/notifications/password-reset
// @desc    Send password reset email
// @access  Public
router.post('/password-reset', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset code has been sent.'
      });
    }

    // Generate reset token (6-digit code)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store reset token in user document (you might want to add these fields to User model)
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save({ validateBeforeSave: false });

    // Send password reset email
    await emailService.sendPasswordResetEmail(user, resetToken);

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset code has been sent.'
    });

  } catch (error) {
    console.error('Password reset email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending password reset email'
    });
  }
});

// @route   POST /api/notifications/verify-reset-token
// @desc    Verify password reset token
// @access  Public
router.post('/verify-reset-token', async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({
        success: false,
        message: 'Email and token are required'
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    res.json({
      success: true,
      message: 'Reset token is valid',
      data: { userId: user._id }
    });

  } catch (error) {
    console.error('Verify reset token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error verifying reset token'
    });
  }
});

// @route   POST /api/notifications/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, token, and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error resetting password'
    });
  }
});

// @route   POST /api/notifications/bulk-email
// @desc    Send bulk email to users (Admin only)
// @access  Private (Admin only)
router.post('/bulk-email', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { subject, message, userIds, userType } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required'
      });
    }

    let users = [];

    if (userIds && userIds.length > 0) {
      // Send to specific users
      users = await User.find({ _id: { $in: userIds } });
    } else if (userType) {
      // Send to user type (all, active, sellers, etc.)
      let query = {};
      
      switch (userType) {
        case 'active':
          query = { isActive: true };
          break;
        case 'sellers':
          // Users who have created items
          const sellerIds = await Item.distinct('seller');
          query = { _id: { $in: sellerIds } };
          break;
        case 'creators':
          // Users who have created talent products
          const creatorIds = await TalentProduct.distinct('creator');
          query = { _id: { $in: creatorIds } };
          break;
        default:
          query = { isActive: true };
      }

      users = await User.find(query);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either userIds or userType must be specified'
      });
    }

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No users found to send email to'
      });
    }

    // Send emails (in production, you might want to use a queue for this)
    const emailPromises = users.map(user => {
      const transporter = require('nodemailer').createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      return transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@lpumarketplace.com',
        to: user.email,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">LPU Student Marketplace</h2>
            <p>Hi ${user.name},</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${message}
            </div>
            <p>Thank you for being part of our community!</p>
            <hr style="margin: 30px 0;">
            <p style="color: #6b7280; font-size: 12px;">
              This is an automated email from LPU Student Marketplace.
            </p>
          </div>
        `
      });
    });

    await Promise.allSettled(emailPromises);

    res.json({
      success: true,
      message: `Bulk email sent to ${users.length} users successfully`
    });

  } catch (error) {
    console.error('Bulk email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending bulk email'
    });
  }
});

module.exports = router;
