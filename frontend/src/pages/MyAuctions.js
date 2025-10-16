import React from 'react';
import { useWeb3 } from '../context/Web3Context';

const MyAuctions = () => {
  const { isConnected, userInfo } = useWeb3();

  if (!isConnected) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <i className="fas fa-wallet fa-4x text-muted mb-3"></i>
            <h3>Connect Your Wallet</h3>
            <p className="text-muted">Please connect your wallet to view your auctions.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">My Auctions</h2>
          
          {userInfo?.isRegistered ? (
            <div className="text-center">
              <i className="fas fa-gavel fa-4x text-primary mb-3"></i>
              <h4>Your Auction Dashboard</h4>
              <p className="text-muted">Feature coming soon! This will show all your created auctions and bidding history.</p>
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                This page will display your created auctions, bidding history, and winnings.
              </div>
            </div>
          ) : (
            <div className="text-center">
              <i className="fas fa-exclamation-triangle fa-4x text-warning mb-3"></i>
              <h4>Registration Required</h4>
              <p className="text-muted">You need to be a registered user to view your auctions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAuctions;