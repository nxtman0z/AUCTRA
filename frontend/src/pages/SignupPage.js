import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import './SignupPage.css';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signupUser } = useAuth();
  const { connectWallet, account, isConnected } = useWeb3();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!isConnected) {
        setError('Please connect your wallet first');
        return;
      }

      if (!form.agreeTerms) {
        setError('Please accept the Terms of Service and Privacy Policy');
        return;
      }

      const result = await signupUser({
        ...form,
        walletAddress: account
      });
      
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
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
    <div className="signup-page">
      <div className="signup-container">
        {/* Header */}
        <div className="signup-header">
          <Link to="/" className="brand-link">
            <img src="/auctra-logo.png" alt="Auctra" className="signup-logo" />
            <span className="brand-name">Auctra</span>
          </Link>
          <h2 className="signup-title">Join the Revolution</h2>
          <p className="signup-subtitle">Create your account and start bidding on exclusive auctions</p>
        </div>

        {/* Wallet Connection Status */}
        <div className="wallet-status">
          {!isConnected ? (
            <div className="wallet-connect">
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                Connect your Web3 wallet to get started
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

        {/* Signup Form */}
        {isConnected && (
          <div className="signup-form-container">
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

            <form onSubmit={handleSubmit} className="signup-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName" className="form-label">
                    <i className="fas fa-user me-2"></i>
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    className="form-control"
                    placeholder="Enter your full name"
                    value={form.fullName}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>

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
                    value={form.email}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
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
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    minLength="6"
                  />
                  <div className="form-text">
                    Password must be at least 6 characters long
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    <i className="fas fa-lock me-2"></i>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="form-control"
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Connected Wallet Info */}
              <div className="wallet-info">
                <div className="info-card">
                  <i className="fas fa-wallet text-primary me-2"></i>
                  <div>
                    <strong>Connected Wallet:</strong><br />
                    <small className="text-muted">{account}</small>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="form-check-container">
                <div className="form-check">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    name="agreeTerms"
                    className="form-check-input"
                    checked={form.agreeTerms}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                  <label htmlFor="agreeTerms" className="form-check-label">
                    I agree to the <a href="#" className="terms-link">Terms of Service</a> and <a href="#" className="terms-link">Privacy Policy</a>
                  </label>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-lg w-100"
                disabled={loading || !form.agreeTerms}
              >
                {loading ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus me-2"></i>
                    Create Account
                  </>
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="signup-footer">
              <p>Already have an account?</p>
              <Link to="/login" className="login-link">
                Sign In
                <i className="fas fa-arrow-right ms-2"></i>
              </Link>
            </div>
          </div>
        )}

        {/* Important Note */}
        <div className="signup-note">
          <div className="note-card">
            <i className="fas fa-info-circle text-warning me-2"></i>
            <div>
              <strong>Important:</strong> After registration, please contact an administrator to verify your account before you can create auctions.
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="back-home">
          <Link to="/" className="btn btn-outline-secondary">
            <i className="fas fa-arrow-left me-2"></i>
            Back to Home
          </Link>
        </div>
      </div>

      {/* Background Animation */}
      <div className="signup-bg">
        <div className="floating-elements">
          <div className="element element-1"></div>
          <div className="element element-2"></div>
          <div className="element element-3"></div>
          <div className="element element-4"></div>
          <div className="element element-5"></div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;