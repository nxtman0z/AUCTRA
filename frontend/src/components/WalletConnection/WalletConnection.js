import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import './WalletConnection.css';

const WalletConnection = () => {
  const { connectWallet, disconnectWallet, account, isConnected, loading, error } = useWeb3();
  const [showDropdown, setShowDropdown] = useState(false);
  const [connectionError, setConnectionError] = useState('');

  // Clear error when component unmounts or connection changes
  useEffect(() => {
    if (isConnected) {
      setConnectionError('');
    }
  }, [isConnected]);

  const handleConnect = async () => {
    try {
      setConnectionError('');
      await connectWallet();
    } catch (err) {
      console.error('Wallet connection failed:', err);
      setConnectionError(err.message);
      
      // Auto-clear error after 5 seconds
      setTimeout(() => {
        setConnectionError('');
      }, 5000);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      setShowDropdown(false);
      setConnectionError('');
    } catch (err) {
      console.error('Wallet disconnect failed:', err);
    }
  };

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
  };

  if (loading) {
    return (
      <div className="wallet-connection">
        <button className="wallet-btn connecting" disabled>
          <i className="fas fa-spinner fa-spin me-2"></i>
          Connecting...
        </button>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="wallet-connection">
        {!isMetaMaskInstalled() ? (
          <div className="wallet-error">
            <button className="wallet-btn error" disabled>
              <i className="fas fa-exclamation-triangle me-2"></i>
              MetaMask Required
            </button>
            <div className="error-tooltip">
              <a 
                href="https://metamask.io/download/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="install-link"
              >
                Install MetaMask
              </a>
            </div>
          </div>
        ) : (
          <div className="wallet-connect-container">
            <button className="wallet-btn connect" onClick={handleConnect}>
              <i className="fas fa-wallet me-2"></i>
              Connect Wallet
            </button>
            {(connectionError || error) && (
              <div className="wallet-error-message">
                <i className="fas fa-exclamation-circle me-1"></i>
                {connectionError || error}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="wallet-connection">
      <div className="wallet-dropdown">
        <button 
          className="wallet-btn connected"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <i className="fas fa-wallet me-2"></i>
          {truncateAddress(account)}
          <i className={`fas fa-chevron-${showDropdown ? 'up' : 'down'} ms-2`}></i>
        </button>
        
        {showDropdown && (
          <div className="wallet-dropdown-menu">
            <div className="wallet-info">
              <div className="wallet-address">
                <i className="fas fa-copy me-2"></i>
                <span title={account}>{account}</span>
                <button 
                  className="copy-btn"
                  onClick={() => copyToClipboard(account)}
                  title="Copy address"
                >
                  <i className="fas fa-copy"></i>
                </button>
              </div>
            </div>
            <hr />
            <button className="disconnect-btn" onClick={handleDisconnect}>
              <i className="fas fa-sign-out-alt me-2"></i>
              Disconnect
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletConnection;