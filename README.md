# 🏛️ AUCTRA - Decentralized Auction Platform

![AUCTRA Logo](frontend/public/auctra_logo.png)

## 🌟 Overview

**AUCTRA** is a cutting-edge decentralized auction platform built with React.js and Node.js, featuring blockchain integration, IPFS storage, and AI-powered assistance. The platform enables secure, transparent, and efficient auction management with smart contract integration.

## 🚀 Features

### 🔐 **Multi-Role Authentication System**
- **Admin**: Platform management and oversight
- **Seller**: Create and manage auctions
- **Buyer**: Browse and bid on auctions
- JWT-based secure authentication
- Wallet address integration

### 🌐 **IPFS Integration (Pinata)**
- Decentralized file storage for auction images
- NFT metadata management
- IPFS hash tracking and retrieval
- Secure and permanent storage solution

### 🤖 **AI-Powered Chatbot (Gemini)**
- Auction-specific assistance
- Contextual help and guidance
- Intent analysis and smart responses
- 24/7 user support automation

### 🏷️ **Comprehensive Auction System**
- Create detailed auction listings
- Real-time bidding system
- Blockchain transaction tracking
- Smart contract integration
- Time-based auction management

### 📊 **Advanced Features**
- Real-time bid tracking
- Transaction history
- User analytics and statistics
- Responsive design for all devices
- Rate limiting and security measures

## 🛠️ Tech Stack

### **Frontend**
- ⚛️ **React.js** - User interface framework
- 🎨 **CSS3** - Styling and responsive design
- 🔄 **Context API** - State management
- 📡 **Axios** - HTTP client for API calls

### **Backend**
- 🟢 **Node.js** - Runtime environment
- 🚀 **Express.js** - Web application framework
- 🍃 **MongoDB** - NoSQL database
- 🔑 **JWT** - Authentication and authorization
- 📁 **Multer** - File upload handling

### **Blockchain & Web3**
- ⚡ **Ethers.js** - Ethereum blockchain interaction
- 🌐 **Web3.js** - Web3 integration
- 📜 **Smart Contracts** - Auction logic on blockchain

### **External Services**
- 📌 **Pinata IPFS** - Decentralized file storage
- 🧠 **Google Gemini AI** - AI chatbot integration
- 🔒 **MongoDB Atlas** - Cloud database (optional)

## 📁 Project Structure

```
AUCTRA/
├── 📁 frontend/                 # React.js frontend application
│   ├── 📁 public/              # Static assets
│   ├── 📁 src/                 # Source code
│   │   ├── 📁 components/      # Reusable components
│   │   ├── 📁 pages/           # Page components
│   │   ├── 📁 context/         # React context providers
│   │   ├── 📁 services/        # API service layer
│   │   └── 📁 assets/          # Images and static files
│   ├── 📄 package.json         # Frontend dependencies
│   └── 📄 .env                 # Frontend environment variables
│
├── 📁 backend/                  # Node.js backend application
│   ├── 📁 config/              # Database and app configuration
│   ├── 📁 controllers/         # Request handlers
│   ├── 📁 middleware/          # Custom middleware functions
│   ├── 📁 models/              # MongoDB data models
│   ├── 📁 routes/              # API route definitions
│   ├── 📁 services/            # External service integrations
│   ├── 📄 server.js            # Main server file
│   ├── 📄 package.json         # Backend dependencies
│   └── 📄 .env                 # Backend environment variables
│
├── 📄 auction.sol               # Smart contract for auctions
└── 📄 README.md                # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- 📦 **Node.js** (v18 or higher)
- 🍃 **MongoDB** (local or Atlas)
- 🦊 **MetaMask** wallet extension
- 🔑 **API Keys** for Pinata and Gemini

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nxtman0z/AUCTRA.git
   cd AUCTRA
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**

   **Backend `.env`**
   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/auctra_db
   DB_NAME=auctra_db

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d

   # Admin Configuration
   ADMIN_KEY=your_admin_key

   # Pinata IPFS Configuration
   PINATA_API_KEY=your_pinata_api_key
   PINATA_SECRET_KEY=your_pinata_secret_key
   PINATA_JWT=your_pinata_jwt_token

   # Gemini AI Configuration
   GEMINI_API_KEY=your_gemini_api_key
   ```

   **Frontend `.env`**
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_ADMIN_KEY=your_admin_key
   ```

### Running the Application

1. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   npm start
   # Server runs on http://localhost:5000
   ```

3. **Start Frontend Application**
   ```bash
   cd frontend
   npm start
   # Application runs on http://localhost:3000
   ```

## 📚 API Documentation

### 🔐 **Authentication Endpoints**
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### 🏷️ **Auction Endpoints**
- `GET /api/auctions` - Get all auctions
- `POST /api/auctions` - Create new auction
- `GET /api/auctions/:id` - Get auction by ID
- `PUT /api/auctions/:id` - Update auction
- `DELETE /api/auctions/:id` - Delete auction
- `POST /api/auctions/:id/activate` - Activate auction

### 💰 **Bidding Endpoints**
- `POST /api/auctions/:auctionId/bids` - Place bid
- `GET /api/auctions/:auctionId/bids` - Get auction bids
- `GET /api/auctions/:auctionId/bids/highest` - Get highest bid

### 🤖 **AI Chatbot Endpoints**
- `POST /api/ai/chat` - Chat with AI assistant
- `GET /api/ai/help` - Get contextual help
- `POST /api/ai/intent` - Analyze user intent

## 🔧 Key Features Implementation

### 🔐 **Authentication System**
- JWT-based authentication with role-based access control
- Secure password hashing with bcrypt
- Wallet address integration for blockchain transactions

### 🌐 **IPFS Integration**
- File upload to Pinata IPFS network
- Metadata creation and management
- Decentralized storage for auction images and data

### 🤖 **AI Chatbot**
- Google Gemini AI integration
- Context-aware responses for auction-related queries
- Intent analysis for better user experience

### 🏷️ **Auction Management**
- Complete CRUD operations for auctions
- Real-time bid tracking and management
- Blockchain transaction verification

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Rate Limiting** - API request rate limiting
- **Input Validation** - Comprehensive data validation
- **CORS Protection** - Cross-origin request security
- **Helmet.js** - Security headers and protection
- **Environment Variables** - Sensitive data protection

## 🌍 Deployment

### **Frontend Deployment**
- Suitable for Vercel, Netlify, or AWS S3
- Build: `npm run build`
- Serve static files from `build/` directory

### **Backend Deployment**
- Compatible with Heroku, AWS EC2, or DigitalOcean
- Use PM2 for production process management
- Configure MongoDB Atlas for cloud database

### **Smart Contract Deployment**
- Deploy to Ethereum testnet (Sepolia/Goerli)
- Configure contract addresses in environment variables
- Verify contracts on Etherscan

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Authors

- **NXTMAN0Z** - *Initial work* - [GitHub](https://github.com/nxtman0z)

## 🙏 Acknowledgments

- **Pinata** for IPFS storage solutions
- **Google Gemini** for AI integration
- **MongoDB** for database services
- **React.js** and **Node.js** communities
- **Ethereum** blockchain ecosystem

## 📞 Support

For support, email us at support@auctra.com or create an issue in this repository.

---

<div align="center">
  <h3>🚀 Built with ❤️ for the Decentralized Future</h3>
  <p>
    <a href="https://github.com/nxtman0z/AUCTRA">⭐ Star this repo</a> •
    <a href="https://github.com/nxtman0z/AUCTRA/issues">🐛 Report Bug</a> •
    <a href="https://github.com/nxtman0z/AUCTRA/issues">💡 Request Feature</a>
  </p>
</div>