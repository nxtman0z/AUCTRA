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
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      console.log('🔄 Requesting wallet connection...');

      // Check if already connected - if yes, disconnect first
      const currentAccounts = await window.ethereum.request({
        method: 'eth_accounts'
      });

      if (currentAccounts.length > 0) {
        console.log('⚠️ Wallet already connected, requesting fresh connection...');
        // We need to request accounts again to ensure user consent
      }

      // Force MetaMask popup by requesting accounts (this should always show popup for user interaction)
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please make sure your wallet is unlocked.');
      }

      console.log('✅ Wallet connected:', accounts[0]);

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

      // Get user info from contract
      await fetchUserInfo(contractInstance, accounts[0]);

    } catch (err) {
      console.error('❌ Wallet connection failed:', err);
      setError('Failed to connect wallet: ' + err.message);
      
      // Reset connection state on error
      setAccount(null);
      setProvider(null);
      setSigner(null);
      setContract(null);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // Disconnect Wallet
  const disconnectWallet = async () => {
    try {
      console.log('🔄 Disconnecting wallet...');
      
      // Clear all React state
      setAccount(null);
      setProvider(null);
      setSigner(null);
      setContract(null);
      setIsConnected(false);
      setUserInfo(null);
      setError(null);

      // Try to revoke permissions (if MetaMask supports it)
      if (window.ethereum && window.ethereum.request) {
        try {
          // This might not work in all MetaMask versions, but we'll try
          await window.ethereum.request({
            method: 'wallet_revokePermissions',
            params: [{
              eth_accounts: {}
            }]
          });
          console.log('✅ MetaMask permissions revoked');
        } catch (err) {
          console.log('⚠️ Could not revoke MetaMask permissions:', err.message);
          // This is expected in most cases, not a real error
        }
      }

      console.log('✅ Wallet disconnected successfully');
    } catch (err) {
      console.error('❌ Error during disconnect:', err);
      // Still clear the state even if permission revocation fails
      setAccount(null);
      setProvider(null);
      setSigner(null);
      setContract(null);
      setIsConnected(false);
      setUserInfo(null);
      setError(null);
    }
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
          walletAddress: userAddress
        });
      }
    } catch (err) {
      console.error('Error fetching user info:', err);
      setUserInfo({
        isRegistered: false,
        walletAddress: userAddress
      });
    }
  };

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

  // Create Auction
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

    if (!isConnected) {
      throw new Error('Wallet not connected');
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
      const userAuctions = await contract.getUserAuctions(userAddress);
      return userAuctions;
    } catch (err) {
      throw new Error('Failed to fetch user auctions: ' + err.message);
    }
  };

  // Get Platform Fee
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

  // Get Total Auctions
  const getTotalAuctions = async () => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const total = await contract.totalAuctions();
      return total.toString();
    } catch (err) {
      throw new Error('Failed to fetch total auctions: ' + err.message);
    }
  };

  // Get Owner
  const getOwner = async () => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const owner = await contract.owner();
      return owner;
    } catch (err) {
      throw new Error('Failed to fetch owner: ' + err.message);
    }
  };

  // Get fee recipient address
  const getFeeRecipient = async () => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const recipient = await contract.feeRecipient();
      return recipient;
    } catch (err) {
      throw new Error('Failed to fetch fee recipient: ' + err.message);
    }
  };

  // Check if contract is paused
  const isPaused = async () => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const paused = await contract.paused();
      return paused;
    } catch (err) {
      throw new Error('Failed to check pause status: ' + err.message);
    }
  };

  // Get all auction addresses
  const getAllAuctions = async () => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const totalAuctions = await contract.totalAuctions();
      const allAuctionAddresses = [];
      
      for (let i = 0; i < parseInt(totalAuctions); i++) {
        try {
          const auctionAddress = await contract.allAuctions(i);
          allAuctionAddresses.push(auctionAddress);
        } catch (err) {
          console.warn(`Failed to fetch auction at index ${i}:`, err.message);
        }
      }
      
      return allAuctionAddresses;
    } catch (err) {
      throw new Error('Failed to fetch all auctions: ' + err.message);
    }
  };

  // Get address from email
  const getAddressFromEmail = async (email) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const address = await contract.emailToAddress(email);
      return address;
    } catch (err) {
      throw new Error('Failed to fetch address from email: ' + err.message);
    }
  };

  // Get user auctions count for specific user
  const getUserAuctionsCount = async (userAddress) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const userAuctions = await contract.getUserAuctions(userAddress || account);
      return userAuctions.length;
    } catch (err) {
      throw new Error('Failed to fetch user auctions count: ' + err.message);
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

  // Get user details from contract
  const getUserDetails = async (userAddress) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const userDetails = await contract.users(userAddress || account);
      return {
        email: userDetails[0],
        isVerified: userDetails[1],
        isAdmin: userDetails[2],
        auctionsCreated: userDetails[3].toString(),
        auctionsWon: userDetails[4].toString(),
        walletAddress: userDetails[5]
      };
    } catch (err) {
      throw new Error('Failed to fetch user details: ' + err.message);
    }
  };

  // Get auction details
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

  // Get auction summary (lighter version for lists)
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
        image: summary[4]
      };
    } catch (err) {
      throw new Error('Failed to get auction summary: ' + err.message);
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

  // Check withdrawable amount for user
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

  // Withdraw Funds
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

  // Cancel auction (only seller, only if no bids)
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

  // Transfer ownership (only owner)
  const transferOwnership = async (newOwnerAddress) => {
    if (!contract || !signer) {
      throw new Error('Contract or signer not initialized');
    }

    try {
      setLoading(true);
      
      const tx = await contract.transferOwnership(newOwnerAddress);
      await tx.wait();
      
      return true;
    } catch (err) {
      throw new Error('Failed to transfer ownership: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update platform fee (only owner)
  const updatePlatformFee = async (newFeeInBasisPoints) => {
    if (!contract || !signer) {
      throw new Error('Contract or signer not initialized');
    }

    try {
      setLoading(true);
      
      // Convert percentage to basis points (e.g., 2.5% = 250 basis points)
      const tx = await contract.updatePlatformFee(newFeeInBasisPoints);
      await tx.wait();
      
      return true;
    } catch (err) {
      throw new Error('Failed to update platform fee: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add admin (only owner)
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

  // Initialize on component mount
  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        if (typeof window.ethereum !== 'undefined') {
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(web3Provider);
          
          // Don't auto-connect, just check if MetaMask is available
          // User must explicitly click "Connect Wallet" button
        } else {
          setError('Please install MetaMask to use this application');
        }
      } catch (err) {
        setError('Failed to initialize Web3: ' + err.message);
      }
    };

    initializeWeb3();

    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // Only disconnect if we were previously connected
          if (isConnected) {
            disconnectWallet();
          }
        }
        // Don't auto-connect on account change - user must manually connect
      };

      const handleChainChanged = () => {
        // Refresh the page to reset the dapp state
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    // State
    account,
    provider,
    signer,
    contract,
    isConnected,
    loading,
    error,
    userInfo,

    // Actions
    connectWallet,
    disconnectWallet,
    registerUser,
    createAuction,
    getAllActiveAuctions,
    getUserAuctions,
    getAuctionDetails,
    placeBid,
    endAuction,
    withdrawFunds,
    fetchUserInfo,
    
    // Factory Contract Read Functions
    getPlatformFee,
    getTotalAuctions,
    getOwner,
    getFeeRecipient,
    isPaused,
    getAllAuctions,
    getAddressFromEmail,
    getUserAuctionsCount,
    checkIsAdmin,
    getUserDetails,
    
    // Auction Contract Read Functions
    getAuctionSummary,
    getBidHistory,
    getWithdrawableAmount,
    getPendingRefund,
    getTimeRemaining,
    
    // Write Functions (require transactions)
    cancelAuction,
    transferOwnership,
    updatePlatformFee,
    addAdmin,

    // Utils
    setError,
    setLoading
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Context;