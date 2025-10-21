const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiChatbotService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // System prompt for auction-specific responses
    this.systemPrompt = `
You are AUCTRA AI Assistant, an expert chatbot for the AUCTRA Decentralized Auction Platform. You ONLY answer questions related to auctions, bidding, blockchain, and the AUCTRA platform. 

AUCTRA Platform Overview:
- A blockchain-based decentralized auction platform
- Built on Ethereum using Solidity smart contracts
- Three main roles: Admin, Seller, and Buyer/Bidder
- Uses IPFS for image storage via Pinata
- MongoDB for user management
- Web3 wallet integration required

Key Features:
1. User Registration (sellers and buyers must register)
2. Auction Creation (sellers create auctions with title, description, starting price, duration)
3. Bidding System (buyers place bids, automatic refunds for outbid users)
4. Smart Contract Automation (automatic winner selection, payment distribution)
5. Platform Fee System (small percentage goes to platform)
6. Transparent & Trustless (all transactions on blockchain)

Admin Role:
- Deploys smart contract
- Controls platform settings
- Manages platform fees (2-5%)
- Can pause/unpause platform for emergencies
- Monitors for fraudulent activities
- Withdraws platform fees

Seller Role:
- Must register first using registerUser()
- Creates auctions with item details
- Sets starting price and duration
- Finalizes auction after time ends
- Receives payment (bid amount - platform fee)
- Cannot manipulate bids or outcomes

Buyer/Bidder Role:
- Must register first using registerUser()
- Browses active auctions
- Places bids higher than current highest
- Gets automatic refunds if outbid
- Winner receives the item (off-chain delivery)
- All losing bidders get full refunds

Technical Details:
- Smart contracts ensure transparency
- IPFS stores auction images permanently
- Reentrancy protection prevents attacks
- Pausable contract for emergency control
- Automatic refund system for failed auctions

Security Features:
- All funds locked in smart contract
- Automatic refunds if auction cancelled
- No central authority can steal funds
- Transparent bid history on blockchain
- Reentrancy protection

INSTRUCTIONS:
1. ONLY answer questions about auctions, AUCTRA platform, blockchain, bidding, smart contracts, or related topics
2. If asked about anything else (weather, sports, other platforms, etc.), politely redirect to auction topics
3. Be helpful, friendly, and informative
4. Provide step-by-step guidance when needed
5. Explain technical concepts in simple terms
6. Always promote trust and transparency of the platform
7. Encourage users to connect their Web3 wallets
8. Mention that everything is on blockchain for transparency

If someone asks non-auction questions, respond with:
"I'm AUCTRA AI Assistant, specialized in helping with auction-related questions on our decentralized platform. Please ask me about bidding, creating auctions, how our blockchain system works, or any other auction-related topics!"
`;
  }

  async generateResponse(userMessage, conversationHistory = []) {
    try {
      console.log('🤖 Generating AI response for:', userMessage.substring(0, 50) + '...');

      // Prepare conversation context
      let fullPrompt = this.systemPrompt + '\n\nConversation:\n';
      
      // Add conversation history (last 5 messages for context)
      const recentHistory = conversationHistory.slice(-5);
      recentHistory.forEach(msg => {
        fullPrompt += `${msg.role}: ${msg.content}\n`;
      });
      
      fullPrompt += `User: ${userMessage}\nAUCTRA AI:`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const aiResponse = response.text();

      console.log('✅ AI response generated successfully');

      return {
        success: true,
        response: aiResponse,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Gemini AI error:', error);
      
      // Fallback response for errors
    const fallbackResponse = this.getFallbackResponse(userMessage);
      
    return {
        success: false,
        response: fallbackResponse,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Fallback responses when AI fails
  getFallbackResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    if (message.includes('auction') || message.includes('bid')) {
      return "Welcome to AUCTRA! I'm here to help with auction-related questions. You can ask me about creating auctions, placing bids, how our blockchain system works, or platform features. What would you like to know?";
    }
    
    if (message.includes('register') || message.includes('signup')) {
      return "To get started on AUCTRA, you need to: 1) Connect your Web3 wallet, 2) Register as a user (seller or buyer), 3) For sellers: create auctions, 4) For buyers: browse and bid on auctions. All transactions happen on blockchain for complete transparency!";
    }
    
    if (message.includes('wallet') || message.includes('metamask')) {
      return "AUCTRA requires a Web3 wallet like MetaMask to participate. Make sure your wallet is connected and has some ETH for transaction fees. All bids and payments go through smart contracts for security!";
    }
    
    if (message.includes('fee') || message.includes('cost')) {
      return "AUCTRA charges a small platform fee (2-5%) on successful auctions. This fee is automatically deducted from the final bid amount. Bidders don't pay extra fees - just gas fees for blockchain transactions.";
    }

    if (message.includes('how') || message.includes('work')) {
      return "AUCTRA works through smart contracts: 1) Sellers create auctions, 2) Buyers place bids with ETH, 3) Contract tracks highest bid, 4) When auction ends, highest bidder wins, 5) Funds automatically distributed. Everything is transparent on blockchain!";
    }

    return "Hi! I'm AUCTRA AI Assistant, here to help with our decentralized auction platform. Ask me about creating auctions, bidding, how our blockchain system works, fees, registration, or any other auction-related topics!";
  }

  // Get predefined quick responses for common questions
  getQuickResponses() {
    return [
      {
        question: "How do I create an auction?",
        answer: "To create an auction: 1) Register as a user, 2) Connect your wallet, 3) Click 'Create Auction', 4) Fill in title, description, starting price, and duration, 5) Upload an image (stored on IPFS), 6) Submit to blockchain. Your auction will be live immediately!"
      },
      {
        question: "How does bidding work?",
        answer: "Bidding is simple: 1) Find an active auction, 2) Enter bid amount (higher than current highest), 3) Confirm transaction with your wallet, 4) If outbid later, you'll automatically get refunded, 5) If you win, pay gas to finalize and claim your item!"
      },
      {
        question: "Is AUCTRA safe?",
        answer: "Yes! AUCTRA uses smart contracts for security: ✅ Your funds are locked safely in contracts, ✅ Automatic refunds if outbid, ✅ No one can steal your money, ✅ All transactions are transparent on blockchain, ✅ Reentrancy protection against attacks."
      },
      {
        question: "What fees does AUCTRA charge?",
        answer: "AUCTRA charges a small platform fee (2-5%) only on successful auctions, deducted from the final winning bid. Sellers receive (winning bid - platform fee). Buyers pay no extra fees, just normal blockchain gas fees."
      },
      {
        question: "What wallets are supported?",
        answer: "AUCTRA supports Web3 wallets like MetaMask, WalletConnect, Coinbase Wallet, and others. Make sure you have ETH for gas fees and bidding. Your wallet must be connected to participate in auctions."
      },
      {
        question: "How do refunds work?",
        answer: "Refunds are automatic! If someone outbids you, the smart contract immediately refunds your previous bid to your wallet. If an auction is cancelled or fails, everyone gets full refunds automatically. No manual process needed!"
      }
    ];
  }

  // Analyze user message to determine intent
  analyzeIntent(message) {
    const msg = message.toLowerCase();
    
    if (msg.includes('create') && (msg.includes('auction') || msg.includes('sell'))) {
      return 'create_auction';
    }
    if (msg.includes('bid') || msg.includes('buy')) {
      return 'bidding';
    }
    if (msg.includes('register') || msg.includes('signup') || msg.includes('account')) {
      return 'registration';
    }
    if (msg.includes('wallet') || msg.includes('metamask') || msg.includes('connect')) {
      return 'wallet';
    }
    if (msg.includes('fee') || msg.includes('cost') || msg.includes('price')) {
      return 'fees';
    }
    if (msg.includes('safe') || msg.includes('security') || msg.includes('trust')) {
      return 'security';
    }
    if (msg.includes('refund') || msg.includes('money back')) {
      return 'refunds';
    }
    if (msg.includes('how') || msg.includes('work') || msg.includes('process')) {
      return 'how_it_works';
    }
    
    return 'general';
  }

  // Get contextual help based on user's current page/action
  getContextualHelp(context) {
    const helpContent = {
      'auction_creation': {
        title: "Creating Your Auction",
        tips: [
          "Upload clear, high-quality images of your item",
          "Write detailed descriptions to attract bidders", 
          "Set a reasonable starting price",
          "Choose appropriate auction duration (24h-7days recommended)",
          "Make sure your wallet has ETH for gas fees"
        ]
      },
      'bidding': {
        title: "How to Bid Successfully", 
        tips: [
          "Research the item value before bidding",
          "Set a maximum budget and stick to it",
          "Bid early to show interest, but watch for last-minute bidders",
          "Keep some ETH for gas fees",
          "Remember: if outbid, you get automatic refund"
        ]
      },
      'wallet_connection': {
        title: "Connecting Your Wallet",
        tips: [
          "Make sure MetaMask or your preferred wallet is installed", 
          "Switch to the correct network (Ethereum Mainnet/Sepolia)",
          "Ensure you have ETH for transaction fees",
          "Never share your private keys or seed phrase",
          "Always verify transaction details before confirming"
        ]
      }
    };

    return helpContent[context] || null;
  }
}

module.exports = new GeminiChatbotService();