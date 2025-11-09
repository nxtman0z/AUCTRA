import React, { useState, useEffect, useCallback } from 'react';
import AdminWalletConnection from '../../components/AdminWalletConnection/AdminWalletConnection';
import './AdminDashboard.css';

const AdminDashboard = () => {
  // Removed unused variables: contract, account
  const [activeTab, setActiveTab] = useState('overview');
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalAuctions: 0,
    totalRevenue: 0,
    activeAuctions: 0,
    pendingVerifications: 0,
    pendingApprovals: 0,
    completedAuctions: 0,
    totalBids: 0
  });
  
  const [verificationRequests, setVerificationRequests] = useState([]);
  
  const [liveAuctions, setLiveAuctions] = useState([]);
  
  const [recentUsers, setRecentUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const loadAdminData = useCallback(async () => {
    try {
      // Simulate API calls - replace with actual API endpoints
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, fetch from your backend APIs
      console.log('Admin data loaded successfully');
      
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleVerificationAction = async (requestId, action) => {
    setActionLoading(prev => ({ ...prev, [requestId]: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setVerificationRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' }
            : req
        )
      );
      
      // Update pending count
      setAdminStats(prev => ({
        ...prev,
        pendingVerifications: prev.pendingVerifications - 1
      }));
      
      console.log(`Verification ${action}d for request ${requestId}`);
    } catch (error) {
      console.error(`Error ${action}ing verification:`, error);
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleUserAction = async (userId, action) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (action === 'remove') {
        setRecentUsers(prev => prev.filter(user => user.id !== userId));
        setAdminStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
      }
      
      console.log(`${action} user ${userId}`);
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleAuctionAction = async (auctionId, action) => {
    setActionLoading(prev => ({ ...prev, [`auction_${auctionId}`]: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (action === 'delete') {
        setLiveAuctions(prev => prev.filter(auction => auction.id !== auctionId));
        setAdminStats(prev => ({ 
          ...prev, 
          activeAuctions: prev.activeAuctions - 1,
          totalAuctions: prev.totalAuctions - 1
        }));
      }
      
      console.log(`${action} auction ${auctionId}`);
    } catch (error) {
      console.error(`Error ${action}ing auction:`, error);
    } finally {
      setActionLoading(prev => ({ ...prev, [`auction_${auctionId}`]: false }));
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container-fluid py-4">
        {/* Header */}
        {/* Dashboard Header */}
        <div className="dashboard-header mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="display-4 fw-bold text-gradient">
                <i className="fas fa-shield-alt me-3"></i>
                Admin Control Panel
              </h1>
              <p className="lead">Manage platform operations and monitor system performance</p>
            </div>
            <div className="admin-wallet-section">
              <AdminWalletConnection />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-tabs mb-4">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <i className="fas fa-chart-line me-2"></i>Overview
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'verifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('verifications')}
              >
                <i className="fas fa-user-check me-2"></i>
                Verifications 
                {adminStats.pendingVerifications > 0 && (
                  <span className="badge bg-danger ms-2">{adminStats.pendingVerifications}</span>
                )}
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'live-auctions' ? 'active' : ''}`}
                onClick={() => setActiveTab('live-auctions')}
              >
                <i className="fas fa-gavel me-2"></i>Live Auctions
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <i className="fas fa-users me-2"></i>Users
              </button>
            </li>
          </ul>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-section">
            {/* Stats Cards */}
            <div className="row mb-4">
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{adminStats.totalUsers.toLocaleString()}</h3>
                    <p>Total Users</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-gavel"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{adminStats.totalAuctions}</h3>
                    <p>Total Auctions</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="stat-card live">
                  <div className="stat-icon">
                    <i className="fas fa-fire"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{adminStats.activeAuctions}</h3>
                    <p>Live Auctions</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-ethereum"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{adminStats.totalRevenue} ETH</h3>
                    <p>Total Revenue</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Charts Placeholder */}
            <div className="row mb-4">
              <div className="col-md-8">
                <div className="analytics-card">
                  <h4><i className="fas fa-chart-bar me-2"></i>Analytics Overview</h4>
                  <div className="chart-placeholder">
                    <div className="chart-mock">
                      <div className="chart-bars">
                        <div className="bar" style={{height: '60%'}}></div>
                        <div className="bar" style={{height: '80%'}}></div>
                        <div className="bar" style={{height: '45%'}}></div>
                        <div className="bar" style={{height: '90%'}}></div>
                        <div className="bar" style={{height: '70%'}}></div>
                        <div className="bar" style={{height: '85%'}}></div>
                        <div className="bar" style={{height: '55%'}}></div>
                      </div>
                      <p className="text-center mt-3">Auction Activity (Last 7 Days)</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="quick-stats">
                  <h4><i className="fas fa-tachometer-alt me-2"></i>Quick Stats</h4>
                  <div className="quick-stat-item">
                    <span>Pending Verifications</span>
                    <span className="badge bg-warning">{adminStats.pendingVerifications}</span>
                  </div>
                  <div className="quick-stat-item">
                    <span>Completed Auctions</span>
                    <span className="badge bg-success">{adminStats.completedAuctions}</span>
                  </div>
                  <div className="quick-stat-item">
                    <span>Total Bids</span>
                    <span className="badge bg-info">{adminStats.totalBids.toLocaleString()}</span>
                  </div>
                  <div className="quick-stat-item">
                    <span>Pending Approvals</span>
                    <span className="badge bg-danger">{adminStats.pendingApprovals}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verifications Tab */}
        {activeTab === 'verifications' && (
          <div className="verifications-section">
            <div className="section-header mb-4">
              <h3><i className="fas fa-user-check me-2"></i>User Verification Requests</h3>
              <p>Review and approve user verification requests for auction creation</p>
            </div>
            
            <div className="row">
              {verificationRequests.length > 0 ? (
                verificationRequests.map(request => (
                <div key={request.id} className="col-md-6 mb-4">
                  <div className="verification-card">
                    <div className="verification-header">
                      <div className="user-info">
                        <h5>{request.username}</h5>
                        <small>{request.email}</small>
                      </div>
                      <span className={`status-badge ${request.status}`}>
                        {request.status}
                      </span>
                    </div>
                    
                    <div className="verification-details">
                      <div className="detail-row">
                        <span>Aadhaar:</span>
                        <span>{request.aadhaar}</span>
                      </div>
                      <div className="detail-row">
                        <span>PAN:</span>
                        <span>{request.pan}</span>
                      </div>
                      <div className="detail-row">
                        <span>Submitted:</span>
                        <span>{request.submittedAt}</span>
                      </div>
                    </div>
                    
                    <div className="reason-section">
                      <h6>Reason for Auction Creation:</h6>
                      <p>{request.reason}</p>
                    </div>
                    
                    <div className="documents-section">
                      <h6>Documents:</h6>
                      <div className="document-list">
                        {request.documents.map((doc, index) => (
                          <span key={index} className="document-tag">
                            <i className="fas fa-file me-1"></i>{doc}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {request.status === 'pending' && (
                      <div className="verification-actions">
                        <button
                          className="btn btn-success me-2"
                          onClick={() => handleVerificationAction(request.id, 'approve')}
                          disabled={actionLoading[request.id]}
                        >
                          {actionLoading[request.id] ? (
                            <span className="spinner-border spinner-border-sm me-2"></span>
                          ) : (
                            <i className="fas fa-check me-2"></i>
                          )}
                          Approve
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleVerificationAction(request.id, 'reject')}
                          disabled={actionLoading[request.id]}
                        >
                          {actionLoading[request.id] ? (
                            <span className="spinner-border spinner-border-sm me-2"></span>
                          ) : (
                            <i className="fas fa-times me-2"></i>
                          )}
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
              ) : (
                <div className="col-12">
                  <div className="no-data-message">
                    <i className="fas fa-user-clock fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No Verification Requests</h5>
                    <p className="text-muted">There are currently no pending verification requests.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Auctions Tab */}
        {activeTab === 'live-auctions' && (
          <div className="live-auctions-section">
            <div className="section-header mb-4">
              <h3><i className="fas fa-fire me-2"></i>Live Auctions Management</h3>
              <p>Monitor and manage live auctions on the platform</p>
            </div>
            
            <div className="row">
              {liveAuctions.length > 0 ? (
                liveAuctions.map(auction => (
                <div key={auction.id} className="col-md-6 mb-4">
                  <div className="live-auction-card">
                    <div className="auction-header">
                      <h5>{auction.title}</h5>
                      <span className="live-badge">
                        <i className="fas fa-circle me-1"></i>LIVE
                      </span>
                    </div>
                    
                    <div className="auction-info">
                      <div className="info-row">
                        <span>Creator:</span>
                        <span>{auction.creator}</span>
                      </div>
                      <div className="info-row">
                        <span>Wallet:</span>
                        <span className="wallet-address">{auction.creatorWallet}</span>
                      </div>
                      <div className="info-row">
                        <span>Current Bid:</span>
                        <span className="current-bid">{auction.currentBid} ETH</span>
                      </div>
                      <div className="info-row">
                        <span>Time Left:</span>
                        <span className="time-left">{auction.timeLeft}</span>
                      </div>
                      <div className="info-row">
                        <span>Participants:</span>
                        <span className="participants">{auction.participants}</span>
                      </div>
                    </div>
                    
                    <div className="bidders-section">
                      <h6>Recent Bidders:</h6>
                      <div className="bidders-list">
                        {auction.bidders.map((bidder, index) => (
                          <span key={index} className="bidder-wallet">
                            {bidder}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="auction-actions">
                      <button
                        className="btn btn-warning me-2"
                        onClick={() => console.log(`View auction ${auction.id}`)}
                      >
                        <i className="fas fa-eye me-2"></i>
                        View Details
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleAuctionAction(auction.id, 'delete')}
                        disabled={actionLoading[`auction_${auction.id}`]}
                      >
                        {actionLoading[`auction_${auction.id}`] ? (
                          <span className="spinner-border spinner-border-sm me-2"></span>
                        ) : (
                          <i className="fas fa-trash me-2"></i>
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
              ) : (
                <div className="col-12">
                  <div className="no-data-message">
                    <i className="fas fa-gavel fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No Live Auctions</h5>
                    <p className="text-muted">There are currently no live auctions to monitor.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="users-section">
            <div className="section-header mb-4">
              <h3><i className="fas fa-users me-2"></i>User Management</h3>
              <p>Manage platform users and their permissions</p>
            </div>
            
            <div className="users-table">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Wallet</th>
                      <th>Joined</th>
                      <th>Status</th>
                      <th>Verified</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.length > 0 ? (
                      recentUsers.map(user => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td className="wallet-cell">{user.wallet}</td>
                        <td>{user.joined}</td>
                        <td>
                          <span className={`status-badge ${user.status}`}>
                            {user.status}
                          </span>
                        </td>
                        <td>
                          {user.verified ? (
                            <i className="fas fa-check-circle text-success"></i>
                          ) : (
                            <i className="fas fa-times-circle text-danger"></i>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-warning me-2"
                            onClick={() => console.log(`View user ${user.id}`)}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleUserAction(user.id, 'remove')}
                            disabled={actionLoading[user.id]}
                          >
                            {actionLoading[user.id] ? (
                              <span className="spinner-border spinner-border-sm"></span>
                            ) : (
                              <i className="fas fa-trash"></i>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                    ) : (
                      <tr>
                        <td colSpan="7">
                          <div className="no-data-message">
                            <i className="fas fa-users fa-2x text-muted mb-3"></i>
                            <h6 className="text-muted">No Users Found</h6>
                            <p className="text-muted mb-0">There are no users registered on the platform yet.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;