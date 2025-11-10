import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../context/Web3Context';
import { ethers } from 'ethers';
import './AuctionDetails.css';

const AuctionDetails = () => {
  const { auctionAddress } = useParams();
  const navigate = useNavigate();
  const { 
    getAuctionDetails, 
    placeBid, 
    endAuction,
    account,
    isConnected,
    loading: web3Loading 
  } = useWeb3();

  const [auction, setAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState('');

  // Fetch auction details
  const fetchAuctionDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const details = await getAuctionDetails(auctionAddress);
      setAuction(details);
      
      // Set minimum bid amount
      if (details.currentBid && details.currentBid !== '0') {
        const minBid = (parseFloat(details.currentBid) + 0.0001).toFixed(4);
        setBidAmount(minBid);
      } else {
        setBidAmount(details.startingPrice || '0.001');
      }
    } catch (err) {
      console.error('Error fetching auction:', err);
      setError('Failed to load auction details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && auctionAddress) {
      fetchAuctionDetails();
    }
  }, [isConnected, auctionAddress]);

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

  // Format time remaining
  const formatTimeLeft = (seconds) => {
    if (seconds <= 0) return 'Auction Ended';

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${secs}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Handle place bid
  const handlePlaceBid = async (e) => {
    e.preventDefault();
    
    try {
      setBidding(true);
      setError('');
      setSuccess('');

      // Validate bid amount
      const bidValue = parseFloat(bidAmount);
      const currentBidValue = parseFloat(auction.currentBid || '0');
      const startingPriceValue = parseFloat(auction.startingPrice || '0');

      if (bidValue <= 0) {
        throw new Error('Bid amount must be greater than 0');
      }

      if (currentBidValue > 0 && bidValue <= currentBidValue) {
        throw new Error(`Bid must be higher than current bid (${currentBidValue} ETH)`);
      }

      if (currentBidValue === 0 && bidValue < startingPriceValue) {
        throw new Error(`Bid must be at least ${startingPriceValue} ETH`);
      }

      // Place bid
      await placeBid(auctionAddress, bidAmount);
      
      setSuccess('Bid placed successfully! 🎉');
      setBidAmount('');
      
      // Refresh auction details
      setTimeout(() => {
        fetchAuctionDetails();
        setSuccess('');
      }, 2000);

    } catch (err) {
      console.error('Error placing bid:', err);
      setError(err.message || 'Failed to place bid');
    } finally {
      setBidding(false);
    }
  };

  // Handle end auction
  const handleEndAuction = async () => {
    try {
      setEnding(true);
      setError('');
      setSuccess('');

      await endAuction(auctionAddress);
      
      setSuccess('Auction ended successfully!');
      
      setTimeout(() => {
        fetchAuctionDetails();
        setSuccess('');
      }, 2000);

    } catch (err) {
      console.error('Error ending auction:', err);
      setError(err.message || 'Failed to end auction');
    } finally {
      setEnding(false);
    }
  };

  // Format address
  const formatAddress = (address) => {
    if (!address || address === ethers.ZeroAddress) return 'No bids yet';
    return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
  };

  if (!isConnected) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <i className="fas fa-wallet fa-4x text-muted mb-3"></i>
            <h3>Connect Your Wallet</h3>
            <p className="text-muted">Please connect your wallet to view auction details.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-3">Loading auction details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <i className="fas fa-exclamation-triangle fa-4x text-warning mb-3"></i>
            <h3>Auction Not Found</h3>
            <p className="text-muted">The auction you're looking for doesn't exist.</p>
            <button className="btn btn-primary" onClick={() => navigate('/auctions')}>
              View All Auctions
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAuctionActive = auction.isLive && parseInt(auction.timeLeft) > 0;
  const isOwner = account?.toLowerCase() === auction.seller?.toLowerCase();
  const hasWinner = auction.currentWinner && auction.currentWinner !== ethers.ZeroAddress;

  return (
    <div className="auction-details-page">
      <div className="container py-4">
        {/* Back Button */}
        <button className="btn btn-outline-light mb-4" onClick={() => navigate('/auctions')}>
          <i className="fas fa-arrow-left me-2"></i>
          Back to Auctions
        </button>

        <div className="row g-4">
          {/* Left Column - Image */}
          <div className="col-lg-6">
            <div className="auction-image-container">
              <img 
                src={auction.image || 'https://via.placeholder.com/600x400/007bff/ffffff?text=No+Image'} 
                alt={auction.name}
                className="auction-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x400/007bff/ffffff?text=No+Image';
                }}
              />
              <div className="auction-status-badge">
                {isAuctionActive ? (
                  <span className="badge bg-success">
                    <i className="fas fa-circle me-1"></i>
                    Live Auction
                  </span>
                ) : (
                  <span className="badge bg-danger">
                    <i className="fas fa-ban me-1"></i>
                    Auction Ended
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Details & Bidding */}
          <div className="col-lg-6">
            <div className="auction-info-card">
              {/* Title */}
              <h1 className="auction-title">{auction.name}</h1>
              
              {/* Description */}
              <p className="auction-description">{auction.description || 'No description provided'}</p>

              {/* Time Left */}
              <div className="time-left-section mb-4">
                <div className="time-label">
                  <i className="fas fa-clock me-2"></i>
                  Time Remaining
                </div>
                <div className={`time-value ${!isAuctionActive ? 'text-danger' : ''}`}>
                  {timeLeft}
                </div>
              </div>

              {/* Bid Information */}
              <div className="bid-info-grid">
                <div className="bid-info-item">
                  <div className="bid-label">Starting Price</div>
                  <div className="bid-value">{parseFloat(auction.startingPrice || 0).toFixed(4)} ETH</div>
                </div>
                <div className="bid-info-item">
                  <div className="bid-label">Current Bid</div>
                  <div className="bid-value text-primary">
                    {auction.currentBid && auction.currentBid !== '0' 
                      ? `${parseFloat(auction.currentBid).toFixed(4)} ETH` 
                      : 'No bids yet'}
                  </div>
                </div>
                <div className="bid-info-item">
                  <div className="bid-label">Seller</div>
                  <div className="bid-value small text-truncate" title={auction.seller}>
                    {formatAddress(auction.seller)}
                  </div>
                </div>
                {hasWinner && (
                  <div className="bid-info-item">
                    <div className="bid-label">Current Winner</div>
                    <div className="bid-value text-success small text-truncate" title={auction.currentWinner}>
                      {formatAddress(auction.currentWinner)}
                    </div>
                  </div>
                )}
              </div>

              {/* Messages */}
              {success && (
                <div className="alert alert-success mt-4">
                  <i className="fas fa-check-circle me-2"></i>
                  {success}
                </div>
              )}

              {error && (
                <div className="alert alert-danger mt-4">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              {/* Bidding Section - FOR NON-OWNERS */}
              {isAuctionActive && !isOwner && (
                <div className="bidding-section mt-4">
                  <div className="bidding-header">
                    <h4 className="mb-0">
                      <i className="fas fa-gavel me-2"></i>
                      Place Your Bid
                    </h4>
                    <p className="text-muted small mb-0 mt-2">
                      Minimum bid: {auction.currentBid && auction.currentBid !== '0' 
                        ? `${(parseFloat(auction.currentBid) + 0.0001).toFixed(4)} ETH` 
                        : `${auction.startingPrice || '0.001'} ETH`}
                    </p>
                  </div>
                  <form onSubmit={handlePlaceBid} className="mt-3">
                    <div className="input-group input-group-lg mb-3">
                      <span className="input-group-text">
                        <i className="fab fa-ethereum"></i>
                      </span>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Enter bid amount in ETH"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        step="0.0001"
                        min="0"
                        required
                        disabled={bidding}
                      />
                      <span className="input-group-text">ETH</span>
                    </div>
                    <button 
                      type="submit" 
                      className="btn btn-success btn-lg w-100 bid-button"
                      disabled={bidding || !bidAmount}
                    >
                      {bidding ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Placing Bid...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-hand-paper me-2"></i>
                          Place Bid Now
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Owner Section - CANNOT BID ON OWN AUCTION */}
              {isOwner && isAuctionActive && (
                <div className="owner-section mt-4">
                  <div className="alert alert-warning">
                    <h5 className="alert-heading">
                      <i className="fas fa-user-shield me-2"></i>
                      You Own This Auction
                    </h5>
                    <p className="mb-0">
                      As the auction owner, you cannot place bids on your own auction. 
                      Share this auction with others to receive bids!
                    </p>
                  </div>
                  <div className="share-section p-3 bg-dark rounded">
                    <p className="text-muted mb-2">
                      <i className="fas fa-share-alt me-2"></i>
                      Share this auction:
                    </p>
                    <div className="input-group">
                      <input 
                        type="text" 
                        className="form-control bg-secondary text-white border-0" 
                        value={window.location.href}
                        readOnly
                      />
                      <button 
                        className="btn btn-outline-light"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          setSuccess('Link copied to clipboard!');
                          setTimeout(() => setSuccess(''), 2000);
                        }}
                      >
                        <i className="fas fa-copy"></i>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Owner Actions - END AUCTION */}
              {isOwner && !isAuctionActive && !auction.hasFinished && (
                <div className="owner-actions mt-4">
                  <button 
                    className="btn btn-danger btn-lg w-100"
                    onClick={handleEndAuction}
                    disabled={ending}
                  >
                    {ending ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Ending Auction...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-flag-checkered me-2"></i>
                        End Auction & Declare Winner
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Auction Ended Message */}
              {!isAuctionActive && auction.hasFinished && (
                <div className="auction-ended-section mt-4">
                  <div className="alert alert-secondary">
                    <h5 className="alert-heading">
                      <i className="fas fa-flag-checkered me-2"></i>
                      Auction Has Ended
                    </h5>
                    {hasWinner ? (
                      <p className="mb-0">
                        <strong>Winner:</strong> {formatAddress(auction.currentWinner)}
                        <br />
                        <strong>Winning Bid:</strong> {parseFloat(auction.currentBid).toFixed(4)} ETH
                      </p>
                    ) : (
                      <p className="mb-0">No bids were placed on this auction.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetails;
