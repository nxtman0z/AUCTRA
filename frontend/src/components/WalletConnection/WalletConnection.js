import React, { useState } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import './WalletConnection.css';

const WalletConnection = () => {
  const { connectWallet, disconnect, account, isConnected, isLoading } = useWeb3();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowDropdown(false);
  };

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (isLoading) {
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
        <button className="wallet-btn connect" onClick={handleConnect}>
          <i className="fas fa-wallet me-2"></i>
          Connect Wallet
        </button>
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
                  onClick={() => navigator.clipboard.writeText(account)}
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