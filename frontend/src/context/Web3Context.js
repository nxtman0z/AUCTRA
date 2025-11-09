import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_CONFIG } from '../config/contractConfig';

const { CONTRACT_ADDRESS, CONTRACT_ABI } = CONTRACT_CONFIG;

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

  // Connect Wallet - Support multiple wallet types
  const connectWallet = async (walletType = 'metamask') => {
    setLoading(true);
    setError(null);
    
    try {
      // Clear any previous connection data first
      resetConnection();
      
      console.log(`🔄 Connecting ${walletType} wallet...`);

      let provider;
      let accounts;

      switch (walletType) {
        case 'metamask':
          // Check if MetaMask is installed
          if (!window.ethereum) {
            throw new Error('MetaMask is not installed. Please install MetaMask extension to continue.');
          }

          if (!window.ethereum.isMetaMask) {
            throw new Error('MetaMask extension is not properly loaded. Please refresh the page.');
          }

          // Request account access with fresh connection
          accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
          });

          if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found. Please unlock your MetaMask wallet.');
          }

          // Create provider using BrowserProvider for ethers v6
          provider = new ethers.BrowserProvider(window.ethereum, 'any');
          break;

        case 'walletconnect':
          throw new Error('WalletConnect integration coming soon!');

        case 'coinbase':
          throw new Error('Coinbase Wallet integration coming soon!');

        case 'trustwallet':
          throw new Error('Trust Wallet integration coming soon!');

        default:
          throw new Error(`Unsupported wallet type: ${walletType}`);
      }

      // Network check
      const network = await provider.getNetwork();
      console.log('🌐 Connected to network:', network.name, 'Chain ID:', network.chainId);

      // Get signer (ethers v6)
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      console.log('✅ Wallet connected successfully:', userAddress);

      // Update states
      setProvider(provider);
      setSigner(signer);
      setAccount(userAddress);
      setIsConnected(true);

      // Setup contract if we have the config
      if (CONTRACT_ADDRESS && CONTRACT_ABI) {
        try {
          const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
          setContract(contractInstance);
          console.log('📄 Contract initialized:', CONTRACT_ADDRESS);
        } catch (contractErr) {
          console.warn('⚠️ Contract initialization failed:', contractErr.message);
        }
      }

      // Store connection type
      localStorage.setItem('lastWalletType', walletType);
      localStorage.setItem('walletConnected', 'true');
      
      return {
        success: true,
        account: userAddress,
        network: network.name,
        chainId: network.chainId
      };

    } catch (err) {
      console.error('❌ Wallet connection failed:', err);
      
      let errorMessage = 'Failed to connect wallet. Please try again.';
      
      if (err.message.includes('User rejected')) {
        errorMessage = 'Connection cancelled by user.';
      } else if (err.message.includes('Already processing')) {
        errorMessage = 'Please check your wallet for pending requests.';
      } else if (err.message.includes('not installed')) {
        errorMessage = err.message;
      } else if (err.message.includes('coming soon')) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      resetConnection();
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Disconnect Wallet
  const disconnectWallet = async () => {
    try {
      console.log('🔄 Disconnecting wallet...');
      resetConnection();
      // Clear any localStorage data
      localStorage.removeItem('walletConnected');
      localStorage.removeItem('lastWalletType');
      console.log('✅ Wallet disconnected successfully');
    } catch (err) {
      console.error('❌ Error during disconnect:', err);
      resetConnection(); // Force reset even on error
    }
  };

  // Auto-connect check (optional)
  useEffect(() => {
    const checkConnection = async () => {
      // Don't auto-connect to prevent the user's complaint about auto-connection
      // User must manually connect each time for fresh session
      console.log('🔍 Ready for manual wallet connection');
    };

    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          console.log('🔄 No accounts connected');
          resetConnection();
        } else if (accounts[0] !== account) {
          console.log('🔄 Account changed:', accounts[0]);
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = () => {
        console.log('🔄 Network changed');
        // Force page reload on network change for stability
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account]);

  // Context value
  const contextValue = {
    // State
    account,
    provider,
    signer,
    contract,
    isConnected,
    loading,
    error,
    userInfo,
    
    // Methods
    connectWallet,
    disconnectWallet,
    resetConnection
  };

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Context;