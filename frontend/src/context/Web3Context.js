import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_CONFIG } from '../config/contractConfig';

const { CONTRACT_ADDRESS, CONTRACT_ABI, AUCTION_ABI } = CONTRACT_CONFIG;

// Create Web3 Context
const Web3Context = createContext();

// Custom hook to use Web3 Context
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

// Web3 Provider Component
export const Web3Provider = ({ children }) => {
  // Core States
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  // Connect Wallet
  const connectWallet = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask extension to continue.');
      }

      // Check if MetaMask is available and ready
      if (!window.ethereum.isMetaMask) {
        throw new Error('MetaMask extension is not properly loaded. Please refresh the page.');
      }

      console.log('🔄 Requesting wallet connection...');

      // Request accounts with proper error handling
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your MetaMask wallet.');
      }

      console.log('✅ Wallet connected:', accounts[0]);

      // Create provider and signer
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      
      // Create contract instance
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        web3Signer
      );

      // Update states
      setAccount(accounts[0]);
      setProvider(web3Provider);
      setSigner(web3Signer);
      setContract(contractInstance);
      setIsConnected(true);

      // Store connection in localStorage
      localStorage.setItem('walletConnected', 'true');

      // Get user info from contract
      await fetchUserInfo(contractInstance, accounts[0]);

      return accounts[0];

    } catch (err) {
      console.error('❌ Wallet connection failed:', err);
      
      // Handle specific errors
      if (err.code === 4001) {
        setError('Connection rejected. Please connect your wallet to continue.');
      } else if (err.code === -32002) {
        setError('Connection request pending. Please check MetaMask.');
      } else {
        setError(err.message);
      }
      
      resetConnection();
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Disconnect Wallet
  const disconnectWallet = async () => {
    try {
      console.log('🔄 Disconnecting wallet...');
      resetConnection();
      localStorage.removeItem('walletConnected');
      console.log('✅ Wallet disconnected successfully');
    } catch (err) {
      console.error('❌ Error during disconnect:', err);
      resetConnection(); // Force reset even on error
    }
  };

  // Reset connection state
  const resetConnection = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setContract(null);
    setIsConnected(false);
    setUserInfo(null);
    setError(null);
  };

  // Fetch user information from contract
  const fetchUserInfo = async (contractInstance, userAddress) => {
    try {
      const isRegistered = await contractInstance.isRegisteredUser(userAddress);
      if (isRegistered) {
        const userData = await contractInstance.users(userAddress);
        const isUserAdmin = await contractInstance.isAdmin(userAddress);
        
        setUserInfo({
          email: userData.email,
          isVerified: userData.isVerified,
          isAdmin: isUserAdmin,
          auctionsCreated: userData.auctionsCreated.toString(),
          auctionsWon: userData.auctionsWon.toString(),
          walletAddress: userData.walletAddress,
          isRegistered: true
        });
      } else {
        setUserInfo({
          isRegistered: false,
          walletAddress: userAddress,
          isAdmin: false
        });
      }
    } catch (err) {
      console.error('Error fetching user info:', err);
      setUserInfo({
        isRegistered: false,
        walletAddress: userAddress,
        isAdmin: false
      });
    }
  };

  // =================== FACTORY CONTRACT FUNCTIONS ===================

  // Register User (Admin only function)
  const registerUser = async (userAddress, email) => {
    if (!contract || !userInfo?.isAdmin) {
      throw new Error('Only admin can register users');
    }

    try {
      setLoading(true);
      const tx = await contract.registerUser(userAddress, email);
      await tx.wait();
      
      // Refresh user info
      await fetchUserInfo(contract, account);
      return true;
    } catch (err) {
      throw new Error('Registration failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add Admin (Owner only)
  const addAdmin = async (adminAddress) => {
    if (!contract || !signer) {
      throw new Error('Contract or signer not initialized');
    }

    try {
      setLoading(true);
      const tx = await contract.addAdmin(adminAddress);
      await tx.wait();
      return true;
    } catch (err) {
      throw new Error('Failed to add admin: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create Auction (Verified users only)
  const createAuction = async (productName, productDescription, imageHash, startingPrice, durationInHours) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      setLoading(true);
      
      // Convert starting price from ETH to Wei
      const startingPriceWei = ethers.parseEther(startingPrice.toString());
      
      const tx = await contract.createAuction(
        productName,
        productDescription,
        imageHash,
        startingPriceWei,
        durationInHours
      );
      
      const receipt = await tx.wait();
      
      // Get the auction address from the event
      const auctionCreatedEvent = receipt.logs.find(
        log => log.fragment?.name === 'AuctionCreated'
      );
      
      if (auctionCreatedEvent) {
        return auctionCreatedEvent.args[0]; // auction contract address
      }
      
      return null;
    } catch (err) {
      throw new Error('Failed to create auction: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get All Active Auctions
  const getAllActiveAuctions = async () => {
    if (!contract) {
      throw new Error('Please connect your wallet first');
    }

    try {
      const activeAuctions = await contract.getAllActiveAuctions();
      return activeAuctions;
    } catch (err) {
      throw new Error('Failed to fetch auctions: ' + err.message);
    }
  };

  // Get User's Auctions
  const getUserAuctions = async (userAddress) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const userAuctions = await contract.getUserAuctions(userAddress || account);
      return userAuctions;
    } catch (err) {
      throw new Error('Failed to fetch user auctions: ' + err.message);
    }
  };

  // Check if user is admin
  const checkIsAdmin = async (userAddress) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const isUserAdmin = await contract.isAdmin(userAddress || account);
      return isUserAdmin;
    } catch (err) {
      throw new Error('Failed to check admin status: ' + err.message);
    }
  };

  // Update platform fee (Owner only)
  const updatePlatformFee = async (newFeeInBasisPoints) => {
    if (!contract || !signer) {
      throw new Error('Contract or signer not initialized');
    }

    try {
      setLoading(true);
      const tx = await contract.updatePlatformFee(newFeeInBasisPoints);
      await tx.wait();
      return true;
    } catch (err) {
      throw new Error('Failed to update platform fee: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get platform fee
  const getPlatformFee = async () => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const fee = await contract.platformFee();
      return fee.toString();
    } catch (err) {
      throw new Error('Failed to fetch platform fee: ' + err.message);
    }
  };

  // =================== AUCTION CONTRACT FUNCTIONS ===================

  // Get auction details (Full details for auction page)
  const getAuctionDetails = async (auctionAddress) => {
    if (!provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const auctionContract = new ethers.Contract(
        auctionAddress,
        AUCTION_ABI,
        provider
      );

      const details = await auctionContract.getFullDetails();
      
      return {
        name: details[0],
        description: details[1],
        image: details[2],
        seller: details[3],
        currentBid: ethers.formatEther(details[4]),
        currentWinner: details[5],
        timeLeft: details[6].toString(),
        isLive: details[7],
        hasFinished: details[8],
        auctionAddress
      };
    } catch (err) {
      throw new Error('Failed to get auction details: ' + err.message);
    }
  };

  // Get auction summary (Light version for auction lists)
  const getAuctionSummary = async (auctionAddress) => {
    if (!provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const auctionContract = new ethers.Contract(
        auctionAddress,
        AUCTION_ABI,
        provider
      );

      const summary = await auctionContract.getAuctionSummary();
      
      return {
        name: summary[0],
        currentBid: ethers.formatEther(summary[1]),
        timeLeft: parseInt(summary[2]),
        isLive: summary[3],
        image: summary[4],
        auctionAddress
      };
    } catch (err) {
      throw new Error('Failed to get auction summary: ' + err.message);
    }
  };

  // Place Bid
  const placeBid = async (auctionAddress, bidAmount) => {
    if (!signer) {
      throw new Error('Signer not initialized');
    }

    try {
      setLoading(true);
      
      const auctionContract = new ethers.Contract(
        auctionAddress,
        AUCTION_ABI,
        signer
      );

      const bidAmountWei = ethers.parseEther(bidAmount.toString());
      const tx = await auctionContract.placeBid({ value: bidAmountWei });
      await tx.wait();
      
      return true;
    } catch (err) {
      throw new Error('Failed to place bid: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // End Auction
  const endAuction = async (auctionAddress) => {
    if (!signer) {
      throw new Error('Signer not initialized');
    }

    try {
      setLoading(true);
      
      const auctionContract = new ethers.Contract(
        auctionAddress,
        AUCTION_ABI,
        signer
      );

      const tx = await auctionContract.endAuction();
      await tx.wait();
      
      return true;
    } catch (err) {
      throw new Error('Failed to end auction: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Withdraw Funds (for non-winners)
  const withdrawFunds = async (auctionAddress) => {
    if (!signer) {
      throw new Error('Signer not initialized');
    }

    try {
      setLoading(true);
      
      const auctionContract = new ethers.Contract(
        auctionAddress,
        AUCTION_ABI,
        signer
      );

      const tx = await auctionContract.withdraw();
      await tx.wait();
      
      return true;
    } catch (err) {
      throw new Error('Failed to withdraw funds: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cancel auction (Seller only, no bids)
  const cancelAuction = async (auctionAddress) => {
    if (!signer) {
      throw new Error('Signer not initialized');
    }

    try {
      setLoading(true);
      
      const auctionContract = new ethers.Contract(
        auctionAddress,
        AUCTION_ABI,
        signer
      );

      const tx = await auctionContract.cancelAuction();
      await tx.wait();
      
      return true;
    } catch (err) {
      throw new Error('Failed to cancel auction: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get bid history for an auction
  const getBidHistory = async (auctionAddress) => {
    if (!provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const auctionContract = new ethers.Contract(
        auctionAddress,
        AUCTION_ABI,
        provider
      );

      const bidders = await auctionContract.getBidHistory();
      return bidders;
    } catch (err) {
      throw new Error('Failed to get bid history: ' + err.message);
    }
  };

  // Get withdrawable amount for user
  const getWithdrawableAmount = async (auctionAddress, userAddress) => {
    if (!provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const auctionContract = new ethers.Contract(
        auctionAddress,
        AUCTION_ABI,
        provider
      );

      const amount = await auctionContract.canWithdraw(userAddress || account);
      return ethers.formatEther(amount);
    } catch (err) {
      throw new Error('Failed to get withdrawable amount: ' + err.message);
    }
  };

  // Get pending refund for user
  const getPendingRefund = async (auctionAddress, userAddress) => {
    if (!provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const auctionContract = new ethers.Contract(
        auctionAddress,
        AUCTION_ABI,
        provider
      );

      const refund = await auctionContract.getPendingRefund(userAddress || account);
      return ethers.formatEther(refund);
    } catch (err) {
      throw new Error('Failed to get pending refund: ' + err.message);
    }
  };

  // Get time remaining for auction
  const getTimeRemaining = async (auctionAddress) => {
    if (!provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const auctionContract = new ethers.Contract(
        auctionAddress,
        AUCTION_ABI,
        provider
      );

      const timeLeft = await auctionContract.getTimeRemaining();
      return parseInt(timeLeft);
    } catch (err) {
      throw new Error('Failed to get time remaining: ' + err.message);
    }
  };

  // Check if wallet was previously connected
  const checkConnection = async () => {
    try {
      if (!window.ethereum || !window.ethereum.isMetaMask) {
        return;
      }

      // Check if wallet was previously connected
      const wasConnected = localStorage.getItem('walletConnected');
      
      if (wasConnected === 'true') {
        // Check if there are connected accounts
        const accounts = await window.ethereum.request({
          method: 'eth_accounts'
        });

        if (accounts && accounts.length > 0) {
          console.log('🔄 Auto-connecting to wallet...');
          
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          const web3Signer = await web3Provider.getSigner();
          const contractInstance = new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            web3Signer
          );

          setAccount(accounts[0]);
          setProvider(web3Provider);
          setSigner(web3Signer);
          setContract(contractInstance);
          setIsConnected(true);

          await fetchUserInfo(contractInstance, accounts[0]);
          console.log('✅ Auto-connected successfully');
        } else {
          // No accounts connected, remove the flag
          localStorage.removeItem('walletConnected');
        }
      }
    } catch (err) {
      console.error('❌ Auto-connection failed:', err);
      localStorage.removeItem('walletConnected');
    }
  };

  // Initialize on component mount  
  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        if (typeof window.ethereum !== 'undefined') {
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(web3Provider);
          
          // Check for existing connection
          await checkConnection();
        } else {
          setError('Please install MetaMask extension to use this application');
        }
      } catch (err) {
        setError('Failed to initialize Web3: ' + err.message);
      }
    };

    // Wait a bit for MetaMask to load
    const timer = setTimeout(() => {
      initializeWeb3();
    }, 100);

    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        console.log('👤 Account changed:', accounts);
        if (accounts.length === 0) {
          // All accounts disconnected
          disconnectWallet();
        } else if (accounts[0] !== account) {
          // Different account selected
          if (isConnected) {
            // Reconnect with new account
            connectWallet();
          }
        }
      };

      const handleChainChanged = (chainId) => {
        console.log('🔗 Chain changed:', chainId);
        // Reload the page when chain changes
        window.location.reload();
      };

      const handleConnect = (connectInfo) => {
        console.log('🔌 MetaMask connected:', connectInfo);
      };

      const handleDisconnect = (error) => {
        console.log('🔌 MetaMask disconnected:', error);
        disconnectWallet();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('connect', handleConnect);
      window.ethereum.on('disconnect', handleDisconnect);

      return () => {
        clearTimeout(timer);
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
          window.ethereum.removeListener('connect', handleConnect);
          window.ethereum.removeListener('disconnect', handleDisconnect);
        }
      };
    }

    return () => clearTimeout(timer);
  }, []);

  // Context value with only necessary functions
  const value = {
    // States
    account,
    provider,
    signer,
    contract,
    isConnected,
    loading,
    error,
    userInfo,
    
    // Wallet Functions
    connectWallet,
    disconnectWallet,
    
    // Factory Contract Functions
    registerUser,
    addAdmin,
    createAuction,
    getAllActiveAuctions,
    getUserAuctions,
    checkIsAdmin,
    updatePlatformFee,
    getPlatformFee,
    
    // Auction Contract Functions  
    getAuctionDetails,
    getAuctionSummary,
    placeBid,
    endAuction,
    withdrawFunds,
    cancelAuction,
    getBidHistory,
    getWithdrawableAmount,
    getPendingRefund,
    getTimeRemaining
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Context;