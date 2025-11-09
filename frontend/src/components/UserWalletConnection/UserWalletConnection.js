import React, { useState } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import './UserWalletConnection.css';

const UserWalletConnection = () => {
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

  const userWalletOptions = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: 'fab fa-ethereum',
      description: 'Most popular wallet for beginners',
      available: window.ethereum && window.ethereum.isMetaMask,
      installUrl: 'https://metamask.io/download.html',
      popular: true
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: 'fas fa-qrcode',
      description: 'Connect mobile wallets via QR',
      available: false,
      comingSoon: true
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: 'fas fa-coins',
      description: 'Easy wallet for new users',
      available: false,
      comingSoon: true
    },
    {
      id: 'trustwallet',
      name: 'Trust Wallet',
      icon: 'fas fa-shield-alt',
      description: 'Mobile-first secure wallet',
      available: false,
      comingSoon: true
    }
  ];

  const handleWalletConnect = async (walletType) => {
    try {
      setConnectingWallet(walletType);
      
      // Force fresh connection for user
      localStorage.removeItem('userWalletConnected');
      
      const result = await connectWallet(walletType);
      
      if (result) {
        localStorage.setItem('userWalletConnected', 'true');
        localStorage.setItem('userWalletType', walletType);
        setShowWalletOptions(false);
        console.log('🎯 User wallet connected successfully!');
      }
    } catch (err) {
      console.error('User wallet connection failed:', err);
    } finally {
      setConnectingWallet(null);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      localStorage.removeItem('userWalletConnected');
      localStorage.removeItem('userWalletType');
      console.log('🎯 User wallet disconnected');
    } catch (err) {
      console.error('User disconnect failed:', err);
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

  // User connected state
  if (isConnected && account) {
    return (
      <div className="user-wallet-connected">
        <div className="user-wallet-info">
          <div className="user-status">
            <i className="fas fa-user user-icon"></i>
            <span className="user-label">My Wallet</span>
          </div>
          <div className="user-address" onClick={copyAddress} title="Click to copy address">
            <i className="fas fa-wallet"></i>
            <span>{formatAddress(account)}</span>
            <i className="fas fa-copy copy-icon"></i>
          </div>
          <div className="user-balance">
            <i className="fas fa-coins"></i>
            <span>Ready for auctions</span>
          </div>
        </div>
        <button 
          className="btn btn-outline-secondary btn-sm user-disconnect"
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
    );
  }

  // User connection options
  return (
    <div className="user-wallet-connection">
      {error && (
        <div className="user-wallet-error">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      {!showWalletOptions && (
        <button 
          className="btn btn-primary user-connect-btn"
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
              <i className="fas fa-wallet me-2"></i>
              Connect Your Wallet
            </>
          )}
        </button>
      )}

      {showWalletOptions && (
        <div className="user-wallet-overlay">
          <div className="user-wallet-modal">
            <div className="user-wallet-header">
              <h5>
                <i className="fas fa-wallet me-2"></i>
                Connect Your Wallet
              </h5>
              <button 
                className="btn-close"
                onClick={() => setShowWalletOptions(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="user-wallet-info-box">
              <i className="fas fa-info-circle me-2"></i>
              <span>Choose a wallet to participate in auctions and manage your digital assets</span>
            </div>

            <div className="user-wallet-list">
              {userWalletOptions.map((wallet) => (
                <div key={wallet.id} className="user-wallet-option">
                  {wallet.available ? (
                    <button
                      className={`user-wallet-btn ${wallet.popular ? 'popular' : ''}`}
                      onClick={() => handleWalletConnect(wallet.id)}
                      disabled={connectingWallet === wallet.id}
                    >
                      <div className="user-wallet-content">
                        <div className="user-wallet-icon">
                          <i className={wallet.icon}></i>
                          {wallet.popular && <span className="popular-badge">Popular</span>}
                        </div>
                        <div className="user-wallet-details">
                          <div className="user-wallet-name">{wallet.name}</div>
                          <div className="user-wallet-description">{wallet.description}</div>
                        </div>
                        <div className="user-wallet-status">
                          {connectingWallet === wallet.id ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            <i className="fas fa-arrow-right"></i>
                          )}
                        </div>
                      </div>
                    </button>
                  ) : (
                    <div className="user-wallet-unavailable">
                      <div className="user-wallet-content">
                        <div className="user-wallet-icon disabled">
                          <i className={wallet.icon}></i>
                        </div>
                        <div className="user-wallet-details">
                          <div className="user-wallet-name">{wallet.name}</div>
                          <div className="user-wallet-description">
                            {wallet.comingSoon ? 'Coming Soon' : 'Not Available'}
                          </div>
                        </div>
                        <div className="user-wallet-status">
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

            <div className="user-wallet-footer">
              <p className="security-note">
                <i className="fas fa-lock me-1"></i>
                We never store your private keys. Your wallet stays secure.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserWalletConnection;