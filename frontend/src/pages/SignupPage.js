import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './SignupPage.css';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signupUser } = useAuth();
  
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
    setSuccess('');

    try {
      // Comprehensive validation
      if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
        setError('Please fill in all fields');
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (form.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }

      // Check password strength
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
      if (!passwordRegex.test(form.password)) {
        setError('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)');
        return;
      }

      // Check email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        setError('Please enter a valid email address');
        return;
      }

      // Check for Gmail, Yahoo, Outlook, etc.
      const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
      const emailDomain = form.email.split('@')[1]?.toLowerCase();
      if (!allowedDomains.includes(emailDomain)) {
        setError('Please use a valid email from Gmail, Yahoo, Outlook, Hotmail, or iCloud');
        return;
      }



      if (!form.agreeTerms) {
        setError('Please accept the Terms of Service and Privacy Policy');
        return;
      }

      console.log('📝 Attempting user signup with:', {
        username: form.fullName.replace(/\s+/g, '_').toLowerCase(),
        email: form.email
      });

      // Prepare signup data
      const signupData = {
        username: form.fullName.replace(/\s+/g, '_').toLowerCase(), // Convert fullName to username
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        terms: form.agreeTerms
      };

      const result = await signupUser(signupData);
      
      if (result.success) {
        setSuccess('Registration successful! Welcome to Auctra! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        // Handle specific error messages
        const errorMsg = result.error || 'Registration failed';
        if (errorMsg.includes('wallet')) {
          setError('This wallet is already connected to another account. Please disconnect your wallet or login instead.');
        } else if (errorMsg.includes('Email already')) {
          setError('This email is already registered. Please login instead or use a different email.');
        } else if (errorMsg.includes('Username already')) {
          setError('This username is already taken. Please choose a different username.');
        } else {
          setError(errorMsg);
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
      
      // Handle specific error messages
      const errorMsg = err.message || 'Registration failed';
      if (errorMsg.includes('wallet') || errorMsg.includes('WalletAddress')) {
        setError('This wallet is already connected to another account. Please disconnect your wallet from MetaMask or login instead.');
      } else if (errorMsg.includes('Email already') || errorMsg.includes('email')) {
        setError('This email is already registered. Please login instead.');
      } else if (errorMsg.includes('Username already') || errorMsg.includes('username')) {
        setError('This username is already taken. Please choose another.');
      } else {
        setError('Registration failed. Please try again or contact support.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        {/* Header */}
        <div className="signup-header">
          <Link to="/" className="brand-link">
            <span className="brand-name">Auctra</span>
          </Link>
          <h2 className="signup-title">Join the Revolution</h2>
          <p className="signup-subtitle">Create your account and start bidding on exclusive auctions</p>
        </div>

        {/* Signup Form */}
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

              {/* Info Note */}
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Note:</strong> You can connect your MetaMask wallet later from your profile to participate in auctions.
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