import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { loginAdmin, loginUser } = useAuth();
  const { connectWallet, account, isConnected } = useWeb3();
  
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'admin'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [userForm, setUserForm] = useState({
    email: '',
    password: ''
  });

  const [adminForm, setAdminForm] = useState({
    adminKey: ''
  });

  const handleUserInputChange = (e) => {
    setUserForm({
      ...userForm,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleAdminInputChange = (e) => {
    setAdminForm({
      ...adminForm,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleUserLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!isConnected) {
        setError('Please connect your wallet first');
        return;
      }

      const result = await loginUser(userForm.email, userForm.password, account);
      
      if (result.success) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!isConnected) {
        setError('Please connect your wallet first');
        return;
      }

      const result = await loginAdmin(adminForm.adminKey, account);
      
      if (result.success) {
        setSuccess('Admin login successful! Redirecting...');
        setTimeout(() => {
          navigate('/admin');
        }, 1500);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Admin login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    try {
      setError('');
      await connectWallet();
      setSuccess('Wallet connected successfully!');
    } catch (err) {
      setError('Failed to connect wallet. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Header */}
        <div className="login-header">
          <Link to="/" className="brand-link">
            <img src="/auctra-logo.png" alt="Auctra" className="login-logo" />
            <span className="brand-name">Auctra</span>
          </Link>
          <p className="login-subtitle">Welcome back to the future of auctions</p>
        </div>

        {/* Wallet Connection Status */}
        <div className="wallet-status">
          {!isConnected ? (
            <div className="wallet-connect">
              <div className="alert alert-warning">
                <i className="fas fa-wallet me-2"></i>
                Please connect your wallet to continue
              </div>
              <button 
                className="btn btn-outline-primary btn-lg w-100"
                onClick={handleWalletConnect}
                disabled={loading}
              >
                <i className="fas fa-wallet me-2"></i>
                Connect Wallet
              </button>
            </div>
          ) : (
            <div className="wallet-connected">
              <div className="alert alert-success">
                <i className="fas fa-check-circle me-2"></i>
                Wallet Connected: {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
              </div>
            </div>
          )}
        </div>

        {/* Login Form */}
        {isConnected && (
          <div className="login-form-container">
            {/* Tab Navigation */}
            <div className="login-tabs">
              <button 
                className={`tab-btn ${activeTab === 'user' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('user');
                  setError('');
                  setSuccess('');
                }}
              >
                <i className="fas fa-user me-2"></i>
                User Login
              </button>
              <button 
                className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('admin');
                  setError('');
                  setSuccess('');
                }}
              >
                <i className="fas fa-shield-alt me-2"></i>
                Admin Login
              </button>
            </div>

            {/* Messages */}
            {error && (
              <div className="alert alert-danger">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}
            
            {success && (
              <div className="alert alert-success">
                <i className="fas fa-check-circle me-2"></i>
                {success}
              </div>
            )}

            {/* User Login Form */}
            {activeTab === 'user' && (
              <form onSubmit={handleUserLogin} className="login-form">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    <i className="fas fa-envelope me-2"></i>
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    placeholder="Enter your email"
                    value={userForm.email}
                    onChange={handleUserInputChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    <i className="fas fa-lock me-2"></i>
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="form-control"
                    placeholder="Enter your password"
                    value={userForm.password}
                    onChange={handleUserInputChange}
                    required
                    disabled={loading}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2"></div>
                      Logging in...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt me-2"></i>
                      Login as User
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Admin Login Form */}
            {activeTab === 'admin' && (
              <form onSubmit={handleAdminLogin} className="login-form">
                <div className="form-group">
                  <label htmlFor="adminKey" className="form-label">
                    <i className="fas fa-key me-2"></i>
                    Admin Key
                  </label>
                  <input
                    type="password"
                    id="adminKey"
                    name="adminKey"
                    className="form-control"
                    placeholder="Enter admin key"
                    value={adminForm.adminKey}
                    onChange={handleAdminInputChange}
                    required
                    disabled={loading}
                  />
                  <div className="form-text">
                    <i className="fas fa-info-circle me-1"></i>
                    Admin key: AUCTRA_ADMIN_2024
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-danger btn-lg w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2"></div>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-shield-alt me-2"></i>
                      Login as Admin
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Footer Links */}
            <div className="login-footer">
              <p>Don't have an account?</p>
              <Link to="/signup" className="signup-link">
                Create Account
                <i className="fas fa-arrow-right ms-2"></i>
              </Link>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="back-home">
          <Link to="/" className="btn btn-outline-secondary">
            <i className="fas fa-arrow-left me-2"></i>
            Back to Home
          </Link>
        </div>
      </div>

      {/* Background Animation */}
      <div className="login-bg">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;