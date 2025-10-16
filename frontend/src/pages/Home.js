import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import AuctionCard from '../components/AuctionCard/AuctionCard';
import './Home.css';

const Home = () => {
  const { 
    isConnected, 
    userInfo, 
    getAllActiveAuctions, 
    getAuctionDetails,
    getTotalAuctions,
    getUserAuctionsCount,
    error,
    setError 
  } = useWeb3();
  
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalAuctions: 0,
    activeAuctions: 0,
    totalUsers: 0
  });

  // Fetch featured auctions (first 6 active auctions)
  const fetchFeaturedAuctions = async () => {
    if (!isConnected) {
      return; // Don't try to fetch if not connected
    }

    try {
      setLoading(true);
      setError(null);
      
      const [activeAuctionAddresses, totalAuctions, userAuctionsCount] = await Promise.all([
        getAllActiveAuctions(),
        getTotalAuctions(),
        userInfo?.isRegistered ? getUserAuctionsCount() : Promise.resolve(0)
      ]);
      
      const auctionDetails = await Promise.all(
        activeAuctionAddresses.slice(0, 6).map(async (address) => {
          try {
            return await getAuctionDetails(address);
          } catch (err) {
            console.error('Error fetching auction details:', err);
            return null;
          }
        })
      );
      
      setAuctions(auctionDetails.filter(auction => auction !== null));
      setStats(prev => ({
        ...prev,
        activeAuctions: activeAuctionAddresses.length,
        totalAuctions: parseInt(totalAuctions),
        totalUsers: userAuctionsCount
      }));
    } catch (err) {
      console.error('Error fetching auctions:', err);
      setError('Failed to fetch auctions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchFeaturedAuctions();
    }
  }, [isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section bg-primary text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">
                Welcome to AuctionHub
              </h1>
              <p className="lead mb-4">
                The premier decentralized auction platform built on Ethereum. 
                Buy and sell unique items with complete transparency and security.
              </p>
              
              {!isConnected ? (
                <div className="alert alert-warning">
                  <i className="fas fa-wallet me-2"></i>
                  Please connect your wallet to start using AuctionHub
                </div>
              ) : userInfo?.isRegistered ? (
                <div className="d-flex gap-3">
                  <Link to="/auctions" className="btn btn-light btn-lg">
                    <i className="fas fa-search me-2"></i>
                    Browse Auctions
                  </Link>
                  <Link to="/create-auction" className="btn btn-outline-light btn-lg">
                    <i className="fas fa-plus me-2"></i>
                    Create Auction
                  </Link>
                </div>
              ) : (
                <div className="alert alert-warning">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Your wallet is connected but not registered. Contact an admin to register your account.
                </div>
              )}
            </div>
            <div className="col-lg-6">
              <div className="hero-image text-center">
                <i className="fas fa-gavel hero-icon"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-5 bg-light">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-4 mb-4">
              <div className="stat-card">
                <i className="fas fa-gavel stat-icon text-primary"></i>
                <h3 className="stat-number">{stats.totalAuctions}</h3>
                <p className="stat-label">Total Auctions</p>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="stat-card">
                <i className="fas fa-chart-line stat-icon text-success"></i>
                <h3 className="stat-number">{stats.activeAuctions}</h3>
                <p className="stat-label">Active Auctions</p>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="stat-card">
                <i className="fas fa-user stat-icon text-warning"></i>
                <h3 className="stat-number">{stats.totalUsers}</h3>
                <p className="stat-label">My Auctions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section className="featured-auctions py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-5">
            <h2 className="section-title">Featured Auctions</h2>
            <Link to="/auctions" className="btn btn-primary">
              View All <i className="fas fa-arrow-right ms-2"></i>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading auctions...</p>
            </div>
          ) : auctions.length > 0 ? (
            <div className="row">
              {auctions.map((auction, index) => (
                <div key={index} className="col-lg-4 col-md-6 mb-4">
                  <AuctionCard auction={auction} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-inbox text-muted" style={{ fontSize: '4rem' }}></i>
              <h4 className="mt-3 text-muted">No Active Auctions</h4>
              <p className="text-muted">Be the first to create an auction!</p>
              {isConnected && userInfo?.isRegistered && (
                <Link to="/create-auction" className="btn btn-primary mt-3">
                  Create First Auction
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5">How It Works</h2>
          <div className="row">
            <div className="col-md-4 text-center mb-4">
              <div className="step-card">
                <div className="step-number">1</div>
                <i className="fas fa-wallet step-icon"></i>
                <h4>Connect Wallet</h4>
                <p>Connect your MetaMask wallet to get started with AuctionHub</p>
              </div>
            </div>
            <div className="col-md-4 text-center mb-4">
              <div className="step-card">
                <div className="step-number">2</div>
                <i className="fas fa-plus-circle step-icon"></i>
                <h4>Create or Bid</h4>
                <p>Create your own auctions or place bids on existing ones</p>
              </div>
            </div>
            <div className="col-md-4 text-center mb-4">
              <div className="step-card">
                <div className="step-number">3</div>
                <i className="fas fa-handshake step-icon"></i>
                <h4>Win & Trade</h4>
                <p>Win auctions and complete secure transactions on the blockchain</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Status Info */}
      {isConnected && (
        <section className="user-status py-4 bg-info text-white">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h5 className="mb-1">
                  <i className="fas fa-user-circle me-2"></i>
                  Account Status
                </h5>
                <p className="mb-0">
                  {userInfo?.isRegistered ? (
                    <>
                      Welcome back, {userInfo.email}! 
                      {userInfo.isAdmin && ' (Administrator)'}
                      <br />
                      <small>
                        Auctions Created: {userInfo.auctionsCreated} | 
                        Auctions Won: {userInfo.auctionsWon}
                      </small>
                    </>
                  ) : (
                    'Your wallet is connected but not registered. Contact an administrator to complete registration.'
                  )}
                </p>
              </div>
              <div className="col-md-4 text-end">
                {userInfo?.isRegistered ? (
                  <Link to="/my-auctions" className="btn btn-light">
                    View My Auctions
                  </Link>
                ) : (
                  <span className="badge bg-warning fs-6">Pending Registration</span>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Error Display */}
      {error && (
        <div className="container mt-3">
          <div className="alert alert-danger alert-dismissible fade show">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError(null)}
            ></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;