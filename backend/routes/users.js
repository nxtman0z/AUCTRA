const express = require('express');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth');
const { validateProfileUpdate, validatePasswordChange } = require('../middleware/validation');
const { validationResult } = require('express-validator');

const router = express.Router();

// All routes are protected
router.use(protect);

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          walletAddress: user.walletAddress,
          role: user.role,
          profile: user.profile,
          auctionStats: user.auctionStats,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', validateProfileUpdate, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, bio, walletAddress } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if wallet address is being changed and if it's already taken
    if (walletAddress && walletAddress !== user.walletAddress) {
      const existingUser = await User.findOne({ walletAddress });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Wallet address already registered'
        });
      }
      user.walletAddress = walletAddress;
    }

    // Update profile fields
    if (firstName !== undefined) user.profile.firstName = firstName;
    if (lastName !== undefined) user.profile.lastName = lastName;
    if (bio !== undefined) user.profile.bio = bio;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          walletAddress: user.walletAddress,
          profile: user.profile,
          auctionStats: user.auctionStats
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Wallet address already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
router.put('/change-password', validatePasswordChange, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if current password is correct
    if (!(await user.correctPassword(currentPassword, user.password))) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', restrictTo('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const users = await User.find({ role: 'user' })
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await User.countDocuments({ role: 'user' });
    
    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: { users }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
router.get('/:id', restrictTo('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Deactivate user (Admin only)
// @route   PUT /api/users/:id/deactivate
// @access  Private/Admin
router.put('/:id/deactivate', restrictTo('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot deactivate admin users'
      });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Activate user (Admin only)
// @route   PUT /api/users/:id/activate
// @access  Private/Admin
router.put('/:id/activate', restrictTo('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User activated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', async (req, res) => {
  try {
    const { fullName, phone, address, city, state, pincode, country } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update profile fields
    if (fullName) user.profile.fullName = fullName;
    if (phone) user.profile.phone = phone;
    if (address) user.profile.address = address;
    if (city) user.profile.city = city;
    if (state) user.profile.state = state;
    if (pincode) user.profile.pincode = pincode;
    if (country) user.profile.country = country;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: user.profile,
      kycStatus: user.kyc.status
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Get KYC status
// @route   GET /api/users/kyc-status
// @access  Private
router.get('/kyc-status', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      kycStatus: user.kyc.status,
      kyc: {
        aadhaarNumber: user.kyc.aadhaarNumber ? user.kyc.aadhaarNumber.replace(/.(?=.{4})/g, 'X') : null,
        panNumber: user.kyc.panNumber ? user.kyc.panNumber.replace(/.(?=.{4})/g, 'X') : null,
        submittedAt: user.kyc.submittedAt
      }
    });
  } catch (error) {
    console.error('Get KYC status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Submit KYC documents
// @route   POST /api/users/kyc-submit
// @access  Private
router.post('/kyc-submit', async (req, res) => {
  try {
    const { aadhaarNumber, panNumber } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if KYC already approved
    if (user.kyc.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'KYC already approved'
      });
    }

    // Validate Aadhaar and PAN
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Aadhaar number'
      });
    }

    if (!panNumber || panNumber.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PAN number'
      });
    }

    // Update KYC details
    user.kyc.aadhaarNumber = aadhaarNumber;
    user.kyc.panNumber = panNumber.toUpperCase();
    user.kyc.status = 'submitted';
    user.kyc.submittedAt = new Date();
    
    // In production, you would upload files to cloud storage (AWS S3, Cloudinary, etc.)
    // For now, we'll just store placeholder paths
    user.kyc.aadhaarFront = 'uploads/kyc/aadhaar_front_' + user._id;
    user.kyc.aadhaarBack = 'uploads/kyc/aadhaar_back_' + user._id;
    user.kyc.panCard = 'uploads/kyc/pan_' + user._id;
    user.kyc.selfie = 'uploads/kyc/selfie_' + user._id;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'KYC submitted successfully. Admin will review your documents.',
      kycStatus: user.kyc.status
    });
  } catch (error) {
    console.error('KYC submit error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Apply for admin role
// @route   POST /api/users/apply-admin
// @access  Private
router.post('/apply-admin', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already admin
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You are already an admin'
      });
    }

    // Check if KYC is approved
    if (user.kyc.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Please complete KYC verification before applying for admin role'
      });
    }

    // Check if already applied
    if (user.adminApplication.status === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Your admin application is already pending review'
      });
    }

    // Submit admin application
    user.adminApplication.status = 'pending';
    user.adminApplication.appliedAt = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Admin role application submitted successfully'
    });
  } catch (error) {
    console.error('Apply admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Get pending KYC submissions (Admin only)
// @route   GET /api/users/kyc-pending
// @access  Private/Admin
router.get('/kyc-pending', restrictTo('admin'), async (req, res) => {
  try {
    const users = await User.find({ 'kyc.status': 'submitted' })
      .select('username email profile.fullName kyc')
      .sort({ 'kyc.submittedAt': -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get pending KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Approve/Reject KYC (Admin only)
// @route   PUT /api/users/:id/kyc-review
// @access  Private/Admin
router.put('/:id/kyc-review', restrictTo('admin'), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected'
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.kyc.status = status;
    user.kyc.reviewedAt = new Date();
    user.kyc.reviewedBy = req.user.id;
    
    if (status === 'rejected' && rejectionReason) {
      user.kyc.rejectionReason = rejectionReason;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `KYC ${status} successfully`,
      data: { user }
    });
  } catch (error) {
    console.error('KYC review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Get pending admin applications (Admin only)
// @route   GET /api/users/admin-applications
// @access  Private/Admin
router.get('/admin-applications', restrictTo('admin'), async (req, res) => {
  try {
    const users = await User.find({ 'adminApplication.status': 'pending' })
      .select('username email profile kyc adminApplication')
      .sort({ 'adminApplication.appliedAt': -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get admin applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Approve/Reject admin application (Admin only)
// @route   PUT /api/users/:id/admin-review
// @access  Private/Admin
router.put('/:id/admin-review', restrictTo('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected'
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.adminApplication.status = status;
    user.adminApplication.reviewedAt = new Date();
    user.adminApplication.reviewedBy = req.user.id;
    
    if (status === 'approved') {
      user.role = 'admin';
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Admin application ${status} successfully`,
      data: { user }
    });
  } catch (error) {
    console.error('Admin review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;