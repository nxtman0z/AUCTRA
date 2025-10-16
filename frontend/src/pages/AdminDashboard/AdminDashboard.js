import React, { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { contract, account } = useWeb3();
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalAuctions: 0,
    totalRevenue: 0,
    activeAuctions: 0,
    pendingApprovals: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [systemHealth, setSystemHealth] = useState({
    server: 'online',
    blockchain: 'connected',
    database: 'healthy'
  });
  const [loading, setLoading] = useState(true);

  const loadAdminData = useCallback(async () => {
    try {
      if (contract && account) {
        // Load admin statistics
        // This is a placeholder - implement according to your contract methods
        const stats = {
          totalUsers: 150,
          totalAuctions: 45,
          totalRevenue: 25.8,
          activeAuctions: 12,
          pendingApprovals: 3
        };
        setAdminStats(stats);

        // Load recent users
        const users = [
          { id: 1, username: 'john_doe', email: 'john@example.com', joined: '2 hours ago', status: 'active' },
          { id: 2, username: 'sarah_smith', email: 'sarah@example.com', joined: '5 hours ago', status: 'active' },
          { id: 3, username: 'mike_wilson', email: 'mike@example.com', joined: '1 day ago', status: 'pending' }
        ];
        setRecentUsers(users);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  }, [contract, account, setAdminStats, setRecentUsers, setLoading]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleUserAction = (userId, action) => {
    console.log(`${action} user ${userId}`);
    // Implement user management actions
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container py-5">
        <div className="dashboard-header mb-5">
          <h1 className="display-4 fw-bold text-gradient">
            <i className="fas fa-shield-alt me-3"></i>
            Admin Control Panel
          </h1>
          <p className="lead">Manage platform operations and monitor system performance</p>
        </div>

        {/* System Health Status */}
        <div className="row g-4 mb-4">
          <div className="col-12">
            <div className="system-health-card">
              <h4 className="mb-3">
                <i className="fas fa-heartbeat me-2"></i>
                System Health
              </h4>
              <div className="row">
                <div className="col-md-4">
                  <div className="health-item">
                    <i className="fas fa-server"></i>
                    <span>Server Status</span>
                    <span className={`status ${systemHealth.server}`}>
                      {systemHealth.server.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="health-item">
                    <i className="fab fa-ethereum"></i>
                    <span>Blockchain</span>
                    <span className={`status ${systemHealth.blockchain}`}>
                      {systemHealth.blockchain.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="health-item">
                    <i className="fas fa-database"></i>
                    <span>Database</span>
                    <span className={`status ${systemHealth.database}`}>
                      {systemHealth.database.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Stats Cards */}
        <div className="row g-4 mb-5">
          <div className="col-md-2dot4">
            <div className="admin-stat-card">
              <div className="stat-icon users">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-content">
                <h3>{adminStats.totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </div>
          </div>
          <div className="col-md-2dot4">
            <div className="admin-stat-card">
              <div className="stat-icon auctions">
                <i className="fas fa-gavel"></i>
              </div>
              <div className="stat-content">
                <h3>{adminStats.totalAuctions}</h3>
                <p>Total Auctions</p>
              </div>
            </div>
          </div>
          <div className="col-md-2dot4">
            <div className="admin-stat-card">
              <div className="stat-icon revenue">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="stat-content">
                <h3>{adminStats.totalRevenue} ETH</h3>
                <p>Total Revenue</p>
              </div>
            </div>
          </div>
          <div className="col-md-2dot4">
            <div className="admin-stat-card">
              <div className="stat-icon active">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-content">
                <h3>{adminStats.activeAuctions}</h3>
                <p>Active Auctions</p>
              </div>
            </div>
          </div>
          <div className="col-md-2dot4">
            <div className="admin-stat-card pending">
              <div className="stat-icon pending-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="stat-content">
                <h3>{adminStats.pendingApprovals}</h3>
                <p>Pending Approvals</p>
              </div>
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="row g-4 mb-5">
          <div className="col-md-6">
            <div className="management-card">
              <h4 className="mb-4">
                <i className="fas fa-users-cog me-2"></i>
                Recent Users
              </h4>
              <div className="users-list">
                {recentUsers.map(user => (
                  <div key={user.id} className="user-item">
                    <div className="user-avatar">
                      <i className="fas fa-user"></i>
                    </div>
                    <div className="user-info">
                      <div className="user-name">{user.username}</div>
                      <div className="user-email">{user.email}</div>
                      <div className="user-joined">{user.joined}</div>
                    </div>
                    <div className="user-status">
                      <span className={`badge ${user.status}`}>
                        {user.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="user-actions">
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleUserAction(user.id, 'view')}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => handleUserAction(user.id, 'edit')}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-3">
                <button className="btn btn-primary">
                  <i className="fas fa-users me-2"></i>
                  Manage All Users
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="management-card">
              <h4 className="mb-4">
                <i className="fas fa-tools me-2"></i>
                Quick Actions
              </h4>
              <div className="quick-actions-grid">
                <button className="action-btn">
                  <i className="fas fa-plus"></i>
                  <span>Create Auction</span>
                </button>
                <button className="action-btn">
                  <i className="fas fa-ban"></i>
                  <span>Suspend User</span>
                </button>
                <button className="action-btn">
                  <i className="fas fa-chart-bar"></i>
                  <span>View Reports</span>
                </button>
                <button className="action-btn">
                  <i className="fas fa-cog"></i>
                  <span>System Settings</span>
                </button>
                <button className="action-btn">
                  <i className="fas fa-download"></i>
                  <span>Export Data</span>
                </button>
                <button className="action-btn">
                  <i className="fas fa-bell"></i>
                  <span>Notifications</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Preview */}
        <div className="row">
          <div className="col-12">
            <div className="analytics-card">
              <h4 className="mb-4">
                <i className="fas fa-analytics me-2"></i>
                Platform Analytics
              </h4>
              <div className="analytics-preview">
                <div className="row">
                  <div className="col-md-4">
                    <div className="metric">
                      <i className="fas fa-trending-up"></i>
                      <div>
                        <h5>Growth Rate</h5>
                        <p>+15% this month</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="metric">
                      <i className="fas fa-coins"></i>
                      <div>
                        <h5>Avg. Auction Value</h5>
                        <p>0.85 ETH</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="metric">
                      <i className="fas fa-clock"></i>
                      <div>
                        <h5>Avg. Auction Duration</h5>
                        <p>3.2 days</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;