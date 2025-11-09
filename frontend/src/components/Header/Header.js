import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg" style={{ background: 'var(--bg-cards)', borderBottom: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center" to="/dashboard">
          <img 
            src="/logo-auctra.svg" 
            alt="AUCTRA Logo" 
            height="40" 
            className="me-2"
          />
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
              </>
            )}

            {/* Regular User Navigation */}
            {user && !isAdmin() && (
              <>
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
          
          <div className="d-flex align-items-center gap-3">
            {user ? (
              <>
                {/* Admin Profile Dropdown */}
                {isAdmin() && (
                  <div className="dropdown">
                    <button
                      className="btn btn-warning dropdown-toggle d-flex align-items-center"
                      type="button"
                      id="adminDropdown"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="fas fa-user-shield me-2"></i>
                      Admin
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="adminDropdown">
                      <li>
                        <div className="dropdown-header">
                          <strong>Admin Account</strong>
                        </div>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <span className="dropdown-item-text">
                          <i className="fas fa-envelope me-2"></i>
                          {user.email || 'admin@auctra.com'}
                        </span>
                      </li>
                      <li>
                        <span className="dropdown-item-text">
                          <i className="fas fa-id-badge me-2"></i>
                          Role: Administrator
                        </span>
                      </li>
                      <li>
                        <span className="dropdown-item-text">
                          <i className="fas fa-shield-alt me-2"></i>
                          Access Level: Full
                        </span>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button className="dropdown-item text-danger" onClick={handleLogout}>
                          <i className="fas fa-sign-out-alt me-2"></i>
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
                
                {/* Regular User Profile Dropdown */}
                {!isAdmin() && (
                  <div className="dropdown">
                    <button
                      className="btn btn-light dropdown-toggle d-flex align-items-center"
                      type="button"
                      id="userDropdown"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="fas fa-user-circle me-2"></i>
                      Profile
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                      <li>
                        <div className="dropdown-header">
                          <strong>{user.username || 'User'}</strong>
                        </div>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <Link className="dropdown-item" to="/profile">
                          <i className="fas fa-user me-2"></i>
                          My Profile
                        </Link>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button className="dropdown-item text-danger" onClick={handleLogout}>
                          <i className="fas fa-sign-out-alt me-2"></i>
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </>
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