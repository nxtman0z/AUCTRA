import React, { useState } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import './AdminWalletConnection.css';

const AdminWalletConnection = () => {
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

  const adminWalletOptions = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: 'fab fa-ethereum',
      description: 'Admin MetaMask Wallet',
      available: window.ethereum && window.ethereum.isMetaMask,
      installUrl: 'https://metamask.io/download.html',
      recommended: true
    },
    {
      id: 'hardware',
      name: 'Hardware Wallet',
      icon: 'fas fa-shield-alt',
      description: 'Ledger/Trezor (Secure)',
      available: false,
      comingSoon: true,
      secure: true
    }
  ];

  const handleWalletConnect = async (walletType) => {
    try {
      setConnectingWallet(walletType);
      
      // Force fresh connection for admin
      localStorage.removeItem('adminWalletConnected');
      
      const result = await connectWallet(walletType);
      
      if (result) {
        localStorage.setItem('adminWalletConnected', 'true');
        localStorage.setItem('adminWalletType', walletType);
        setShowWalletOptions(false);
        console.log('👑 Admin wallet connected successfully!');
      }
    } catch (err) {
      console.error('Admin wallet connection failed:', err);
    } finally {
      setConnectingWallet(null);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      localStorage.removeItem('adminWalletConnected');
      localStorage.removeItem('adminWalletType');
      console.log('👑 Admin wallet disconnected');
    } catch (err) {
      console.error('Admin disconnect failed:', err);
    }
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };

  // Admin connected state
  if (isConnected && account) {
    return (
      <div className="admin-wallet-connected">
        <div className="admin-wallet-info">
          <div className="admin-status">
            <i className="fas fa-crown admin-crown"></i>
            <span className="admin-label">Admin Wallet</span>
          </div>
          <div className="admin-address" onClick={copyAddress} title="Click to copy">
            <i className="fas fa-wallet"></i>
            <span>{formatAddress(account)}</span>
            <i className="fas fa-copy copy-icon"></i>
          </div>
          <div className="admin-security">
            <i className="fas fa-shield-check security-icon"></i>
            <span>Secured</span>
          </div>
        </div>
        <button 
          className="btn btn-outline-light btn-sm admin-disconnect"
          onClick={handleDisconnect}
          disabled={loading}
        >
          {loading ? (
            <span className="spinner-border spinner-border-sm"></span>
          ) : (
            <>
              <i className="fas fa-sign-out-alt"></i>
              <span className="ms-1">Disconnect</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // Admin connection options
  return (
    <div className="admin-wallet-connection">
      {error && (
        <div className="admin-wallet-error">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      {!showWalletOptions && (
        <button 
          className="btn btn-warning admin-connect-btn"
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
              <i className="fas fa-crown me-2"></i>
              Connect Admin Wallet
            </>
          )}
        </button>
      )}

      {showWalletOptions && (
        <div className="admin-wallet-overlay">
          <div className="admin-wallet-modal">
            <div className="admin-wallet-header">
              <h5>
                <i className="fas fa-crown me-2"></i>
                Admin Wallet Connection
              </h5>
              <button 
                className="btn-close"
                onClick={() => setShowWalletOptions(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="admin-wallet-warning">
              <i className="fas fa-shield-alt me-2"></i>
              <strong>Security Notice:</strong> Only connect your trusted admin wallet
            </div>

            <div className="admin-wallet-list">
              {adminWalletOptions.map((wallet) => (
                <div key={wallet.id} className="admin-wallet-option">
                  {wallet.available ? (
                    <button
                      className={`admin-wallet-btn ${wallet.recommended ? 'recommended' : ''}`}
                      onClick={() => handleWalletConnect(wallet.id)}
                      disabled={connectingWallet === wallet.id}
                    >
                      <div className="admin-wallet-content">
                        <div className="admin-wallet-icon">
                          <i className={wallet.icon}></i>
                          {wallet.recommended && <span className="recommended-badge">Recommended</span>}
                        </div>
                        <div className="admin-wallet-details">
                          <div className="admin-wallet-name">{wallet.name}</div>
                          <div className="admin-wallet-description">{wallet.description}</div>
                        </div>
                        <div className="admin-wallet-status">
                          {connectingWallet === wallet.id ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            <i className="fas fa-arrow-right"></i>
                          )}
                        </div>
                      </div>
                    </button>
                  ) : (
                    <div className="admin-wallet-unavailable">
                      <div className="admin-wallet-content">
                        <div className="admin-wallet-icon disabled">
                          <i className={wallet.icon}></i>
                        </div>
                        <div className="admin-wallet-details">
                          <div className="admin-wallet-name">{wallet.name}</div>
                          <div className="admin-wallet-description">
                            {wallet.comingSoon ? 'Coming Soon' : 'Not Available'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWalletConnection;