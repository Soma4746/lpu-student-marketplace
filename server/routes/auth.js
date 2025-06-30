const express = require('express');
const router = express.Router();
const { 
  protect, 
  generateToken, 
  sensitiveRateLimit,
  validateLPUEmail 
} = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin
} = require('../middleware/validation');
const User = require('../models/User');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', 
  sensitiveRateLimit,
  validateLPUEmail,
  validateUserRegistration,
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        phone,
        program,
        year,
        hostel,
        room,
        whatsapp,
        bio
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Create user
      const user = await User.create({
        name,
        email,
        password,
        phone,
        program,
        year,
        hostel,
        room,
        whatsapp,
        bio
      });

      // Generate token
      const token = generateToken(user._id);

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: userResponse,
          token
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Server error during registration'
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login',
  sensitiveRateLimit,
  validateUserLogin,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact support.'
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Update last active
      await user.updateLastActive();

      // Generate token
      const token = generateToken(user._id);

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          token
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during login'
      });
    }
  }
);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('items', 'title price images createdAt availability.status')
      .populate('talentProducts', 'name price images createdAt stats.orders');

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const allowedUpdates = [
      'name', 'phone', 'bio', 'program', 'year', 'hostel', 'room',
      'whatsapp', 'upiId', 'socialLinks', 'preferences'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', 
  protect,
  sensitiveRateLimit,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
      }

      // Get user with password
      const user = await User.findById(req.user._id).select('+password');

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error changing password'
      });
    }
  }
);

// @route   POST /api/auth/deactivate
// @desc    Deactivate user account
// @access  Private
router.post('/deactivate', 
  protect,
  sensitiveRateLimit,
  async (req, res) => {
    try {
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required to deactivate account'
        });
      }

      // Get user with password
      const user = await User.findById(req.user._id).select('+password');

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Password is incorrect'
        });
      }

      // Deactivate account
      user.isActive = false;
      await user.save();

      res.json({
        success: true,
        message: 'Account deactivated successfully'
      });

    } catch (error) {
      console.error('Account deactivation error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error deactivating account'
      });
    }
  }
);

// @route   GET /api/auth/verify-token
// @desc    Verify if token is valid
// @access  Private
router.get('/verify-token', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: req.user
    }
  });
});

module.exports = router;
