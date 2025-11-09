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
      profile: user.profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Submit verification request for auction creation
// @route   POST /api/users/verification-request
// @access  Private
router.post('/verification-request', async (req, res) => {
  try {
    const {
      aadhaar,
      pan,
      address,
      city,
      state,
      pincode,
      reason
    } = req.body;

    // Validate required fields
    if (!aadhaar || !pan || !address || !city || !state || !pincode || !reason) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate Aadhaar format (12 digits)
    if (!/^\d{12}$/.test(aadhaar)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Aadhaar number format'
      });
    }

    // Validate PAN format
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PAN number format'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user already has a pending or approved verification
    if (user.verificationRequest && user.verificationRequest.status === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Verification request already pending'
      });
    }

    if (user.verificationRequest && user.verificationRequest.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'User already verified for auction creation'
      });
    }

    // Create verification request
    const verificationRequest = {
      aadhaar,
      pan,
      address: {
        street: address,
        city,
        state,
        pincode
      },
      reason,
      status: 'pending',
      submittedAt: new Date(),
      documents: {
        // In real implementation, handle file uploads here
        aadhaar: 'placeholder_aadhaar.pdf',
        pan: 'placeholder_pan.jpg',
        photo: 'placeholder_photo.jpg'
      }
    };

    user.verificationRequest = verificationRequest;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Verification request submitted successfully',
      data: {
        verificationRequest: {
          status: verificationRequest.status,
          submittedAt: verificationRequest.submittedAt
        }
      }
    });

  } catch (error) {
    console.error('Verification request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Get all verification requests (Admin only)
// @route   GET /api/users/verification-requests
// @access  Private (Admin only)
router.get('/verification-requests', restrictTo('admin'), async (req, res) => {
  try {
    const users = await User.find({
      'verificationRequest.status': { $in: ['pending', 'approved', 'rejected'] }
    }).select('username email verificationRequest createdAt');

    const verificationRequests = users.map(user => ({
      id: user._id,
      userId: user._id,
      username: user.username,
      email: user.email,
      aadhaar: user.verificationRequest.aadhaar,
      pan: user.verificationRequest.pan,
      address: user.verificationRequest.address,
      reason: user.verificationRequest.reason,
      status: user.verificationRequest.status,
      submittedAt: user.verificationRequest.submittedAt,
      reviewedAt: user.verificationRequest.reviewedAt,
      reviewedBy: user.verificationRequest.reviewedBy,
      documents: user.verificationRequest.documents
    }));

    res.status(200).json({
      success: true,
      count: verificationRequests.length,
      data: verificationRequests
    });

  } catch (error) {
    console.error('Get verification requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @desc    Review verification request (Admin only)
// @route   PUT /api/users/verification-requests/:id
// @access  Private (Admin only)
router.put('/verification-requests/:id', restrictTo('admin'), async (req, res) => {
  try {
    const { action, reviewComments } = req.body;
    
    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "approve" or "reject"'
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user || !user.verificationRequest) {
      return res.status(404).json({
        success: false,
        message: 'Verification request not found'
      });
    }

    if (user.verificationRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This verification request has already been reviewed'
      });
    }

    // Update verification request
    user.verificationRequest.status = action === 'approve' ? 'approved' : 'rejected';
    user.verificationRequest.reviewedAt = new Date();
    user.verificationRequest.reviewedBy = req.user.id;
    user.verificationRequest.reviewComments = reviewComments;

    // If approved, set user as verified for auction creation
    if (action === 'approve') {
      user.isVerifiedForAuctions = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Verification request ${action}d successfully`,
      data: {
        verificationRequest: {
          status: user.verificationRequest.status,
          reviewedAt: user.verificationRequest.reviewedAt,
          reviewComments: user.verificationRequest.reviewComments
        }
      }
    });

  } catch (error) {
    console.error('Review verification request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;