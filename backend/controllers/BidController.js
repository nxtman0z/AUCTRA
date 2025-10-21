const Bid = require('../models/Bid');
const Auction = require('../models/Auction');
const { validationResult } = require('express-validator');

class BidController {

  // Place new bid
  static async placeBid(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { auctionId } = req.params;
      const {
        bidAmount,
        transactionHash,
        blockNumber,
        blockHash,
        gasUsed,
        gasPrice,
        networkId = 1
      } = req.body;

      // Find auction
      const auction = await Auction.findOne({
        $or: [
          { _id: auctionId },
          { auctionId: parseInt(auctionId) }
        ]
      });

      if (!auction) {
        return res.status(404).json({
          success: false,
          message: 'Auction not found'
        });
      }

      // Validate auction status
      if (auction.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Auction is not active'
        });
      }

      // Check if auction has ended
      if (auction.hasEnded()) {
        return res.status(400).json({
          success: false,
          message: 'Auction has ended'
        });
      }

      // Check if seller is trying to bid on own auction
      if (auction.seller.userId.toString() === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Seller cannot bid on own auction'
        });
      }

      // Get current highest bid
      const currentHighestBid = await Bid.getCurrentHighestBid(auction.auctionId);
      const currentPrice = currentHighestBid ? currentHighestBid.bidAmount : auction.startingPrice;

      // Validate bid amount
      const minRequiredBid = currentPrice + auction.minBidIncrement;
      if (parseFloat(bidAmount) < minRequiredBid) {
        return res.status(400).json({
          success: false,
          message: `Bid must be at least ${minRequiredBid} ETH`,
          data: {
            currentPrice,
            minRequiredBid,
            minBidIncrement: auction.minBidIncrement
          }
        });
      }

      // Check if bid meets reserve price
      if (parseFloat(bidAmount) < auction.reservePrice) {
        return res.status(400).json({
          success: false,
          message: `Bid must meet reserve price of ${auction.reservePrice} ETH`,
          data: {
            reservePrice: auction.reservePrice,
            bidAmount: parseFloat(bidAmount)
          }
        });
      }

      // Check for duplicate transaction hash
      const existingBid = await Bid.findOne({ transactionHash });
      if (existingBid) {
        return res.status(400).json({
          success: false,
          message: 'Transaction already processed'
        });
      }

      // Create new bid
      const bidData = {
        auctionId: auction.auctionId,
        auction: auction._id,
        bidder: {
          address: req.user.walletAddress,
          userId: req.user._id,
          username: req.user.username
        },
        bidAmount: parseFloat(bidAmount),
        previousHighestBid: currentPrice,
        bidIncrement: parseFloat(bidAmount) - currentPrice,
        transactionHash,
        blockNumber: parseInt(blockNumber),
        blockHash,
        gasUsed: parseInt(gasUsed),
        gasPrice: gasPrice.toString(),
        networkId: parseInt(networkId),
        auctionTimeRemaining: auction.getTimeRemaining(),
        bidderIP: req.ip,
        userAgent: req.get('User-Agent'),
        source: req.body.source || 'web'
      };

      const bid = new Bid(bidData);
      await bid.save();

      // Update previous highest bid status
      if (currentHighestBid) {
        await currentHighestBid.markAsOutbid();
      }

      // Mark this bid as current highest
      await bid.markAsWinning();

      // Update auction with new bid information
      auction.currentPrice = parseFloat(bidAmount);
      auction.bidCount += 1;
      auction.lastBidTime = new Date();
      auction.lastBidder = {
        address: req.user.walletAddress,
        userId: req.user._id,
        username: req.user.username
      };

      // Extend auction if bid placed in last 10 minutes
      const timeRemaining = auction.getTimeRemaining();
      if (timeRemaining <= 600 && timeRemaining > 0) { // 10 minutes = 600 seconds
        const extensionTime = 10 * 60 * 1000; // 10 minutes in milliseconds
        auction.endTime = new Date(auction.endTime.getTime() + extensionTime);
        auction.timeExtensions += 1;
      }

      await auction.save();

      // Populate bid data for response
      const populatedBid = await Bid.findById(bid._id)
        .populate('bidder.userId', 'username profile')
        .populate('auction', 'title auctionId');

      res.status(201).json({
        success: true,
        message: 'Bid placed successfully',
        data: {
          bid: populatedBid,
          auction: {
            auctionId: auction.auctionId,
            currentPrice: auction.currentPrice,
            timeRemaining: auction.getTimeRemaining(),
            endTime: auction.endTime
          }
        }
      });

    } catch (error) {
      console.error('Place bid error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to place bid',
        error: error.message
      });
    }
  }

  // Get auction bids
  static async getAuctionBids(req, res) {
    try {
      const { auctionId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [bids, totalCount] = await Promise.all([
        Bid.getAuctionBids(parseInt(auctionId), parseInt(limit), skip),
        Bid.countDocuments({ auctionId: parseInt(auctionId) })
      ]);

      // Add bid rank to each bid
      bids.forEach((bid, index) => {
        bid._bidRank = skip + index + 1;
      });

      res.json({
        success: true,
        data: {
          bids,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / parseInt(limit)),
            totalCount,
            hasNext: skip + bids.length < totalCount,
            hasPrev: parseInt(page) > 1
          }
        }
      });

    } catch (error) {
      console.error('Get auction bids error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch auction bids',
        error: error.message
      });
    }
  }

  // Get user bids
  static async getUserBids(req, res) {
    try {
      const { userId = req.user._id } = req.params;
      const { status, page = 1, limit = 50 } = req.query;

      // Check if user can access this data
      if (userId !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to access this user\'s bids'
        });
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [bids, totalCount] = await Promise.all([
        Bid.getUserBids(userId, status, parseInt(limit), skip),
        Bid.countDocuments({ 
          'bidder.userId': userId,
          ...(status ? { status } : {})
        })
      ]);

      res.json({
        success: true,
        data: {
          bids,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / parseInt(limit)),
            totalCount
          }
        }
      });

    } catch (error) {
      console.error('Get user bids error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user bids',
        error: error.message
      });
    }
  }

  // Get bids by wallet address
  static async getBidsByAddress(req, res) {
    try {
      const { address } = req.params;
      const { page = 1, limit = 50 } = req.query;

      // Validate Ethereum address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Ethereum address format'
        });
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [bids, totalCount] = await Promise.all([
        Bid.getBidsByAddress(address, parseInt(limit), skip),
        Bid.countDocuments({ 'bidder.address': address })
      ]);

      res.json({
        success: true,
        data: {
          bids,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / parseInt(limit)),
            totalCount
          }
        }
      });

    } catch (error) {
      console.error('Get bids by address error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch bids',
        error: error.message
      });
    }
  }

  // Get current highest bid for auction
  static async getCurrentHighestBid(req, res) {
    try {
      const { auctionId } = req.params;

      const highestBid = await Bid.getCurrentHighestBid(parseInt(auctionId));

      if (!highestBid) {
        return res.status(404).json({
          success: false,
          message: 'No bids found for this auction'
        });
      }

      res.json({
        success: true,
        data: { bid: highestBid }
      });

    } catch (error) {
      console.error('Get highest bid error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch highest bid',
        error: error.message
      });
    }
  }

  // Verify bid on blockchain
  static async verifyBid(req, res) {
    try {
      const { bidId } = req.params;

      const bid = await Bid.findById(bidId);
      if (!bid) {
        return res.status(404).json({
          success: false,
          message: 'Bid not found'
        });
      }

      // Only admin or bid owner can verify
      if (bid.bidder.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to verify this bid'
        });
      }

      await bid.verifyOnBlockchain();

      res.json({
        success: true,
        message: 'Bid verified successfully',
        data: { bid }
      });

    } catch (error) {
      console.error('Verify bid error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify bid',
        error: error.message
      });
    }
  }

  // Process refund for outbid bids
  static async processRefund(req, res) {
    try {
      const { bidId } = req.params;
      const { transactionHash, blockNumber } = req.body;

      const bid = await Bid.findById(bidId);
      if (!bid) {
        return res.status(404).json({
          success: false,
          message: 'Bid not found'
        });
      }

      // Check if bid is eligible for refund
      if (bid.status !== 'outbid') {
        return res.status(400).json({
          success: false,
          message: 'Bid is not eligible for refund'
        });
      }

      if (bid.refunded.isRefunded) {
        return res.status(400).json({
          success: false,
          message: 'Bid already refunded'
        });
      }

      // Only admin can process refunds
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only admin can process refunds'
        });
      }

      await bid.processRefund(transactionHash, parseInt(blockNumber));

      res.json({
        success: true,
        message: 'Refund processed successfully',
        data: { bid }
      });

    } catch (error) {
      console.error('Process refund error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process refund',
        error: error.message
      });
    }
  }

  // Get refundable bids for auction
  static async getRefundableBids(req, res) {
    try {
      const { auctionId } = req.params;

      // Only admin can access refundable bids
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only admin can access refundable bids'
        });
      }

      const bids = await Bid.getRefundableBids(parseInt(auctionId));

      res.json({
        success: true,
        data: { bids }
      });

    } catch (error) {
      console.error('Get refundable bids error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch refundable bids',
        error: error.message
      });
    }
  }

  // Get bid statistics
  static async getBidStats(req, res) {
    try {
      const stats = await Bid.aggregate([
        {
          $group: {
            _id: null,
            totalBids: { $sum: 1 },
            totalVolume: { $sum: '$bidAmount' },
            averageBid: { $avg: '$bidAmount' },
            uniqueBidders: { $addToSet: '$bidder.address' }
          }
        },
        {
          $project: {
            _id: 0,
            totalBids: 1,
            totalVolume: 1,
            averageBid: 1,
            uniqueBidders: { $size: '$uniqueBidders' }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          stats: stats[0] || {
            totalBids: 0,
            totalVolume: 0,
            averageBid: 0,
            uniqueBidders: 0
          }
        }
      });

    } catch (error) {
      console.error('Get bid stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch bid statistics',
        error: error.message
      });
    }
  }
}

module.exports = BidController;