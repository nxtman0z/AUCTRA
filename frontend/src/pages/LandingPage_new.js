import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage_new.css';

const LandingPageNew = () => {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-navbar">
        <div className="nav-container">
          <Link className="nav-brand" to="/">
            <img 
              src="/auctra_logo.png" 
              alt="AUCTRA Logo" 
              style={{height: '40px', width: 'auto'}}
            />
          </Link>
          
          <div className="nav-menu">
            <a href="#features" className="nav-link">Features</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#contact" className="nav-link">Contact</a>
            <Link to="/login" className="nav-btn nav-btn-outline">Login</Link>
            <Link to="/signup" className="nav-btn nav-btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <i className="fas fa-rocket"></i>
              <span>Next-Gen Auction Platform</span>
            </div>
            
            <h1 className="hero-title">
              The Future of
              <span className="title-highlight"> Digital Auctions</span>
              is Here
            </h1>
            
            <p className="hero-description">
              Experience seamless, transparent, and secure auctions powered by blockchain technology. 
              Join thousands of users in the most innovative auction marketplace.
            </p>
            
            <div className="hero-actions">
              <Link to="/signup" className="btn-hero btn-hero-primary">
                <i className="fas fa-arrow-right"></i>
                Start Bidding
              </Link>
              <a href="#features" className="btn-hero btn-hero-secondary">
                <i className="fas fa-play-circle"></i>
                Watch Demo
              </a>
            </div>
            
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">5,000+</div>
                <div className="stat-label">Active Users</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">$2.5M+</div>
                <div className="stat-label">Volume Traded</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">15,000+</div>
                <div className="stat-label">Successful Auctions</div>
              </div>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="visual-container">
              <div className="floating-card card-1">
                <div className="card-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <div className="card-content">
                  <h4>Secure</h4>
                  <p>Blockchain Protected</p>
                </div>
              </div>
              
              <div className="floating-card card-2">
                <div className="card-icon">
                  <i className="fas fa-lightning-bolt"></i>
                </div>
                <div className="card-content">
                  <h4>Fast</h4>
                  <p>Instant Transactions</p>
                </div>
              </div>
              
              <div className="floating-card card-3">
                <div className="card-icon">
                  <i className="fas fa-globe"></i>
                </div>
                <div className="card-content">
                  <h4>Global</h4>
                  <p>Worldwide Access</p>
                </div>
              </div>
              
              <div className="main-visual">
                <div className="auction-preview">
                  <div className="auction-header">
                    <div className="auction-status">LIVE AUCTION</div>
                    <div className="auction-timer">02:45:30</div>
                  </div>
                  <div className="auction-item">
                    <div className="item-image"></div>
                    <div className="item-details">
                      <h4>Digital Art Collection</h4>
                      <div className="current-bid">
                        <span className="bid-label">Current Bid</span>
                        <span className="bid-amount">0.85 ETH</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="features-container">
          <div className="section-header">
            <h2 className="section-title">Why Choose AUCTRA?</h2>
            <p className="section-description">
              Built with cutting-edge technology for the modern digital economy
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-lock"></i>
              </div>
              <h3 className="feature-title">Blockchain Security</h3>
              <p className="feature-description">
                Every transaction is secured and verified on the blockchain, ensuring complete transparency and trust.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3 className="feature-title">Real-time Bidding</h3>
              <p className="feature-description">
                Experience live auctions with instant bid updates and real-time price tracking.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3 className="feature-title">Global Community</h3>
              <p className="feature-description">
                Join a worldwide community of collectors, artists, and enthusiasts.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-mobile-alt"></i>
              </div>
              <h3 className="feature-title">Mobile Friendly</h3>
              <p className="feature-description">
                Bid and manage your auctions from anywhere with our responsive design.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="about-container">
          <div className="about-content">
            <div className="about-text">
              <h2 className="about-title">Revolutionizing Digital Commerce</h2>
              <p className="about-description">
                AUCTRA combines the excitement of traditional auctions with the power of blockchain technology. 
                We're creating a new standard for digital asset trading that's transparent, secure, and accessible to everyone.
              </p>
              <div className="about-features">
                <div className="about-feature">
                  <i className="fas fa-check-circle"></i>
                  <span>Transparent Bidding Process</span>
                </div>
                <div className="about-feature">
                  <i className="fas fa-check-circle"></i>
                  <span>Smart Contract Protection</span>
                </div>
                <div className="about-feature">
                  <i className="fas fa-check-circle"></i>
                  <span>24/7 Customer Support</span>
                </div>
              </div>
            </div>
            
            <div className="about-visual">
              <div className="about-image">
                <div className="image-placeholder">
                  <i className="fas fa-chart-area"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Start Your Auction Journey?</h2>
            <p className="cta-description">
              Join thousands of users who trust AUCTRA for their digital asset trading
            </p>
            <div className="cta-actions">
              <Link to="/signup" className="cta-btn cta-btn-primary">
                Create Account
              </Link>
              <Link to="/dashboard" className="cta-btn cta-btn-secondary">
                Explore Auctions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="brand-logo">
                <i className="fas fa-gavel"></i>
              </div>
              <span className="brand-text">AUCTRA</span>
              <p className="footer-description">
                The next generation auction platform powered by blockchain technology.
              </p>
            </div>
            
            <div className="footer-links">
              <div className="link-group">
                <h4>Platform</h4>
                <a href="#features">Features</a>
                <a href="#about">About</a>
                <Link to="/dashboard">Dashboard</Link>
              </div>
              
              <div className="link-group">
                <h4>Account</h4>
                <Link to="/login">Login</Link>
                <Link to="/signup">Sign Up</Link>
                <a href="#contact">Support</a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2025 AUCTRA. All rights reserved.</p>
            <div className="social-links">
              <button type="button" className="social-link" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </button>
              <button type="button" className="social-link" aria-label="Discord">
                <i className="fab fa-discord"></i>
              </button>
              <button type="button" className="social-link" aria-label="Telegram">
                <i className="fab fa-telegram"></i>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageNew;