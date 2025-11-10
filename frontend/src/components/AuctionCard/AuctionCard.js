import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import './AuctionCard.css';

const AuctionCard = ({ auction, showActions = false, onRefresh }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  // Format time remaining
  const formatTimeLeft = (seconds) => {
    if (seconds <= 0) {
      setIsExpired(true);
      return 'Expired';
    }

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Update countdown timer
  useEffect(() => {
    if (!auction?.timeLeft) return;

    const updateTimer = () => {
      const remaining = parseInt(auction.timeLeft);
      const actualTimeLeft = remaining > 0 ? remaining : 0;
      
      setTimeLeft(formatTimeLeft(actualTimeLeft));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [auction?.timeLeft]);

  // Format address for display
  const formatAddress = (address) => {
    if (!address || address === ethers.ZeroAddress) return 'No bids yet';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Get status badge
  const getStatusBadge = () => {
    if (auction?.hasFinished) {
      return <span className="badge bg-secondary">Ended</span>;
    } else if (auction?.isLive && !isExpired) {
      return <span className="badge bg-success">Live</span>;
    } else {
      return <span className="badge bg-danger">Expired</span>;
    }
  };

  // Get placeholder image if no image hash
  const getImageUrl = (imageHash) => {
    if (!imageHash || imageHash === '') {
      return 'https://via.placeholder.com/300x200/007bff/ffffff?text=No+Image';
    }
    // If it's an IPFS hash, construct the URL
    if (imageHash.startsWith('Qm') || imageHash.startsWith('ba')) {
      return `https://ipfs.io/ipfs/${imageHash}`;
    }
    // If it's already a URL, use it directly
    if (imageHash.startsWith('http')) {
      return imageHash;
    }
    // Fallback to placeholder
    return 'https://via.placeholder.com/300x200/007bff/ffffff?text=No+Image';
  };

  if (!auction) {
    return (
      <div className="card auction-card">
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card auction-card h-100">
      {/* Image */}
      <div className="card-img-container">
        <img
          src={getImageUrl(auction.image)}
          className="card-img-top"
          alt={auction.name}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200/007bff/ffffff?text=No+Image';
          }}
        />
        <div className="card-img-overlay-status">
          {getStatusBadge()}
        </div>
      </div>

      <div className="card-body d-flex flex-column">
        {/* Title */}
        <h5 className="card-title text-truncate" title={auction.name}>
          {auction.name}
        </h5>

        {/* Description */}
        <p className="card-text text-muted small flex-grow-1">
          {auction.description?.length > 100 
            ? `${auction.description.substring(0, 100)}...` 
            : auction.description || 'No description available'}
        </p>

        {/* Auction Details */}
        <div className="auction-details mb-3">
          <div className="row text-center">
            <div className="col-6">
              <small className="text-muted">Current Bid</small>
              <div className="fw-bold text-primary">
                {auction.currentBid ? `${parseFloat(auction.currentBid).toFixed(4)} ETH` : '0 ETH'}
              </div>
            </div>
            <div className="col-6">
              <small className="text-muted">Time Left</small>
              <div className={`fw-bold ${isExpired ? 'text-danger' : 'text-warning'}`}>
                {timeLeft}
              </div>
            </div>
          </div>
        </div>

        {/* Seller Info */}
        <div className="seller-info mb-3">
          <small className="text-muted">Seller:</small>
          <div className="small text-truncate" title={auction.seller}>
            {formatAddress(auction.seller)}
          </div>
          {auction.currentWinner && auction.currentWinner !== ethers.ZeroAddress && (
            <>
              <small className="text-muted">Current Winner:</small>
              <div className="small text-truncate" title={auction.currentWinner}>
                {formatAddress(auction.currentWinner)}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="card-actions mt-auto">
          {showActions ? (
            <div className="d-flex gap-2">
              <Link 
                to={`/auction/${auction.auctionAddress}`} 
                className="btn btn-primary btn-sm flex-fill"
              >
                <i className="fas fa-eye me-1"></i>
                View Details
              </Link>
              {auction.isLive && !isExpired && (
                <Link 
                  to={`/auction/${auction.auctionAddress}`} 
                  className="btn btn-success btn-sm flex-fill"
                >
                  <i className="fas fa-hand-paper me-1"></i>
                  Place Bid
                </Link>
              )}
            </div>
          ) : (
            <Link 
              to={`/auction/${auction.auctionAddress}`} 
              className="btn btn-outline-primary btn-sm w-100"
            >
              <i className="fas fa-eye me-1"></i>
              View Details
            </Link>
          )}
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="card-footer bg-light">
        <small className="text-muted d-flex justify-content-between">
          <span>
            <i className="fas fa-gavel me-1"></i>
            {auction.isLive ? 'Active' : 'Inactive'}
          </span>
          <span>
            <i className="fas fa-ethereum me-1"></i>
            Ethereum
          </span>
        </small>
      </div>
    </div>
  );
};

export default AuctionCard;