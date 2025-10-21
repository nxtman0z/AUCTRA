const express = require('express');
const authController = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/auth');
const { 
  validateSignup, 
  validateLogin, 
  validateAdminLogin 
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/signup', validateSignup, authController.signup);
router.post('/login', validateLogin, authController.login);
router.post('/admin-login', validateAdminLogin, authController.adminLogin);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', protect, authController.getMe);

// Test route for checking authentication
router.get('/test-auth', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication working!',
    user: {
      id: req.user._id,
      username: req.user.username,
      role: req.user.role
    }
  });
});

// Admin only test route
router.get('/admin-test', protect, restrictTo('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin access working!',
    admin: {
      id: req.user._id,
      username: req.user.username,
      role: req.user.role
    }
  });
});

module.exports = router;