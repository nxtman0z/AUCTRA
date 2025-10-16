import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../../context/Web3Context';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { 
    account, 
    isConnected, 
    disconnectWallet 
  } = useWeb3();
  
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    disconnectWallet();
    navigate('/');
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center" to="/dashboard">
          <img 
            src="/auctra-logo.png" 
            alt="Auctra" 
            height="40" 
            className="me-2"
            onError={(e) => {e.target.style.display='none'}}
          />
          <span style={{ fontSize: '1.5rem', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Auctra
          </span>
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
          <ul className="navbar-nav me-auto">
            {/* Admin Navigation */}
            {isAdmin() && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin">
                    <i className="fas fa-tachometer-alt me-2"></i>
                    Admin Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/users">
                    <i className="fas fa-users me-2"></i>
                    User Management
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/auctions">
                    <i className="fas fa-gavel me-2"></i>
                    All Auctions
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/analytics">
                    <i className="fas fa-chart-bar me-2"></i>
                    Analytics
                  </Link>
                </li>
              </>
            )}

            {/* Regular User Navigation */}
            {user && !isAdmin() && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">
                    <i className="fas fa-home me-2"></i>
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/auctions">
                    <i className="fas fa-search me-2"></i>
                    Browse Auctions
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/create-auction">
                    <i className="fas fa-plus me-2"></i>
                    Create Auction
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/my-auctions">
                    <i className="fas fa-list me-2"></i>
                    My Auctions
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/profile">
                    <i className="fas fa-user me-2"></i>
                    Profile
                  </Link>
                </li>
              </>
            )}

            {/* Guest Navigation */}
            {!user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/auctions">
                    <i className="fas fa-gavel me-2"></i>
                    Browse Auctions
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/about">
                    <i className="fas fa-info-circle me-2"></i>
                    About
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/contact">
                    <i className="fas fa-envelope me-2"></i>
                    Contact
                  </Link>
                </li>
              </>
            )}
          </ul>
          
          <div className="d-flex align-items-center">
            {user ? (
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <div className="text-light small">
                    <div>� {user.email || user.username}</div>
                    <div>
                      {isAdmin && (
                        <span className="badge bg-warning me-1">Admin</span>
                      )}
                      {isConnected && (
                        <>
                          <span className="badge bg-success me-1">Connected</span>
                          <span className="badge bg-info">{formatAddress(account)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-light btn-sm">
                  Login
                </Link>
                <Link to="/signup" className="btn btn-light btn-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;