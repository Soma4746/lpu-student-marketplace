// Super Admin Access Control Middleware
// Only specific emails can access admin features

const SUPER_ADMIN_EMAILS = [
  'somasree4746@gmail.com',  // Your email
  'admin@lpu.co.in',         // Default admin account
  // Add more authorized emails here if needed
];

/**
 * Check if user has super admin access
 * @param {string} email - User's email address
 * @returns {boolean} - true if user has super admin access
 */
const isSuperAdmin = (email) => {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
};

/**
 * Middleware to check super admin access
 * User must be authenticated, have admin role, AND be in super admin list
 */
const requireSuperAdmin = (req, res, next) => {
  try {
    // Check if user is authenticated (should be handled by protect middleware first)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Check if user is in super admin list
    if (!isSuperAdmin(req.user.email)) {
      return res.status(403).json({
        success: false,
        message: 'Super admin access required. You do not have permission to access this resource.'
      });
    }

    // User has super admin access
    next();
  } catch (error) {
    console.error('Super admin check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authorization'
    });
  }
};

/**
 * Middleware to check if user can access admin features (less strict)
 * Used for routes that should be available to admins but with super admin restrictions
 */
const requireAdminAccess = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // For admin routes, require both admin role AND super admin email
    if (req.user.role !== 'admin' || !isSuperAdmin(req.user.email)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin privileges required.'
      });
    }

    next();
  } catch (error) {
    console.error('Admin access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authorization'
    });
  }
};

module.exports = {
  requireSuperAdmin,
  requireAdminAccess,
  isSuperAdmin,
  SUPER_ADMIN_EMAILS
};
