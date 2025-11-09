import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserWalletConnection from '../../components/UserWalletConnection/UserWalletConnection';
import './MainDashboard.css';

const MainDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardStats, setDashboardStats] = useState({
    totalAuctions: 0,
    liveAuctions: 0,
    totalUsers: 0,
    totalBids: 0
  });

  const [recentAuctions, setRecentAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Reset to empty state - no example data
      setDashboardStats({
        totalAuctions: 0,
        liveAuctions: 0,
        totalUsers: 0,
        totalBids: 0
      });

      setRecentAuctions([]);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="main-dashboard">
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-3">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-dashboard">
      <div className="container-fluid py-4">
        {/* Welcome Section */}
        <div className="welcome-section mb-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="dashboard-title">
                <i className="fas fa-tachometer-alt me-3"></i>
                Welcome to AUCTRA
              </h1>
              <p className="dashboard-subtitle">
                Your decentralized auction marketplace powered by blockchain
              </p>
            </div>
            <div className="col-md-4 text-md-end">
              <div className="user-info mb-3">
                <h5>Welcome, {user.username}!</h5>
              </div>
              <UserWalletConnection />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-section mb-4">
          <div className="row">
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-gavel"></i>
                </div>
                <div className="stat-content">
                  <h3>{dashboardStats.totalAuctions}</h3>
                  <p>Total Auctions</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="stat-card live">
                <div className="stat-icon">
                  <i className="fas fa-fire"></i>
                </div>
                <div className="stat-content">
                  <h3>{dashboardStats.liveAuctions}</h3>
                  <p>Live Auctions</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-content">
                  <h3>{dashboardStats.totalUsers}</h3>
                  <p>Active Users</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-3">
              <div className="stat-card">
                <div className="stat-icon">
                  <i className="fas fa-hand-paper"></i>
                </div>
                <div className="stat-content">
                  <h3>{dashboardStats.totalBids}</h3>
                  <p>Total Bids</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions mb-4">
          <div className="row">
            <div className="col-12">
              <div className="action-card">
                <h4 className="mb-4">
                  <i className="fas fa-rocket me-2"></i>
                  Quick Actions
                </h4>
                <div className="row">
                  <div className="col-md-3 col-sm-6 mb-3">
                    <button 
                      className="action-btn create-auction"
                      onClick={() => navigate('/create-auction')}
                    >
                      <i className="fas fa-plus-circle"></i>
                      <span>Create Auction</span>
                    </button>
                  </div>
                  <div className="col-md-3 col-sm-6 mb-3">
                    <button 
                      className="action-btn browse-auctions"
                      onClick={() => navigate('/auctions')}
                    >
                      <i className="fas fa-search"></i>
                      <span>Browse Auctions</span>
                    </button>
                  </div>
                  <div className="col-md-3 col-sm-6 mb-3">
                    <button 
                      className="action-btn my-auctions"
                      onClick={() => navigate('/my-auctions')}
                    >
                      <i className="fas fa-list"></i>
                      <span>My Auctions</span>
                    </button>
                  </div>
                  <div className="col-md-3 col-sm-6 mb-3">
                    <button 
                      className="action-btn profile"
                      onClick={() => navigate('/profile')}
                    >
                      <i className="fas fa-user"></i>
                      <span>My Profile</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Auctions */}
        <div className="recent-auctions">
          <div className="row">
            <div className="col-12">
              <div className="auction-card">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4>
                    <i className="fas fa-fire me-2"></i>
                    Live Auctions
                  </h4>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => navigate('/auctions')}
                  >
                    View All
                  </button>
                </div>
                <div className="row">
                  {recentAuctions.length > 0 ? (
                    recentAuctions.map((auction) => (
                      <div key={auction.id} className="col-lg-4 col-md-6 mb-3">
                        <div className="auction-item">
                          <div className="auction-image">
                            <img src={auction.image} alt={auction.title} />
                            <div className="auction-status live">
                              <i className="fas fa-circle me-1"></i>
                              LIVE
                            </div>
                          </div>
                          <div className="auction-content">
                            <h5>{auction.title}</h5>
                            <div className="auction-details">
                              <div className="current-bid">
                                <span className="label">Current Bid:</span>
                                <span className="value">{auction.currentBid}</span>
                              </div>
                              <div className="time-left">
                                <span className="label">Time Left:</span>
                                <span className="value">{auction.timeLeft}</span>
                              </div>
                            </div>
                            <button className="btn btn-primary btn-sm w-100 mt-2">
                              <i className="fas fa-hand-paper me-2"></i>
                              Place Bid
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-12">
                      <div className="no-data-message">
                        <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                        <h5 className="text-muted">No Live Auctions</h5>
                        <p className="text-muted">There are currently no live auctions available.</p>
                        <button 
                          className="btn btn-primary"
                          onClick={() => navigate('/create-auction')}
                        >
                          <i className="fas fa-plus me-2"></i>
                          Create First Auction
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;