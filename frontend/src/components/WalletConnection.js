import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import './WalletConnection.css';

const WalletConnection = () => {
  const { account, isConnected, connectWallet, disconnectWallet, loading, error } = useWeb3();
  const [localError, setLocalError] = useState('');

  const handleConnect = async () => {
    try {
      setLocalError('');
      console.log('🔄 User clicked Connect Wallet');
      
      // Show instruction if MetaMask is not popping up
      const timeout = setTimeout(() => {
        setLocalError('If MetaMask popup doesn\'t appear, please check if it\'s blocked or refresh the page.');
      }, 3000);
      
      await connectWallet();
      clearTimeout(timeout);
      console.log('✅ Wallet connection completed');
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      setLocalError(error.message || 'Failed to connect wallet');
    }
  };

  const handleDisconnect = async () => {
    try {
      console.log('🔄 User clicked Disconnect Wallet');
      await disconnectWallet();
      setLocalError('');
      console.log('✅ Wallet disconnected');
    } catch (error) {
      console.error('❌ Wallet disconnect failed:', error);
      setLocalError('Failed to disconnect wallet');
    }
  };

  if (loading) {
    return (
      <div className="wallet-connection">
        <button className="wallet-btn connecting" disabled>
          <span className="loading-spinner"></span>
          Connecting...
        </button>
      </div>
    );
  }

  if (localError || error) {
    return (
      <div className="wallet-connection">
        <button 
          className="wallet-btn error" 
          onClick={handleConnect}
          title={localError || error}
        >
          <i className="fas fa-exclamation-triangle"></i>
          Error - Retry
        </button>
      </div>
    );
  }

  if (isConnected && account) {
    return (
      <div className="wallet-connection">
        <div className="wallet-info">
          <span className="wallet-address">
            {account.substring(0, 6)}...{account.substring(account.length - 4)}
          </span>
          <button 
            className="wallet-btn disconnect" 
            onClick={handleDisconnect}
            title="Disconnect Wallet"
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-connection">
      <button 
        className="wallet-btn connect" 
        onClick={handleConnect}
        title="Connect Wallet"
      >
        <i className="fas fa-wallet"></i>
        Connect Wallet
      </button>
    </div>
  );
};

export default WalletConnection;