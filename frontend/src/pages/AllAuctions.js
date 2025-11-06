import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import AuctionCard from '../components/AuctionCard/AuctionCard';
import './AllAuctions.css';

const AllAuctions = () => {
  const { 
    getAllActiveAuctions, 
    getAuctionDetails,
    isConnected,
    contract
  } = useWeb3();
  
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchAllAuctions = async () => {
    if (!contract) {
      setErrorMessage('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      
      const activeAuctionAddresses = await getAllActiveAuctions();
      
      const auctionDetails = await Promise.all(
        activeAuctionAddresses.map(async (address) => {
          try {
            return await getAuctionDetails(address);
          } catch (err) {
            console.error('Error fetching auction details:', err);
            return null;
          }
        })
      );
      
      setAuctions(auctionDetails.filter(auction => auction !== null));
    } catch (err) {
      console.error('Error fetching auctions:', err);
      setErrorMessage('Failed to fetch auctions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && contract) {
      fetchAllAuctions();
    }
  }, [isConnected, contract]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredAuctions = auctions.filter(auction => {
    if (filter === 'live') return auction.isLive;
    if (filter === 'ending-soon') return auction.timeLeft < 3600 && auction.isLive; // Less than 1 hour
    return true; // 'all'
  });

  if (!isConnected) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <i className="fas fa-wallet fa-4x text-muted mb-3"></i>
            <h3>Connect Your Wallet</h3>
            <p className="text-muted">Please connect your wallet to view auctions.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="all-auctions-page">
      <div className="container mt-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-md-8">
            <h1 className="display-5 fw-bold">All Auctions</h1>
            <p className="text-muted">Discover and bid on amazing items</p>
          </div>
          <div className="col-md-4">
            <button 
              className="btn btn-primary"
              onClick={fetchAllAuctions}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Refreshing...
                </>
              ) : (
                <>
                  <i className="fas fa-sync-alt me-2"></i>
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="filter-tabs">
              <button 
                className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
                onClick={() => setFilter('all')}
              >
                All Auctions ({auctions.length})
              </button>
              <button 
                className={`btn ${filter === 'live' ? 'btn-success' : 'btn-outline-success'} me-2`}
                onClick={() => setFilter('live')}
              >
                Live ({auctions.filter(a => a.isLive).length})
              </button>
              <button 
                className={`btn ${filter === 'ending-soon' ? 'btn-warning' : 'btn-outline-warning'}`}
                onClick={() => setFilter('ending-soon')}
              >
                Ending Soon ({auctions.filter(a => a.timeLeft < 3600 && a.isLive).length})
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {errorMessage && (
          <div className="alert alert-danger alert-dismissible fade show">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {errorMessage}
            <button
              type="button"
              className="btn-close"
              onClick={() => setErrorMessage(null)}
            ></button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading auctions...</p>
          </div>
        ) : filteredAuctions.length > 0 ? (
          /* Auctions Grid */
          <div className="row">
            {filteredAuctions.map((auction, index) => (
              <div key={index} className="col-lg-4 col-md-6 mb-4">
                <AuctionCard auction={auction} showActions={true} onRefresh={fetchAllAuctions} />
              </div>
            ))}
          </div>
        ) : (
          /* No Auctions */
          <div className="text-center py-5">
            <i className="fas fa-inbox text-muted" style={{ fontSize: '4rem' }}></i>
            <h4 className="mt-3 text-muted">
              {filter === 'all' ? 'No Auctions Available' :
               filter === 'live' ? 'No Live Auctions' :
               'No Auctions Ending Soon'}
            </h4>
            <p className="text-muted">
              {filter === 'all' ? 'Be the first to create an auction!' :
               'Check back later for more auctions.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllAuctions;