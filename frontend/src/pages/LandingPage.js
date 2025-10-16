import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark fixed-top">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <img src="/auctra-logo.png" alt="Auctra" className="navbar-logo me-3" />
            <span className="brand-name">Auctra</span>
          </Link>
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link" href="#features">Features</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#about">About</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#contact">Contact</a>
              </li>
              <li className="nav-item ms-3">
                <Link to="/login" className="btn btn-outline-light me-2">Login</Link>
              </li>
              <li className="nav-item">
                <Link to="/signup" className="btn btn-primary">Sign Up</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="row align-items-center min-vh-100">
            <div className="col-lg-6">
              <div className="hero-content">
                <h1 className="hero-title">
                  Welcome to <span className="text-primary">Auctra</span>
                </h1>
                <p className="hero-subtitle">
                  The Future of Decentralized Auctions
                </p>
                <p className="hero-description">
                  Experience transparent, secure, and trustless auctions powered by blockchain technology. 
                  Create, bid, and win in a completely decentralized environment.
                </p>
                <div className="hero-buttons">
                  <Link to="/signup" className="btn btn-primary btn-lg me-3">
                    <i className="fas fa-rocket me-2"></i>
                    Get Started
                  </Link>
                  <Link to="/login" className="btn btn-outline-light btn-lg">
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Login
                  </Link>
                </div>
                <div className="hero-stats mt-5">
                  <div className="row text-center">
                    <div className="col-4">
                      <div className="stat-item">
                        <h3>1000+</h3>
                        <p>Active Users</p>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="stat-item">
                        <h3>500+</h3>
                        <p>Auctions Created</p>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="stat-item">
                        <h3>100%</h3>
                        <p>Secure</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-image">
                <div className="floating-card auction-card">
                  <div className="card bg-dark text-light">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="badge bg-success">Live Auction</span>
                        <span className="text-warning">
                          <i className="fas fa-clock me-1"></i>
                          2h 30m left
                        </span>
                      </div>
                      <h5 className="card-title">Premium NFT Collection</h5>
                      <p className="card-text">Rare digital artwork from top creators</p>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Current Bid:</span>
                        <span className="text-primary fw-bold">5.2 ETH</span>
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
      <section id="features" className="features-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">Why Choose Auctra?</h2>
            <p className="section-subtitle">Experience the power of decentralized auctions</p>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="feature-card text-center">
                <div className="feature-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h4>100% Secure</h4>
                <p>All transactions are secured by blockchain technology with smart contract verification.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card text-center">
                <div className="feature-icon">
                  <i className="fas fa-eye"></i>
                </div>
                <h4>Transparent</h4>
                <p>Every bid, transaction, and auction detail is publicly verifiable on the blockchain.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card text-center">
                <div className="feature-icon">
                  <i className="fas fa-globe"></i>
                </div>
                <h4>Decentralized</h4>
                <p>No central authority controls your auctions. You have complete ownership and control.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card text-center">
                <div className="feature-icon">
                  <i className="fas fa-bolt"></i>
                </div>
                <h4>Fast & Efficient</h4>
                <p>Lightning-fast transactions with minimal fees powered by advanced blockchain technology.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card text-center">
                <div className="feature-icon">
                  <i className="fas fa-users"></i>
                </div>
                <h4>Community Driven</h4>
                <p>Built by the community, for the community. Your voice matters in our platform's evolution.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card text-center">
                <div className="feature-icon">
                  <i className="fas fa-mobile-alt"></i>
                </div>
                <h4>Mobile Friendly</h4>
                <p>Access your auctions anywhere, anytime with our responsive and mobile-optimized design.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section py-5 bg-dark text-light">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h2 className="mb-4">About Auctra</h2>
              <p className="lead mb-4">
                Auctra is revolutionizing the auction industry through blockchain technology, 
                providing a secure, transparent, and decentralized platform for all your auction needs.
              </p>
              <div className="about-features">
                <div className="d-flex mb-3">
                  <i className="fas fa-check-circle text-primary me-3 mt-1"></i>
                  <div>
                    <h5>Smart Contract Powered</h5>
                    <p>All auctions are governed by immutable smart contracts ensuring fairness and security.</p>
                  </div>
                </div>
                <div className="d-flex mb-3">
                  <i className="fas fa-check-circle text-primary me-3 mt-1"></i>
                  <div>
                    <h5>Global Accessibility</h5>
                    <p>Participate in auctions from anywhere in the world with just a web3 wallet.</p>
                  </div>
                </div>
                <div className="d-flex mb-3">
                  <i className="fas fa-check-circle text-primary me-3 mt-1"></i>
                  <div>
                    <h5>Low Fees</h5>
                    <p>Enjoy minimal platform fees with transparent pricing and no hidden costs.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-image">
                <img src="/auctra-logo.png" alt="Auctra Platform" className="img-fluid rounded shadow" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">Get In Touch</h2>
            <p className="section-subtitle">Have questions? We'd love to hear from you.</p>
          </div>
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <div className="row g-4">
                <div className="col-md-4 text-center">
                  <div className="contact-item">
                    <i className="fas fa-envelope contact-icon"></i>
                    <h5>Email Us</h5>
                    <p>support@auctra.com</p>
                  </div>
                </div>
                <div className="col-md-4 text-center">
                  <div className="contact-item">
                    <i className="fas fa-phone contact-icon"></i>
                    <h5>Call Us</h5>
                    <p>+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="col-md-4 text-center">
                  <div className="contact-item">
                    <i className="fas fa-map-marker-alt contact-icon"></i>
                    <h5>Visit Us</h5>
                    <p>123 Blockchain St, Crypto City</p>
                  </div>
                </div>
              </div>
              <div className="contact-form mt-5">
                <form className="row g-3">
                  <div className="col-md-6">
                    <input type="text" className="form-control" placeholder="Your Name" />
                  </div>
                  <div className="col-md-6">
                    <input type="email" className="form-control" placeholder="Your Email" />
                  </div>
                  <div className="col-12">
                    <input type="text" className="form-control" placeholder="Subject" />
                  </div>
                  <div className="col-12">
                    <textarea className="form-control" rows="5" placeholder="Your Message"></textarea>
                  </div>
                  <div className="col-12 text-center">
                    <button type="submit" className="btn btn-primary btn-lg">
                      <i className="fas fa-paper-plane me-2"></i>
                      Send Message
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer bg-dark text-light py-4">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="d-flex align-items-center">
                <img src="/auctra-logo.png" alt="Auctra" className="footer-logo me-3" />
                <span className="brand-name">Auctra</span>
              </div>
              <p className="mt-2 mb-0">The future of decentralized auctions.</p>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="social-links">
                <a href="#" className="text-light me-3"><i className="fab fa-twitter"></i></a>
                <a href="#" className="text-light me-3"><i className="fab fa-discord"></i></a>
                <a href="#" className="text-light me-3"><i className="fab fa-telegram"></i></a>
                <a href="#" className="text-light"><i className="fab fa-github"></i></a>
              </div>
              <p className="mt-2 mb-0">&copy; 2024 Auctra. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;