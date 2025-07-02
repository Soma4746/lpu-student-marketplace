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

// @route   POST /api/auth/register/student
// @desc    Register a new student
// @access  Public
router.post('/register/student',
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

      // Create student user
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
        bio,
        role: 'user' // Explicitly set as student/user
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

// @route   POST /api/auth/register/admin
// @desc    Register a new admin
// @access  Public (but requires admin code)
router.post('/register/admin',
  sensitiveRateLimit,
  validateLPUEmail,
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        phone,
        employeeId,
        department,
        designation,
        adminType,
        adminCode
      } = req.body;

      // Validate admin code (you can change this to your preferred code)
      const validAdminCodes = ['LPUADMIN2024', 'ADMIN123456', 'SUPERADMIN'];
      if (!validAdminCodes.includes(adminCode)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid admin registration code'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Validate required admin fields
      if (!employeeId || !department || !designation || !adminType) {
        return res.status(400).json({
          success: false,
          message: 'All admin fields are required'
        });
      }

      // Set admin permissions based on admin type
      let permissions = [];
      switch (adminType) {
        case 'Super Admin':
          permissions = [
            'manage_users',
            'manage_items',
            'manage_talent',
            'view_analytics',
            'moderate_content',
            'manage_categories',
            'system_settings'
          ];
          break;
        case 'Department Admin':
          permissions = ['manage_users', 'manage_items', 'view_analytics'];
          break;
        case 'Content Moderator':
          permissions = ['moderate_content', 'manage_items'];
          break;
        case 'User Manager':
          permissions = ['manage_users'];
          break;
        case 'Analytics Viewer':
          permissions = ['view_analytics'];
          break;
        default:
          permissions = ['view_analytics'];
      }

      // Create admin user
      const user = await User.create({
        name,
        email,
        password,
        phone,
        program: department, // Use department as program
        year: 'Staff',
        hostel: 'Staff Quarters',
        room: employeeId,
        role: 'admin',
        permissions,
        // Store admin-specific data in bio for now
        bio: `Employee ID: ${employeeId} | Designation: ${designation} | Admin Type: ${adminType}`
      });

      // Generate token
      const token = generateToken(user._id);

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(201).json({
        success: true,
        message: 'Admin registered successfully',
        data: {
          user: userResponse,
          token
        }
      });

    } catch (error) {
      console.error('Admin registration error:', error);

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Server error during admin registration'
      });
    }
  }
);

// Keep the old register endpoint for backward compatibility
router.post('/register',
  sensitiveRateLimit,
  validateLPUEmail,
  validateUserRegistration,
  async (req, res) => {
    // Redirect to student registration
    req.url = '/register/student';
    return router.handle(req, res);
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
