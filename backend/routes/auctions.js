const express = require('express');
const multer = require('multer');
const { body, param, query } = require('express-validator');
const AuctionController = require('../controllers/AuctionController');
const BidController = require('../controllers/BidController');
const { protect: authMiddleware, optionalAuth } = require('../middleware/auth');
const { roleMiddleware } = require('../middleware/role');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Max 5 files
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Validation rules
const auctionValidation = [
  body('title')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('startingPrice')
    .isFloat({ min: 0.001 })
    .withMessage('Starting price must be at least 0.001 ETH'),
  body('reservePrice')
    .optional()
    .isFloat({ min: 0.001 })
    .withMessage('Reserve price must be at least 0.001 ETH'),
  body('minBidIncrement')
    .isFloat({ min: 0.001 })
    .withMessage('Minimum bid increment must be at least 0.001 ETH'),
  body('duration')
    .isFloat({ min: 0.1, max: 168 })
    .withMessage('Duration must be between 0.1 and 168 hours'),
  body('category')
    .isIn(['art', 'collectibles', 'gaming', 'photography', 'music', 'sports', 'utility', 'domain-names', 'virtual-worlds', 'trading-cards', 'other'])
    .withMessage('Invalid category'),
  body('smartContractAddress')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid smart contract address'),
  body('tokenId')
    .optional()
    .isNumeric()
    .withMessage('Token ID must be numeric'),
  body('networkId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Network ID must be a positive integer')
];

const bidValidation = [
  body('bidAmount')
    .isFloat({ min: 0.001 })
    .withMessage('Bid amount must be at least 0.001 ETH'),
  body('transactionHash')
    .matches(/^0x[a-fA-F0-9]{64}$/)
    .withMessage('Invalid transaction hash'),
  body('blockNumber')
    .isInt({ min: 1 })
    .withMessage('Block number must be a positive integer'),
  body('gasUsed')
    .isInt({ min: 1 })
    .withMessage('Gas used must be a positive integer'),
  body('gasPrice')
    .matches(/^\d+$/)
    .withMessage('Gas price must be a valid number in wei'),
  body('networkId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Network ID must be a positive integer')
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Auction Routes

// GET /api/auctions - Get all auctions with filters
router.get('/', 
  ...paginationValidation,
  query('status')
    .optional()
    .isIn(['all', 'draft', 'pending', 'active', 'ended', 'cancelled'])
    .withMessage('Invalid status filter'),
  query('category')
    .optional()
    .isIn(['art', 'collectibles', 'gaming', 'photography', 'music', 'sports', 'utility', 'domain-names', 'virtual-worlds', 'trading-cards', 'other'])
    .withMessage('Invalid category filter'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'endTime', 'currentPrice', 'bidCount', 'views'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  AuctionController.getAuctions
);

// GET /api/auctions/search - Search auctions
router.get('/search',
  query('q')
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters'),
  ...paginationValidation,
  AuctionController.searchAuctions
);

// GET /api/auctions/stats - Get auction statistics
router.get('/stats', AuctionController.getAuctionStats);

// POST /api/auctions - Create new auction
router.post('/',
  authMiddleware,
  upload.array('images', 5),
  ...auctionValidation,
  AuctionController.createAuction
);

// GET /api/auctions/:id - Get single auction
router.get('/:id',
  param('id')
    .custom((value) => {
      // Allow both ObjectId and numeric auctionId
      if (!value.match(/^[0-9a-fA-F]{24}$/) && !value.match(/^\d+$/)) {
        throw new Error('Invalid auction ID format');
      }
      return true;
    }),
  AuctionController.getAuctionById
);

// PUT /api/auctions/:id - Update auction
router.put('/:id',
  authMiddleware,
  param('id')
    .custom((value) => {
      if (!value.match(/^[0-9a-fA-F]{24}$/) && !value.match(/^\d+$/)) {
        throw new Error('Invalid auction ID format');
      }
      return true;
    }),
  upload.array('images', 5),
  // Partial validation for updates
  body('title')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('reservePrice')
    .optional()
    .isFloat({ min: 0.001 })
    .withMessage('Reserve price must be at least 0.001 ETH'),
  AuctionController.updateAuction
);

// DELETE /api/auctions/:id - Delete auction
router.delete('/:id',
  authMiddleware,
  param('id')
    .custom((value) => {
      if (!value.match(/^[0-9a-fA-F]{24}$/) && !value.match(/^\d+$/)) {
        throw new Error('Invalid auction ID format');
      }
      return true;
    }),
  AuctionController.deleteAuction
);

// POST /api/auctions/:id/activate - Activate auction
router.post('/:id/activate',
  authMiddleware,
  param('id')
    .custom((value) => {
      if (!value.match(/^[0-9a-fA-F]{24}$/) && !value.match(/^\d+$/)) {
        throw new Error('Invalid auction ID format');
      }
      return true;
    }),
  body('transactionHash')
    .matches(/^0x[a-fA-F0-9]{64}$/)
    .withMessage('Invalid transaction hash'),
  body('blockNumber')
    .isInt({ min: 1 })
    .withMessage('Block number must be a positive integer'),
  AuctionController.activateAuction
);

// POST /api/auctions/:id/end - End auction
router.post('/:id/end',
  authMiddleware,
  param('id')
    .custom((value) => {
      if (!value.match(/^[0-9a-fA-F]{24}$/) && !value.match(/^\d+$/)) {
        throw new Error('Invalid auction ID format');
      }
      return true;
    }),
  body('transactionHash')
    .optional()
    .matches(/^0x[a-fA-F0-9]{64}$/)
    .withMessage('Invalid transaction hash'),
  body('blockNumber')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Block number must be a positive integer'),
  body('winner')
    .optional()
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid winner address'),
  AuctionController.endAuction
);

// Bid Routes

// POST /api/auctions/:auctionId/bids - Place bid
router.post('/:auctionId/bids',
  authMiddleware,
  param('auctionId')
    .custom((value) => {
      if (!value.match(/^[0-9a-fA-F]{24}$/) && !value.match(/^\d+$/)) {
        throw new Error('Invalid auction ID format');
      }
      return true;
    }),
  ...bidValidation,
  BidController.placeBid
);

// GET /api/auctions/:auctionId/bids - Get auction bids
router.get('/:auctionId/bids',
  param('auctionId')
    .custom((value) => {
      if (!value.match(/^[0-9a-fA-F]{24}$/) && !value.match(/^\d+$/)) {
        throw new Error('Invalid auction ID format');
      }
      return true;
    }),
  ...paginationValidation,
  BidController.getAuctionBids
);

// GET /api/auctions/:auctionId/bids/highest - Get current highest bid
router.get('/:auctionId/bids/highest',
  param('auctionId')
    .custom((value) => {
      if (!value.match(/^[0-9a-fA-F]{24}$/) && !value.match(/^\d+$/)) {
        throw new Error('Invalid auction ID format');
      }
      return true;
    }),
  BidController.getCurrentHighestBid
);

// GET /api/auctions/:auctionId/bids/refundable - Get refundable bids (Admin only)
router.get('/:auctionId/bids/refundable',
  authMiddleware,
  roleMiddleware(['admin']),
  param('auctionId')
    .custom((value) => {
      if (!value.match(/^[0-9a-fA-F]{24}$/) && !value.match(/^\d+$/)) {
        throw new Error('Invalid auction ID format');
      }
      return true;
    }),
  BidController.getRefundableBids
);

// User-specific routes

// GET /api/auctions/user/:userId - Get user's auctions
router.get('/user/:userId',
  authMiddleware,
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  query('status')
    .optional()
    .isIn(['draft', 'pending', 'active', 'ended', 'cancelled'])
    .withMessage('Invalid status filter'),
  ...paginationValidation,
  AuctionController.getUserAuctions
);

// Bid-specific routes

// GET /api/bids/user/:userId - Get user bids
router.get('/bids/user/:userId',
  authMiddleware,
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  query('status')
    .optional()
    .isIn(['active', 'outbid', 'winning', 'won', 'refunded', 'failed'])
    .withMessage('Invalid status filter'),
  ...paginationValidation,
  BidController.getUserBids
);

// GET /api/bids/address/:address - Get bids by wallet address
router.get('/bids/address/:address',
  param('address')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid Ethereum address'),
  ...paginationValidation,
  BidController.getBidsByAddress
);

// POST /api/bids/:bidId/verify - Verify bid on blockchain
router.post('/bids/:bidId/verify',
  authMiddleware,
  param('bidId')
    .isMongoId()
    .withMessage('Invalid bid ID'),
  BidController.verifyBid
);

// POST /api/bids/:bidId/refund - Process bid refund (Admin only)
router.post('/bids/:bidId/refund',
  authMiddleware,
  roleMiddleware(['admin']),
  param('bidId')
    .isMongoId()
    .withMessage('Invalid bid ID'),
  body('transactionHash')
    .matches(/^0x[a-fA-F0-9]{64}$/)
    .withMessage('Invalid transaction hash'),
  body('blockNumber')
    .isInt({ min: 1 })
    .withMessage('Block number must be a positive integer'),
  BidController.processRefund
);

// GET /api/bids/stats - Get bid statistics
router.get('/bids/stats', BidController.getBidStats);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB per file.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 files allowed.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed'
    });
  }
  
  next(error);
});

module.exports = router;