const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const PinataService = require('../services/pinataService');
const { validationResult } = require('express-validator');

class AuctionController {

  // Create new auction
static async createAuction(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const {
        title,
        description,
        startingPrice,
        reservePrice,
        minBidIncrement,
        duration,
        category,
        tags,
        smartContractAddress,
        tokenId,
        networkId
      } = req.body;

      // Calculate end time
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + (duration * 60 * 60 * 1000));

      // Create auction object
      const auctionData = {
        title,
        description,
        startingPrice: parseFloat(startingPrice),
        reservePrice: parseFloat(reservePrice || startingPrice),
        minBidIncrement: parseFloat(minBidIncrement),
        startTime,
        endTime,
        duration: parseFloat(duration),
        category,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        seller: {
          address: req.user.walletAddress,
          userId: req.user._id,
          username: req.user.username
        },
        blockchain: {
          smartContractAddress,
          tokenId: tokenId || null,
          networkId: networkId || 1
        },
        status: 'pending' // Will be activated when blockchain transaction confirms
      };

      // Handle image upload if provided
      if (req.files && req.files.length > 0) {
        try {
          const imageUploads = await Promise.all(
            req.files.map(async (file) => {
              const result = await PinataService.uploadFile(file.buffer, file.originalname);
              return {
                url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
                ipfsHash: result.IpfsHash,
                filename: file.originalname,
                size: file.size
              };
            })
          );
          auctionData.images = imageUploads;
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload images',
            error: uploadError.message
          });
        }
      }

      // Create auction in database
      const auction = new Auction(auctionData);
      await auction.save();

      // Upload metadata to IPFS
      try {
        const metadataHash = await PinataService.createAuctionMetadata(auction);
        auction.metadata.ipfsHash = metadataHash;
        await auction.save();
      } catch (metadataError) {
        console.error('Metadata upload error:', metadataError);
        // Continue without metadata if upload fails
      }

      res.status(201).json({
        success: true,
        message: 'Auction created successfully',
        data: {
          auction: await auction.populate('seller.userId', 'username profile')
        }
      });

    } catch (error) {
      console.error('Create auction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create auction',
        error: error.message
      });
    }
  }

  // Get all auctions with filters
  static async getAuctions(req, res) {
    try {
      const {
        status = 'all',
        category,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 20,
        search,
        minPrice,
        maxPrice,
        seller
      } = req.query;

      // Build filter query
      const filter = {};
      
      if (status !== 'all') {
        filter.status = status;
      }
      
      if (category) {
        filter.category = category;
      }
      
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }
      
      if (minPrice || maxPrice) {
        filter.currentPrice = {};
        if (minPrice) filter.currentPrice.$gte = parseFloat(minPrice);
        if (maxPrice) filter.currentPrice.$lte = parseFloat(maxPrice);
      }
      
      if (seller) {
        filter['seller.address'] = seller;
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Sort options
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query
      const [auctions, totalCount] = await Promise.all([
        Auction.find(filter)
          .populate('seller.userId', 'username profile')
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit)),
        Auction.countDocuments(filter)
      ]);

      // Add bid counts and current highest bid
      const auctionsWithBids = await Promise.all(
        auctions.map(async (auction) => {
          const [bidCount, highestBid] = await Promise.all([
            Bid.countDocuments({ auctionId: auction.auctionId }),
            Bid.getCurrentHighestBid(auction.auctionId)
          ]);
          
          return {
            ...auction.toJSON(),
            bidCount,
            currentHighestBid: highestBid
          };
        })
      );

      res.json({
        success: true,
        data: {
          auctions: auctionsWithBids,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / parseInt(limit)),
            totalCount,
            hasNext: skip + auctions.length < totalCount,
            hasPrev: parseInt(page) > 1
          }
        }
      });

    } catch (error) {
      console.error('Get auctions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch auctions',
        error: error.message
      });
    }
  }

  // Get single auction by ID
  static async getAuctionById(req, res) {
    try {
      const { id } = req.params;
      
      const auction = await Auction.findOne({
        $or: [
          { _id: id },
          { auctionId: parseInt(id) }
        ]
      }).populate('seller.userId', 'username profile email');

      if (!auction) {
        return res.status(404).json({
          success: false,
          message: 'Auction not found'
        });
      }

      // Get bid information
      const [bids, bidCount, highestBid] = await Promise.all([
        Bid.getAuctionBids(auction.auctionId, 10), // Last 10 bids
        Bid.countDocuments({ auctionId: auction.auctionId }),
        Bid.getCurrentHighestBid(auction.auctionId)
      ]);

      // Update view count
      await auction.incrementViews();

      res.json({
        success: true,
        data: {
          auction: auction.toJSON(),
          bids,
          bidCount,
          currentHighestBid: highestBid,
          timeRemaining: auction.getTimeRemaining()
        }
      });

    } catch (error) {
      console.error('Get auction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch auction',
        error: error.message
      });
    }
  }

  // Update auction (only seller can update)
  static async updateAuction(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const auction = await Auction.findOne({
        $or: [
          { _id: id },
          { auctionId: parseInt(id) }
        ]
      });

      if (!auction) {
        return res.status(404).json({
          success: false,
          message: 'Auction not found'
        });
      }

      // Check if user is the seller
      if (auction.seller.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only auction seller can update auction'
        });
      }

      // Check if auction can be updated (only pending or draft status)
      if (!['pending', 'draft'].includes(auction.status)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot update active or completed auction'
        });
      }

      // Prevent updating certain fields
      const restrictedFields = ['auctionId', 'seller', 'createdAt', 'blockchain.transactionHash'];
      restrictedFields.forEach(field => delete updates[field]);

      // Update auction
      Object.assign(auction, updates);
      await auction.save();

      res.json({
        success: true,
        message: 'Auction updated successfully',
        data: {
          auction: await auction.populate('seller.userId', 'username profile')
        }
      });

    } catch (error) {
      console.error('Update auction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update auction',
        error: error.message
      });
    }
  }

  // Delete auction (only seller can delete)
  static async deleteAuction(req, res) {
    try {
      const { id } = req.params;

      const auction = await Auction.findOne({
        $or: [
          { _id: id },
          { auctionId: parseInt(id) }
        ]
      });

      if (!auction) {
        return res.status(404).json({
          success: false,
          message: 'Auction not found'
        });
      }

      // Check if user is the seller
      if (auction.seller.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only auction seller can delete auction'
        });
      }

      // Check if auction can be deleted
      if (auction.status === 'active' && auction.bidCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete active auction with bids'
        });
      }

      await auction.deleteOne();

      res.json({
        success: true,
        message: 'Auction deleted successfully'
      });

    } catch (error) {
      console.error('Delete auction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete auction',
        error: error.message
      });
    }
  }

  // Activate auction (after blockchain confirmation)
  static async activateAuction(req, res) {
    try {
      const { id } = req.params;
      const { transactionHash, blockNumber } = req.body;

      const auction = await Auction.findOne({
        $or: [
          { _id: id },
          { auctionId: parseInt(id) }
        ]
      });

      if (!auction) {
        return res.status(404).json({
          success: false,
          message: 'Auction not found'
        });
      }

      // Check if user is authorized (seller or admin)
      if (auction.seller.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to activate auction'
        });
      }

      // Activate auction
      await auction.activate(transactionHash, blockNumber);

      res.json({
        success: true,
        message: 'Auction activated successfully',
        data: { auction }
      });

    } catch (error) {
      console.error('Activate auction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to activate auction',
        error: error.message
      });
    }
  }

  // End auction (manually or automatically)
  static async endAuction(req, res) {
    try {
      const { id } = req.params;
      const { transactionHash, blockNumber, winner } = req.body;

      const auction = await Auction.findOne({
        $or: [
          { _id: id },
          { auctionId: parseInt(id) }
        ]
      });

      if (!auction) {
        return res.status(404).json({
          success: false,
          message: 'Auction not found'
        });
      }

      // Check authorization
      if (req.user.role !== 'admin' && auction.seller.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to end auction'
        });
      }

      // End auction
      await auction.end(winner, transactionHash, blockNumber);

      res.json({
        success: true,
        message: 'Auction ended successfully',
        data: { auction }
      });

    } catch (error) {
      console.error('End auction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to end auction',
        error: error.message
      });
    }
  }

  // Get user's auctions (seller)
  static async getUserAuctions(req, res) {
    try {
      const { userId = req.user._id } = req.params;
      const { status, page = 1, limit = 20 } = req.query;

      const filter = { 'seller.userId': userId };
      if (status) filter.status = status;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [auctions, totalCount] = await Promise.all([
        Auction.find(filter)
          .populate('seller.userId', 'username profile')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Auction.countDocuments(filter)
      ]);

      res.json({
        success: true,
        data: {
          auctions,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / parseInt(limit)),
            totalCount
          }
        }
      });

    } catch (error) {
      console.error('Get user auctions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user auctions',
        error: error.message
      });
    }
  }

  // Get auction statistics
  static async getAuctionStats(req, res) {
    try {
      const stats = await Auction.getStats();
      
      res.json({
        success: true,
        data: { stats }
      });

    } catch (error) {
      console.error('Get auction stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch auction statistics',
        error: error.message
      });
    }
  }

  // Search auctions
  static async searchAuctions(req, res) {
    try {
      const { q, category, status, page = 1, limit = 20 } = req.query;

      if (!q || q.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const results = await Auction.search(q, {
        category,
        status,
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: results
      });

    } catch (error) {
      console.error('Search auctions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search auctions',
        error: error.message
      });
    }
  }
}

module.exports = AuctionController;