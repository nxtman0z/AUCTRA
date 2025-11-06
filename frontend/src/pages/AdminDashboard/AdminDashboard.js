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
            <div className="spinner-border text-primary" role="status">
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
        <div className="dashboard-header">
          <h1 className="display-4 fw-bold text-gradient">
            <i className="fas fa-shield-alt me-3"></i>
            Admin Control Panel
          </h1>
          <p className="lead">Manage platform operations and monitor system performance</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;