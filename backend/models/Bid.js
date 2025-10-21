const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  // Auction Reference
  auctionId: {
    type: Number,
    required: true,
    index: true
  },
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true,
    index: true
  },

  // Bidder Information
  bidder: {
    address: {
      type: String,
      required: true,
      match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format'],
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    username: {
      type: String,
      required: true
    }
  },

  // Bid Details
  bidAmount: {
    type: Number,
    required: [true, 'Bid amount is required'],
    min: [0, 'Bid amount must be positive']
  },
  previousHighestBid: {
    type: Number,
    default: 0
  },
  bidIncrement: {
    type: Number,
    required: true,
    min: [0.001, 'Bid increment must be at least 0.001 ETH']
  },

  // Blockchain Information
  transactionHash: {
    type: String,
    required: true,
    unique: true,
    match: [/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash format'],
    index: true
  },
  blockNumber: {
    type: Number,
    required: true,
    index: true
  },
  blockHash: {
    type: String,
    match: [/^0x[a-fA-F0-9]{64}$/, 'Invalid block hash format']
  },
  gasUsed: {
    type: Number,
    required: true
  },
  gasPrice: {
    type: String, // Wei as string to handle large numbers
    required: true
  },
  networkId: {
    type: Number,
    default: 1 // Ethereum mainnet
  },

  // Bid Status
  status: {
    type: String,
    enum: ['active', 'outbid', 'winning', 'won', 'refunded', 'failed'],
    default: 'active'
  },
  isCurrentHighest: {
    type: Boolean,
    default: false,
    index: true
  },
  isWinningBid: {
    type: Boolean,
    default: false
  },

  // Refund Information
  refunded: {
    isRefunded: {
      type: Boolean,
      default: false,
      index: true
    },
    refundAmount: {
      type: Number,
      default: 0
    },
    refundTransactionHash: {
      type: String,
      match: [/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash format']
    },
    refundedAt: Date,
    refundBlockNumber: Number
  },

  // Timing
  placedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  auctionTimeRemaining: {
    type: Number // seconds remaining when bid was placed
  },

  // Validation & Verification
  verified: {
    type: Boolean,
    default: false // Verified on blockchain
  },
  validationErrors: [{
    error: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],

  // Metadata
  bidderIP: {
    type: String,
    select: false // Hidden by default for privacy
  },
  userAgent: {
    type: String,
    select: false // Hidden by default
  },
  source: {
    type: String,
    enum: ['web', 'mobile', 'api'],
    default: 'web'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better performance
bidSchema.index({ auctionId: 1, bidAmount: -1 });
bidSchema.index({ auctionId: 1, placedAt: -1 });
bidSchema.index({ 'bidder.address': 1, placedAt: -1 });
bidSchema.index({ 'bidder.userId': 1, status: 1 });
bidSchema.index({ status: 1, isCurrentHighest: 1 });
bidSchema.index({ transactionHash: 1 }, { unique: true });

// Virtual for bid rank (position in auction)
bidSchema.virtual('bidRank').get(function() {
  // This would be calculated when querying
  return this._bidRank || 0;
});

// Virtual for time since bid
bidSchema.virtual('timeSinceBid').get(function() {
  return new Date() - this.placedAt;
});

// Virtual for formatted bid amount
bidSchema.virtual('formattedBidAmount').get(function() {
  return `${this.bidAmount} ETH`;
});

// Static method to get auction bids
bidSchema.statics.getAuctionBids = function(auctionId, limit = 50, skip = 0) {
  return this.find({ auctionId })
    .populate('bidder.userId', 'username profile')
    .sort({ bidAmount: -1, placedAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get current highest bid
bidSchema.statics.getCurrentHighestBid = function(auctionId) {
  return this.findOne({ 
    auctionId, 
    isCurrentHighest: true,
    status: { $in: ['active', 'winning'] }
  })
  .populate('bidder.userId', 'username profile');
};

// Static method to get user's bids
bidSchema.statics.getUserBids = function(userId, status = null, limit = 50, skip = 0) {
  const query = { 'bidder.userId': userId };
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('auction', 'title auctionId status endTime')
    .sort({ placedAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get bids by address
bidSchema.statics.getBidsByAddress = function(address, limit = 50, skip = 0) {
  return this.find({ 'bidder.address': address })
    .populate('auction', 'title auctionId status endTime')
    .populate('bidder.userId', 'username profile')
    .sort({ placedAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get refundable bids
bidSchema.statics.getRefundableBids = function(auctionId) {
  return this.find({ 
    auctionId,
    status: 'outbid',
    'refunded.isRefunded': false
  })
  .populate('bidder.userId', 'username profile');
};

// Instance method to mark as outbid
bidSchema.methods.markAsOutbid = function() {
  this.status = 'outbid';
  this.isCurrentHighest = false;
  return this.save();
};

// Instance method to mark as winning
bidSchema.methods.markAsWinning = function() {
  this.status = 'winning';
  this.isCurrentHighest = true;
  this.isWinningBid = true;
  return this.save();
};

// Instance method to process refund
bidSchema.methods.processRefund = function(transactionHash, blockNumber) {
  this.refunded.isRefunded = true;
  this.refunded.refundAmount = this.bidAmount;
  this.refunded.refundTransactionHash = transactionHash;
  this.refunded.refundedAt = new Date();
  this.refunded.refundBlockNumber = blockNumber;
  this.status = 'refunded';
  
  return this.save();
};

// Instance method to verify on blockchain
bidSchema.methods.verifyOnBlockchain = function() {
  this.verified = true;
  return this.save({ validateBeforeSave: false });
};

// Pre-save middleware
bidSchema.pre('save', function(next) {
  // Calculate auction time remaining if not set
  if (!this.auctionTimeRemaining && this.auction && this.auction.endTime) {
    const timeRemaining = Math.max(0, Math.floor((this.auction.endTime - this.placedAt) / 1000));
    this.auctionTimeRemaining = timeRemaining;
  }
  
  next();
});

// Pre-remove middleware (cleanup when removing bids)
bidSchema.pre('remove', function(next) {
  // Add any cleanup logic here
  next();
});

module.exports = mongoose.model('Bid', bidSchema);