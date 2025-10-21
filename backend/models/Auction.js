const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  // Basic Auction Information
  auctionId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Auction title is required'],
    trim: true,
    maxlength: [100, 'Title must not exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Auction description is required'],
    trim: true,
    maxlength: [2000, 'Description must not exceed 2000 characters']
  },
  
  // Seller Information
  seller: {
    address: {
      type: String,
      required: true,
      match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    }
  },

  // Pricing & Timing
  startingPrice: {
    type: Number,
    required: [true, 'Starting price is required'],
    min: [0, 'Starting price must be positive']
  },
  currentHighestBid: {
    type: Number,
    default: 0
  },
  reservePrice: {
    type: Number,
    default: 0
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  duration: {
    type: Number, // in seconds
    required: true,
    min: [3600, 'Auction must run for at least 1 hour'], // minimum 1 hour
    max: [604800, 'Auction cannot run for more than 7 days'] // maximum 7 days
  },

  // Auction Status
  status: {
    type: String,
    enum: ['active', 'ended', 'finalized', 'cancelled'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Bidding Information
  totalBidders: {
    type: Number,
    default: 0
  },
  minimumBidders: {
    type: Number,
    default: 3 // Minimum bidders required for auction to be valid
  },
  bidIncrement: {
    type: Number,
    default: 0.01 // Minimum increment for new bids (in ETH)
  },
  
  // Current Winner
  currentWinner: {
    address: {
      type: String,
      match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format'],
      default: null
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    username: {
      type: String,
      default: null
    }
  },

  // Media & Metadata
  images: [{
    ipfsHash: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    fileName: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  metadataHash: {
    type: String, // IPFS hash for complete auction metadata
    default: null
  },
  metadataUrl: {
    type: String,
    default: null
  },

  // Blockchain Information
  blockchainData: {
    contractAddress: {
      type: String,
      match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid contract address format']
    },
    transactionHash: {
      type: String,
      match: [/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash format']
    },
    blockNumber: Number,
    gasUsed: Number,
    networkId: {
      type: Number,
      default: 1 // Ethereum mainnet
    }
  },

  // Categories & Tags
  category: {
    type: String,
    enum: [
      'electronics', 'art', 'collectibles', 'jewelry', 'vehicles', 
      'real-estate', 'antiques', 'books', 'sports', 'music', 
      'fashion', 'nft', 'other'
    ],
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],

  // Financial Tracking
  platformFee: {
    percentage: {
      type: Number,
      min: 0,
      max: 10,
      default: 2.5 // 2.5% platform fee
    },
    amount: {
      type: Number,
      default: 0
    }
  },
  finalAmount: {
    type: Number, // Amount seller receives after platform fee
    default: 0
  },

  // Auction Statistics
  views: {
    type: Number,
    default: 0
  },
  favorites: {
    type: Number,
    default: 0
  },
  watchers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    address: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Admin Controls
  featured: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: false // Admin can verify authentic items
  },
  flagged: {
    type: Boolean,
    default: false
  },
  flagReason: {
    type: String,
    maxlength: 500
  },

  // Finalization Data
  finalized: {
    isFinalized: {
      type: Boolean,
      default: false
    },
    finalizedAt: Date,
    finalizedBy: String, // Address who finalized
    winnerConfirmed: {
      type: Boolean,
      default: false
    },
    itemDelivered: {
      type: Boolean,
      default: false
    },
    deliveryConfirmedAt: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
auctionSchema.index({ status: 1, isActive: 1 });
auctionSchema.index({ 'seller.address': 1 });
auctionSchema.index({ 'seller.userId': 1 });
auctionSchema.index({ category: 1 });
auctionSchema.index({ endTime: 1 });
auctionSchema.index({ createdAt: -1 });
auctionSchema.index({ currentHighestBid: -1 });
auctionSchema.index({ featured: 1, status: 1 });

// Virtual for time remaining
auctionSchema.virtual('timeRemaining').get(function() {
  const now = new Date();
  if (now >= this.endTime) {
    return 0;
  }
  return Math.floor((this.endTime - now) / 1000); // seconds remaining
});

// Virtual for auction progress
auctionSchema.virtual('progressPercentage').get(function() {
  const now = new Date();
  const total = this.endTime - this.startTime;
  const elapsed = now - this.startTime;
  const progress = Math.min((elapsed / total) * 100, 100);
  return Math.max(progress, 0);
});

// Virtual for primary image
auctionSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0] || null;
});

// Virtual for bid requirement status
auctionSchema.virtual('hasSufficientBidders').get(function() {
  return this.totalBidders >= this.minimumBidders;
});

// Virtual for auction URL
auctionSchema.virtual('auctionUrl').get(function() {
  return `${process.env.FRONTEND_URL}/auction/${this.auctionId}`;
});

// Pre-save middleware
auctionSchema.pre('save', function(next) {
  // Auto-update status based on time
  const now = new Date();
  
  if (now >= this.endTime && this.status === 'active') {
    this.status = 'ended';
  }
  
  // Calculate platform fee amount
  if (this.currentHighestBid > 0) {
    this.platformFee.amount = (this.currentHighestBid * this.platformFee.percentage) / 100;
    this.finalAmount = this.currentHighestBid - this.platformFee.amount;
  }

  next();
});

// Static method to get active auctions
auctionSchema.statics.getActiveAuctions = function(limit = 20, skip = 0) {
  return this.find({ 
    status: 'active', 
    isActive: true,
    endTime: { $gt: new Date() }
  })
  .populate('seller.userId', 'username profile')
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(skip);
};

// Static method to get featured auctions
auctionSchema.statics.getFeaturedAuctions = function(limit = 10) {
  return this.find({ 
    featured: true,
    status: 'active', 
    isActive: true,
    endTime: { $gt: new Date() }
  })
  .populate('seller.userId', 'username profile')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to get auctions by category
auctionSchema.statics.getAuctionsByCategory = function(category, limit = 20, skip = 0) {
  return this.find({ 
    category: category,
    status: 'active', 
    isActive: true,
    endTime: { $gt: new Date() }
  })
  .populate('seller.userId', 'username profile')
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(skip);
};

// Static method to get user's auctions
auctionSchema.statics.getUserAuctions = function(userId, status = null) {
  const query = { 'seller.userId': userId };
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('currentWinner.userId', 'username profile')
    .sort({ createdAt: -1 });
};

// Instance method to add watcher
auctionSchema.methods.addWatcher = function(userId, userAddress) {
  const existingWatcher = this.watchers.find(w => 
    w.userId.toString() === userId.toString()
  );
  
  if (!existingWatcher) {
    this.watchers.push({
      userId: userId,
      address: userAddress,
      addedAt: new Date()
    });
  }
  
  return this.save();
};

// Instance method to remove watcher
auctionSchema.methods.removeWatcher = function(userId) {
  this.watchers = this.watchers.filter(w => 
    w.userId.toString() !== userId.toString()
  );
  
  return this.save();
};

// Instance method to increment views
auctionSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('Auction', auctionSchema);