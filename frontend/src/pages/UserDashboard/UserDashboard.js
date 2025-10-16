import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWeb3 } from '../../context/Web3Context';
import './UserDashboard.css';

const UserDashboard = () => {
  const { user } = useAuth();
  const { contract, account } = useWeb3();
  const [userStats, setUserStats] = useState({
    totalBids: 0,
    wonAuctions: 0,
    activeAuctions: 0,
    totalSpent: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      if (contract && account) {
        // Load user auction statistics
        // This is a placeholder - implement according to your contract methods
        const stats = {
          totalBids: 5,
          wonAuctions: 2,
          activeAuctions: 3,
          totalSpent: 2.5
        };
        setUserStats(stats);

        // Load recent activity
        const activity = [
          { id: 1, action: 'Bid placed', auction: 'Vintage Watch', amount: '0.5 ETH', time: '2 hours ago' },
          { id: 2, action: 'Auction won', auction: 'Digital Art #123', amount: '1.2 ETH', time: '1 day ago' },
          { id: 3, action: 'Bid placed', auction: 'Rare Book Collection', amount: '0.8 ETH', time: '2 days ago' }
        ];
        setRecentActivity(activity);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [contract, account, setUserStats, setRecentActivity, setLoading]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="user-dashboard">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <div className="container py-5">
        <div className="dashboard-header mb-5">
          <h1 className="display-4 fw-bold text-gradient">
            Welcome back, {user?.username || user?.email}!
          </h1>
          <p className="lead">Manage your auctions and track your bidding activity</p>
        </div>

        {/* Stats Cards */}
        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-hand-paper"></i>
              </div>
              <div className="stat-content">
                <h3>{userStats.totalBids}</h3>
                <p>Total Bids</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-trophy"></i>
              </div>
              <div className="stat-content">
                <h3>{userStats.wonAuctions}</h3>
                <p>Won Auctions</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-gavel"></i>
              </div>
              <div className="stat-content">
                <h3>{userStats.activeAuctions}</h3>
                <p>Active Bids</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-ethereum"></i>
              </div>
              <div className="stat-content">
                <h3>{userStats.totalSpent} ETH</h3>
                <p>Total Spent</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row g-4 mb-5">
          <div className="col-md-6">
            <div className="quick-actions-card">
              <h4 className="mb-4">Quick Actions</h4>
              <div className="d-grid gap-3">
                <button className="btn btn-primary btn-lg">
                  <i className="fas fa-plus me-2"></i>
                  Create New Auction
                </button>
                <button className="btn btn-outline-primary btn-lg">
                  <i className="fas fa-search me-2"></i>
                  Browse Auctions
                </button>
                <button className="btn btn-outline-primary btn-lg">
                  <i className="fas fa-wallet me-2"></i>
                  Check Wallet Balance
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="recent-activity-card">
              <h4 className="mb-4">Recent Activity</h4>
              <div className="activity-list">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      <i className={`fas ${activity.action.includes('won') ? 'fa-trophy' : 'fa-hand-paper'}`}></i>
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">{activity.action}</div>
                      <div className="activity-description">
                        {activity.auction} - {activity.amount}
                      </div>
                      <div className="activity-time">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="row">
          <div className="col-12">
            <div className="chart-card">
              <h4 className="mb-4">Bidding Performance</h4>
              <div className="chart-placeholder">
                <i className="fas fa-chart-line fa-3x text-muted"></i>
                <p className="text-muted mt-3">Performance chart will be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;