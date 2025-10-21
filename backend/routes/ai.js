const express = require('express');
const { body, query } = require('express-validator');
const GeminiService = require('../services/geminiService');
const { protect: authMiddleware } = require('../middleware/auth');
const { validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for AI requests
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: {
    success: false,
    message: 'Too many AI requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const chatValidation = [
  body('message')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters')
    .trim(),
  body('context')
    .optional()
    .isObject()
    .withMessage('Context must be an object'),
  body('conversationId')
    .optional()
    .isUUID()
    .withMessage('Invalid conversation ID format')
];

// Store conversation history (in production, use Redis or database)
const conversationHistory = new Map();

class ChatController {
  
  // Main chat endpoint
  static async chat(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { message, context = {}, conversationId } = req.body;
      const userId = req.user ? req.user._id : null;

      // Get or create conversation history
      let history = [];
      if (conversationId && conversationHistory.has(conversationId)) {
        history = conversationHistory.get(conversationId);
      }

      // Add user context if authenticated
      if (req.user) {
        context.user = {
          id: req.user._id,
          username: req.user.username,
          role: req.user.role,
          walletAddress: req.user.walletAddress
        };
      }

      // Generate response using Gemini
      const response = await GeminiService.generateResponse(message, context, history);

      // Update conversation history
      const newConversationId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      if (!conversationHistory.has(newConversationId)) {
        conversationHistory.set(newConversationId, []);
      }
      
      const conversation = conversationHistory.get(newConversationId);
      conversation.push(
        { role: 'user', content: message, timestamp: new Date() },
        { role: 'assistant', content: response, timestamp: new Date() }
      );

      // Keep only last 10 exchanges to prevent memory overflow
      if (conversation.length > 20) {
        conversation.splice(0, conversation.length - 20);
      }

      res.json({
        success: true,
        data: {
          response,
          conversationId: newConversationId,
          timestamp: new Date()
        }
      });

    } catch (error) {
      console.error('Chat error:', error);
      
      // Provide fallback response
      const fallbackResponse = GeminiService.getFallbackResponse();
      
      res.status(500).json({
        success: false,
        message: 'AI service temporarily unavailable',
        data: {
          response: fallbackResponse,
          timestamp: new Date()
        }
      });
    }
  }

  // Get auction help
  static async getAuctionHelp(req, res) {
    try {
      const { topic = 'general' } = req.query;
      
      const helpResponse = await GeminiService.getContextualHelp(topic, req.user || null);
      
      res.json({
        success: true,
        data: {
          help: helpResponse,
          topic,
          timestamp: new Date()
        }
      });

    } catch (error) {
      console.error('Auction help error:', error);
      
      const fallbackHelp = GeminiService.getFallbackResponse();
      
      res.json({
        success: true,
        data: {
          help: fallbackHelp,
          topic,
          timestamp: new Date()
        }
      });
    }
  }

  // Analyze user intent
  static async analyzeIntent(req, res) {
    try {
      const { message } = req.body;
      
      if (!message || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Message is required'
        });
      }

      const intent = await GeminiService.analyzeIntent(message);
      
      res.json({
        success: true,
        data: {
          intent,
          message,
          timestamp: new Date()
        }
      });

    } catch (error) {
      console.error('Intent analysis error:', error);
      
      res.json({
        success: true,
        data: {
          intent: {
            category: 'general',
            confidence: 0.5,
            action: 'chat',
            entities: []
          },
          message: req.body.message,
          timestamp: new Date()
        }
      });
    }
  }

  // Get conversation history
  static async getConversationHistory(req, res) {
    try {
      const { conversationId } = req.params;
      const { limit = 20 } = req.query;

      if (!conversationHistory.has(conversationId)) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      const history = conversationHistory.get(conversationId);
      const limitedHistory = history.slice(-parseInt(limit));

      res.json({
        success: true,
        data: {
          history: limitedHistory,
          conversationId,
          totalMessages: history.length
        }
      });

    } catch (error) {
      console.error('Get conversation history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch conversation history'
      });
    }
  }

  // Clear conversation history
  static async clearConversationHistory(req, res) {
    try {
      const { conversationId } = req.params;

      if (conversationHistory.has(conversationId)) {
        conversationHistory.delete(conversationId);
      }

      res.json({
        success: true,
        message: 'Conversation history cleared'
      });

    } catch (error) {
      console.error('Clear conversation history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear conversation history'
      });
    }
  }

  // Get AI service status
  static async getServiceStatus(req, res) {
    try {
      // Test AI service with a simple query
      const testResponse = await GeminiService.generateResponse(
        'Hello', 
        { test: true }, 
        []
      );

      res.json({
        success: true,
        data: {
          status: 'online',
          responseTime: new Date(),
          testResponse: testResponse ? 'OK' : 'ERROR'
        }
      });

    } catch (error) {
      console.error('AI service status error:', error);
      res.json({
        success: false,
        data: {
          status: 'offline',
          error: error.message,
          responseTime: new Date()
        }
      });
    }
  }
}

// Routes

// POST /api/ai/chat - Main chat endpoint
router.post('/chat', 
  aiRateLimit,
  chatValidation,
  ChatController.chat
);

// GET /api/ai/help - Get contextual help
router.get('/help',
  query('topic')
    .optional()
    .isIn(['bidding', 'selling', 'buying', 'account', 'fees', 'blockchain', 'nft', 'general'])
    .withMessage('Invalid help topic'),
  ChatController.getAuctionHelp
);

// POST /api/ai/intent - Analyze user intent
router.post('/intent',
  aiRateLimit,
  [
    body('message')
      .isLength({ min: 1, max: 500 })
      .withMessage('Message must be between 1 and 500 characters')
      .trim()
  ],
  ChatController.analyzeIntent
);

// GET /api/ai/conversation/:conversationId - Get conversation history
router.get('/conversation/:conversationId',
  authMiddleware, // Require authentication for conversation history
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  ChatController.getConversationHistory
);

// DELETE /api/ai/conversation/:conversationId - Clear conversation history
router.delete('/conversation/:conversationId',
  authMiddleware, // Require authentication to clear history
  ChatController.clearConversationHistory
);

// GET /api/ai/status - Get AI service status
router.get('/status', ChatController.getServiceStatus);

// Quick help endpoints for common topics
router.get('/help/bidding', (req, res) => {
  res.json({
    success: true,
    data: {
      help: GeminiService.getFallbackResponse('bidding'),
      topic: 'bidding',
      timestamp: new Date()
    }
  });
});

router.get('/help/selling', (req, res) => {
  res.json({
    success: true,
    data: {
      help: GeminiService.getFallbackResponse('selling'),
      topic: 'selling',
      timestamp: new Date()
    }
  });
});

router.get('/help/fees', (req, res) => {
  res.json({
    success: true,
    data: {
      help: GeminiService.getFallbackResponse('fees'),
      topic: 'fees',
      timestamp: new Date()
    }
  });
});

// Cleanup old conversations (run every hour)
setInterval(() => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  
  for (const [conversationId, history] of conversationHistory.entries()) {
    if (history.length > 0) {
      const lastMessage = history[history.length - 1];
      if (new Date(lastMessage.timestamp).getTime() < oneHourAgo) {
        conversationHistory.delete(conversationId);
      }
    }
  }
}, 60 * 60 * 1000); // Every hour

module.exports = router;