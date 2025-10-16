import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import './AdminPanel.css';

const AdminPanel = () => {
  const { 
    userInfo, 
    isConnected, 
    registerUser,
    getPlatformFee,
    getTotalAuctions,
    getOwner,
    getFeeRecipient,
    isPaused,
    getAllAuctions,
    getAddressFromEmail,
    loading,
    error,
    setError 
  } = useWeb3();
  
  const [registerForm, setRegisterForm] = useState({
    userAddress: '',
    email: ''
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Platform stats state
  const [platformStats, setPlatformStats] = useState({
    platformFee: '0',
    totalAuctions: '0',
    owner: '',
    feeRecipient: '',
    isPaused: false,
    totalAuctionAddresses: 0
  });

  // Fetch platform stats
  const fetchPlatformStats = async () => {
    try {
      const [fee, total, owner, feeRecipient, paused, allAuctions] = await Promise.all([
        getPlatformFee(),
        getTotalAuctions(),
        getOwner(),
        getFeeRecipient(),
        isPaused(),
        getAllAuctions()
      ]);
      
      setPlatformStats({
        platformFee: (parseInt(fee) / 100).toFixed(2), // Convert from basis points to percentage
        totalAuctions: total,
        owner: owner,
        feeRecipient: feeRecipient,
        isPaused: paused,
        totalAuctionAddresses: allAuctions.length
      });
    } catch (err) {
      console.error('Error fetching platform stats:', err);
    }
  };

  useEffect(() => {
    if (isConnected && userInfo?.isAdmin) {
      fetchPlatformStats();
    }
  }, [isConnected, userInfo]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (!registerForm.userAddress || !registerForm.email) {
      setError('Please fill in all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerForm.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Basic address validation
    if (!registerForm.userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError('Please enter a valid Ethereum address');
      return;
    }

    try {
      setRegisterLoading(true);
      setError(null);
      setSuccessMessage('');
      
      await registerUser(registerForm.userAddress, registerForm.email);
      
      setSuccessMessage(`User ${registerForm.email} registered successfully!`);
      setRegisterForm({ userAddress: '', email: '' });
    } catch (err) {
      setError('Registration failed: ' + err.message);
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Check if user is admin
  if (!isConnected) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <i className="fas fa-wallet fa-4x text-muted mb-3"></i>
            <h3>Connect Your Wallet</h3>
            <p className="text-muted">Please connect your wallet to access the admin panel.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userInfo?.isAdmin) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <i className="fas fa-shield-alt fa-4x text-danger mb-3"></i>
            <h3>Access Denied</h3>
            <p className="text-muted">You don't have admin privileges to access this panel.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="container mt-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex align-items-center">
              <i className="fas fa-shield-alt text-primary me-3" style={{ fontSize: '2rem' }}></i>
              <div>
                <h1 className="display-5 fw-bold mb-0">Admin Panel</h1>
                <p className="text-muted mb-0">Manage users and platform settings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Stats */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card stat-card bg-primary text-white">
              <div className="card-body text-center">
                <i className="fas fa-percentage fa-2x mb-2"></i>
                <h3>{platformStats.platformFee}%</h3>
                <p className="mb-0">Platform Fee</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card stat-card bg-success text-white">
              <div className="card-body text-center">
                <i className="fas fa-gavel fa-2x mb-2"></i>
                <h3>{platformStats.totalAuctions}</h3>
                <p className="mb-0">Total Auctions</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card stat-card bg-info text-white">
              <div className="card-body text-center">
                <i className="fas fa-crown fa-2x mb-2"></i>
                <h3>Owner</h3>
                <p className="mb-0 small">{platformStats.owner ? `${platformStats.owner.substring(0, 6)}...${platformStats.owner.substring(platformStats.owner.length - 4)}` : 'Loading...'}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card stat-card bg-warning text-white">
              <div className="card-body text-center">
                <i className="fas fa-wallet fa-2x mb-2"></i>
                <h3>Fee Recipient</h3>
                <p className="mb-0 small">{platformStats.feeRecipient ? `${platformStats.feeRecipient.substring(0, 6)}...${platformStats.feeRecipient.substring(platformStats.feeRecipient.length - 4)}` : 'Loading...'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="row">
          <div className="col-md-4 mb-3">
            <div className="card stat-card bg-secondary text-white">
              <div className="card-body text-center">
                <i className={`fas ${platformStats.isPaused ? 'fa-pause' : 'fa-play'} fa-2x mb-2`}></i>
                <h3>{platformStats.isPaused ? 'Paused' : 'Active'}</h3>
                <p className="mb-0">Contract Status</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card stat-card bg-dark text-white">
              <div className="card-body text-center">
                <i className="fas fa-list fa-2x mb-2"></i>
                <h3>{platformStats.totalAuctionAddresses}</h3>
                <p className="mb-0">All Auctions</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="card stat-card bg-primary text-white">
              <div className="card-body text-center">
                <i className="fas fa-sync-alt fa-2x mb-2"></i>
                <h3>Refresh</h3>
                <button 
                  className="btn btn-outline-light btn-sm"
                  onClick={fetchPlatformStats}
                >
                  Update Stats
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Register User Form */}
        <div className="row">
          <div className="col-lg-6">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="card-title mb-0">
                  <i className="fas fa-user-plus me-2"></i>
                  Register New User
                </h5>
              </div>
              <div className="card-body">
                {/* Success Message */}
                {successMessage && (
                  <div className="alert alert-success alert-dismissible fade show">
                    <i className="fas fa-check-circle me-2"></i>
                    {successMessage}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setSuccessMessage('')}
                    ></button>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setError(null)}
                    ></button>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit}>
                  <div className="mb-3">
                    <label htmlFor="userAddress" className="form-label">
                      <i className="fas fa-wallet me-2"></i>
                      User Wallet Address
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="userAddress"
                      name="userAddress"
                      value={registerForm.userAddress}
                      onChange={handleInputChange}
                      placeholder="0x..."
                      required
                      disabled={registerLoading || loading}
                    />
                    <div className="form-text">
                      Enter the Ethereum wallet address of the user to register
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      <i className="fas fa-envelope me-2"></i>
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={registerForm.email}
                      onChange={handleInputChange}
                      placeholder="user@example.com"
                      required
                      disabled={registerLoading || loading}
                    />
                    <div className="form-text">
                      This email will be associated with the user's account
                    </div>
                  </div>

                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={registerLoading || loading}
                    >
                      {registerLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Registering User...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-user-check me-2"></i>
                          Register User
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <hr className="my-4" />

                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Note:</strong> Only registered users can create auctions. 
                  Make sure to verify the user's identity before registration.
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-6">
            <div className="card">
              <div className="card-header bg-info text-white">
                <h5 className="card-title mb-0">
                  <i className="fas fa-search me-2"></i>
                  Email Lookup
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const email = formData.get('lookupEmail');
                  if (email) {
                    try {
                      const address = await getAddressFromEmail(email);
                      if (address && address !== '0x0000000000000000000000000000000000000000') {
                        alert(`Address found: ${address}`);
                      } else {
                        alert('No address found for this email');
                      }
                    } catch (err) {
                      alert('Error: ' + err.message);
                    }
                  }
                }}>
                  <div className="mb-3">
                    <label htmlFor="lookupEmail" className="form-label">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="lookupEmail"
                      name="lookupEmail"
                      placeholder="user@example.com"
                      required
                    />
                    <div className="form-text">
                      Find wallet address associated with email
                    </div>
                  </div>

                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-info"
                    >
                      <i className="fas fa-search me-2"></i>
                      Lookup Address
                    </button>
                  </div>
                </form>

                <hr className="my-4" />

                <div className="alert alert-warning">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <strong>Privacy Note:</strong> This lookup is for admin purposes only. 
                  Respect user privacy and use responsibly.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;