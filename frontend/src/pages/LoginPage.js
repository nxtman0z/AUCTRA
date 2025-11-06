import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { loginAdmin, loginUser } = useAuth();
  
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
    setSuccess('');

    try {
      // Basic validation
      if (!userForm.email || !userForm.password) {
        setError('Please fill in all fields');
        return;
      }

      console.log('🔐 Attempting user login with:', {
        email: userForm.email
      });

      const result = await loginUser(userForm.email, userForm.password);
      
      if (result.success) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      console.error('User login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Basic validation
      if (!adminForm.adminKey) {
        setError('Please enter admin key');
        return;
      }

      console.log('👑 Attempting admin login...');

      const result = await loginAdmin(adminForm.adminKey);
      
      if (result.success) {
        setSuccess('Admin login successful! Redirecting...');
        setTimeout(() => {
          navigate('/admin');
        }, 1500);
      } else {
        setError(result.error || 'Admin login failed');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err.message || 'Admin login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Header */}
        <div className="login-header">
          <Link to="/" className="brand-link">
            <span className="brand-name">Auctra</span>
          </Link>
          <p className="login-subtitle">Welcome back to the future of auctions</p>
        </div>

        {/* Login Form */}
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