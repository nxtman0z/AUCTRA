const { body } = require('express-validator');

// User registration validation
exports.validateSignup = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
    .custom(value => {
      if (value.toLowerCase().includes('admin')) {
        throw new Error('Username cannot contain "admin"');
      }
      return true;
    }),
    
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .custom(value => {
      // Allow only real email domains for production use
      const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
      const emailDomain = value.split('@')[1]?.toLowerCase();
      if (!allowedDomains.includes(emailDomain)) {
        throw new Error('Please use a valid email from Gmail, Yahoo, Outlook, Hotmail, or iCloud');
      }
      return true;
    })
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email must not exceed 100 characters'),
    
  body('password')
    .isLength({ min: 8, max: 50 })
    .withMessage('Password must be between 8 and 50 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)'),
    
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
    
  body('walletAddress')
    .optional()
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Please provide a valid Ethereum wallet address'),
    
  body('terms')
    .isBoolean()
    .withMessage('Terms acceptance must be a boolean')
    .custom(value => {
      if (!value) {
        throw new Error('You must accept the terms and conditions');
      }
      return true;
    })
];

// User login validation
exports.validateLogin = [
  body('login')
    .trim()
    .notEmpty()
    .withMessage('Email or username is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Login must be between 3 and 100 characters'),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6, max: 50 })
    .withMessage('Password must be between 6 and 50 characters')
];

// Admin login validation
exports.validateAdminLogin = [
  body('adminKey')
    .trim()
    .notEmpty()
    .withMessage('Admin key is required')
    .isLength({ min: 10 })
    .withMessage('Invalid admin key format')
];

// Profile update validation
exports.validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name must not exceed 50 characters')
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage('First name can only contain letters and spaces'),
    
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name must not exceed 50 characters')
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage('Last name can only contain letters and spaces'),
    
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
    
  body('walletAddress')
    .optional()
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Please provide a valid Ethereum wallet address')
];

// Password change validation
exports.validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
    
  body('newPassword')
    .isLength({ min: 6, max: 50 })
    .withMessage('New password must be between 6 and 50 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
  body('confirmNewPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('New passwords do not match');
      }
      return true;
    })
];

// Generic validation for MongoDB ObjectId
exports.validateObjectId = (paramName) => [
  body(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`)
];