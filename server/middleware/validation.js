const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be 10 digits'),
  
  body('program')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Program name cannot exceed 100 characters'),
  
  body('year')
    .optional()
    .isIn(['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Other'])
    .withMessage('Invalid year selection'),
  
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be 10 digits'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  
  body('whatsapp')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('WhatsApp number must be 10 digits'),
  
  body('upiId')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('UPI ID cannot exceed 100 characters'),
  
  handleValidationErrors
];

// Item validation rules
const validateItemCreation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('price')
    .isFloat({ min: 0, max: 1000000 })
    .withMessage('Price must be between 0 and 10,00,000'),
  
  body('originalPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Original price must be a positive number'),
  
  body('category')
    .isMongoId()
    .withMessage('Invalid category ID'),
  
  body('condition')
    .isIn(['New', 'Like New', 'Good', 'Fair', 'Poor'])
    .withMessage('Invalid condition'),
  
  body('negotiable')
    .optional()
    .isBoolean()
    .withMessage('Negotiable must be true or false'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot exceed 30 characters'),
  
  handleValidationErrors
];

// Talent product validation rules
const validateTalentProductCreation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Product name must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  
  body('price')
    .isFloat({ min: 0, max: 100000 })
    .withMessage('Price must be between 0 and 1,00,000'),
  
  body('category')
    .isIn(['Art', 'Craft', 'Code', 'Design', 'Writing', 'Music', 'Photography', 'Video', 'Tutoring', 'Other'])
    .withMessage('Invalid category'),
  
  body('type')
    .isIn(['physical', 'digital', 'service'])
    .withMessage('Invalid product type'),
  
  body('deliveryType')
    .isIn(['instant', 'within_24h', '1-3_days', '3-7_days', 'custom'])
    .withMessage('Invalid delivery type'),
  
  body('customDeliveryTime')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Custom delivery time cannot exceed 100 characters'),
  
  handleValidationErrors
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  query('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  
  query('condition')
    .optional()
    .isIn(['New', 'Like New', 'Good', 'Fair', 'Poor'])
    .withMessage('Invalid condition'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'price', 'views', 'likes'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`),
  
  handleValidationErrors
];

// Custom validation for file uploads
const validateFileUpload = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'At least one file is required'
    });
  }
  
  // Check file types and sizes
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  for (const file of req.files) {
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `Invalid file type: ${file.mimetype}. Allowed types: JPEG, PNG, WebP, PDF`
      });
    }
    
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `File too large: ${file.originalname}. Maximum size: 5MB`
      });
    }
  }
  
  next();
};

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateItemCreation,
  validateTalentProductCreation,
  validatePagination,
  validateSearch,
  validateObjectId,
  validateFileUpload,
  handleValidationErrors
};
