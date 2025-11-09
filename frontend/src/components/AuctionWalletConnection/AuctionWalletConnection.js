import React, { useState } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import './AuctionWalletConnection.css';

const AuctionWalletConnection = ({ requiredForBidding = false, minimumBalance = "0.01" }) => {
  const { 
    account, 
    isConnected, 
    connectWallet, 
    disconnectWallet, 
    loading, 
    error 
  } = useWeb3();
  
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState(null);

  const auctionWalletOptions = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: 'fab fa-ethereum',
      description: 'Best for auction bidding',
      available: window.ethereum && window.ethereum.isMetaMask,
      installUrl: 'https://metamask.io/download.html',
      recommended: true
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: 'fas fa-qrcode',
      description: 'Mobile wallet support',
      available: false,
      comingSoon: true
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: 'fas fa-coins',
      description: 'Easy crypto buying & selling',
      available: false,
      comingSoon: true
    },
    {
      id: 'trustwallet',
      name: 'Trust Wallet',
      icon: 'fas fa-shield-alt',
      description: 'Secure mobile wallet',
      available: false,
      comingSoon: true
    }
  ];

  const handleWalletConnect = async (walletType) => {
    try {
      setConnectingWallet(walletType);
      
      // Force fresh connection for auction participant
      localStorage.removeItem('auctionWalletConnected');
      
      const result = await connectWallet(walletType);
      
      if (result) {
        localStorage.setItem('auctionWalletConnected', 'true');
        localStorage.setItem('auctionWalletType', walletType);
        setShowWalletOptions(false);
        console.log('🏆 Auction wallet connected successfully!');
      }
    } catch (err) {
      console.error('Auction wallet connection failed:', err);
    } finally {
      setConnectingWallet(null);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      localStorage.removeItem('auctionWalletConnected');
      localStorage.removeItem('auctionWalletType');
      console.log('🏆 Auction wallet disconnected');
    } catch (err) {
      console.error('Auction disconnect failed:', err);
    }
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Auction participant connected state
  if (isConnected && account) {
    return (
      <div className="auction-wallet-connected">
        <div className="auction-wallet-info">
          <div className="auction-status">
            <i className="fas fa-gavel auction-icon"></i>
            <span className="auction-label">Ready to Bid</span>
          </div>
          <div className="auction-address" onClick={copyAddress} title="Click to copy address">
            <i className="fas fa-wallet"></i>
            <span>{formatAddress(account)}</span>
            <i className="fas fa-copy copy-icon"></i>
          </div>
          <div className="auction-balance">
            <i className="fas fa-ethereum-logo"></i>
            <span>Connected & Ready</span>
          </div>
        </div>
        <div className="auction-actions">
          <button 
            className="btn btn-outline-light btn-sm auction-disconnect"
            onClick={handleDisconnect}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              <i className="fas fa-sign-out-alt"></i>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Auction connection options
  return (
    <div className="auction-wallet-connection">
      {error && (
        <div className="auction-wallet-error">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      {!showWalletOptions && (
        <button 
          className="btn btn-success auction-connect-btn"
          onClick={() => setShowWalletOptions(true)}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Connecting...
            </>
          ) : (
            <>
              <i className="fas fa-gavel me-2"></i>
              {requiredForBidding ? 'Connect to Bid' : 'Join Auction'}
            </>
          )}
        </button>
      )}

      {showWalletOptions && (
        <div className="auction-wallet-overlay">
          <div className="auction-wallet-modal">
            <div className="auction-wallet-header">
              <h5>
                <i className="fas fa-gavel me-2"></i>
                Connect for Auction
              </h5>
              <button 
                className="btn-close"
                onClick={() => setShowWalletOptions(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {requiredForBidding && (
              <div className="auction-requirement-box">
                <i className="fas fa-info-circle me-2"></i>
                <div>
                  <strong>Auction Requirements:</strong>
                  <ul>
                    <li>Minimum {minimumBalance} ETH for bidding</li>
                    <li>Gas fees for transactions</li>
                    <li>Stable internet connection</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="auction-wallet-list">
              {auctionWalletOptions.map((wallet) => (
                <div key={wallet.id} className="auction-wallet-option">
                  {wallet.available ? (
                    <button
                      className={`auction-wallet-btn ${wallet.recommended ? 'recommended' : ''}`}
                      onClick={() => handleWalletConnect(wallet.id)}
                      disabled={connectingWallet === wallet.id}
                    >
                      <div className="auction-wallet-content">
                        <div className="auction-wallet-icon">
                          <i className={wallet.icon}></i>
                          {wallet.recommended && <span className="recommended-badge">Recommended</span>}
                        </div>
                        <div className="auction-wallet-details">
                          <div className="auction-wallet-name">{wallet.name}</div>
                          <div className="auction-wallet-description">{wallet.description}</div>
                        </div>
                        <div className="auction-wallet-status">
                          {connectingWallet === wallet.id ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            <i className="fas fa-arrow-right"></i>
                          )}
                        </div>
                      </div>
                    </button>
                  ) : (
                    <div className="auction-wallet-unavailable">
                      <div className="auction-wallet-content">
                        <div className="auction-wallet-icon disabled">
                          <i className={wallet.icon}></i>
                        </div>
                        <div className="auction-wallet-details">
                          <div className="auction-wallet-name">{wallet.name}</div>
                          <div className="auction-wallet-description">
                            {wallet.comingSoon ? 'Coming Soon' : 'Not Available'}
                          </div>
                        </div>
                        <div className="auction-wallet-status">
                          {!wallet.comingSoon && wallet.installUrl && (
                            <a 
                              href={wallet.installUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="install-link"
                            >
                              Install
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="auction-wallet-footer">
              <div className="auction-tips">
                <h6><i className="fas fa-lightbulb me-2"></i>Bidding Tips:</h6>
                <ul>
                  <li>Keep your wallet unlocked during auction</li>
                  <li>Set gas price appropriately for fast transactions</li>
                  <li>Monitor your bid status in real-time</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionWalletConnection;