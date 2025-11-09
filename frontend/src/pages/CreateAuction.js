import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import './CreateAuction.css';

const CreateAuction = () => {
  const { 
    isConnected, 
    userInfo, 
    createAuction,
    loading
  } = useWeb3();
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [checkingVerification, setCheckingVerification] = useState(true);

  const [formData, setFormData] = useState({
    productName: '',
    productDescription: '',
    imageHash: '',
    startingPrice: '',
    durationInHours: ''
  });

  const [createLoading, setCreateLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Check verification status on component mount
  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const response = await fetch('/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await response.json();
        
        if (response.ok && data.data.user) {
          const userData = data.data.user;
          
          // Check if user has verification request and its status
          if (userData.verificationRequest) {
            setVerificationStatus(userData.verificationRequest.status);
          } else if (userData.isVerifiedForAuctions) {
            setVerificationStatus('approved');
          } else {
            setVerificationStatus(null);
          }
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
        setVerificationStatus(null);
      } finally {
        setCheckingVerification(false);
      }
    };

    if (user) {
      checkVerificationStatus();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.productName || !formData.productDescription || !formData.startingPrice || !formData.durationInHours) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.startingPrice) <= 0) {
      setErrorMessage('Starting price must be greater than 0');
      return;
    }

    if (parseInt(formData.durationInHours) < 1 || parseInt(formData.durationInHours) > 168) {
      setErrorMessage('Duration must be between 1 and 168 hours');
      return;
    }

    try {
      setCreateLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const auctionAddress = await createAuction(
        formData.productName,
        formData.productDescription,
        formData.imageHash || '',
        formData.startingPrice,
        parseInt(formData.durationInHours)
      );

      if (auctionAddress) {
        setSuccessMessage(`Auction created successfully! Address: ${auctionAddress}`);
        setFormData({
          productName: '',
          productDescription: '',
          imageHash: '',
          startingPrice: '',
          durationInHours: ''
        });
      }
    } catch (err) {
      setErrorMessage('Failed to create auction: ' + err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  if (checkingVerification) {
    return (
      <div className="create-auction-page">
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-6 text-center">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h5>Checking verification status...</h5>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if user needs to get verified
  if (!verificationStatus || verificationStatus === 'rejected') {
    return (
      <div className="create-auction-page">
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="verification-required-card">
                <div className="text-center">
                  <i className="fas fa-user-check fa-4x text-warning mb-4"></i>
                  <h2>Verification Required</h2>
                  <p className="text-muted mb-4">
                    To create auctions on AUCTRA, you need to complete our verification process.
                    This helps us ensure the security and authenticity of all auction creators.
                  </p>
                  
                  <div className="verification-info mb-4">
                    <h5>What you'll need:</h5>
                    <ul className="list-unstyled">
                      <li><i className="fas fa-id-card text-primary me-2"></i>Valid Aadhaar Card</li>
                      <li><i className="fas fa-credit-card text-primary me-2"></i>Valid PAN Card</li>
                      <li><i className="fas fa-camera text-primary me-2"></i>Recent Photo</li>
                      <li><i className="fas fa-home text-primary me-2"></i>Address Information</li>
                    </ul>
                  </div>

                  {verificationStatus === 'rejected' && (
                    <div className="alert alert-warning">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Your previous verification request was rejected. Please submit a new request with correct information.
                    </div>
                  )}

                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => navigate('/user-verification')}
                  >
                    <i className="fas fa-arrow-right me-2"></i>
                    Start Verification Process
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if verification is pending
  if (verificationStatus === 'pending') {
    return (
      <div className="create-auction-page">
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="verification-pending-card">
                <div className="text-center">
                  <i className="fas fa-clock fa-4x text-info mb-4"></i>
                  <h2>Verification Under Review</h2>
                  <p className="text-muted mb-4">
                    Your verification request is currently being reviewed by our admin team.
                    You'll receive an email notification once the review is complete.
                  </p>
                  
                  <div className="status-timeline mb-4">
                    <div className="timeline-step completed">
                      <i className="fas fa-check"></i>
                      <span>Application Submitted</span>
                    </div>
                    <div className="timeline-step active">
                      <i className="fas fa-clock"></i>
                      <span>Under Review</span>
                    </div>
                    <div className="timeline-step">
                      <i className="fas fa-user-check"></i>
                      <span>Approved</span>
                    </div>
                  </div>

                  <div className="d-flex gap-3 justify-content-center">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => navigate('/dashboard')}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Back to Dashboard
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => window.location.reload()}
                    >
                      <i className="fas fa-refresh me-2"></i>
                      Check Status
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <i className="fas fa-wallet fa-4x text-muted mb-3"></i>
            <h3>Connect Your Wallet</h3>
            <p className="text-muted">Please connect your wallet to create auctions.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userInfo?.isRegistered) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <i className="fas fa-exclamation-triangle fa-4x text-warning mb-3"></i>
            <h3>Registration Required</h3>
            <p className="text-muted">You need to be a registered user to create auctions. Please contact an admin.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-auction-page">
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h4 className="card-title mb-0">
                  <i className="fas fa-plus-circle me-2"></i>
                  Create New Auction
                </h4>
              </div>
              <div className="card-body">
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

                {errorMessage && (
                  <div className="alert alert-danger alert-dismissible fade show">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {errorMessage}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setErrorMessage('')}
                    ></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="productName" className="form-label">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="productName"
                      name="productName"
                      value={formData.productName}
                      onChange={handleInputChange}
                      placeholder="Enter product name"
                      required
                      disabled={createLoading || loading}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="productDescription" className="form-label">
                      Product Description *
                    </label>
                    <textarea
                      className="form-control"
                      id="productDescription"
                      name="productDescription"
                      rows="4"
                      value={formData.productDescription}
                      onChange={handleInputChange}
                      placeholder="Describe your product in detail"
                      required
                      disabled={createLoading || loading}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="imageHash" className="form-label">
                      Image Hash (IPFS)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="imageHash"
                      name="imageHash"
                      value={formData.imageHash}
                      onChange={handleInputChange}
                      placeholder="Optional: IPFS hash of product image"
                      disabled={createLoading || loading}
                    />
                    <div className="form-text">
                      Optional: Enter IPFS hash for product image
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="startingPrice" className="form-label">
                          Starting Price (ETH) *
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          min="0.001"
                          className="form-control"
                          id="startingPrice"
                          name="startingPrice"
                          value={formData.startingPrice}
                          onChange={handleInputChange}
                          placeholder="0.01"
                          required
                          disabled={createLoading || loading}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="durationInHours" className="form-label">
                          Duration (Hours) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="168"
                          className="form-control"
                          id="durationInHours"
                          name="durationInHours"
                          value={formData.durationInHours}
                          onChange={handleInputChange}
                          placeholder="24"
                          required
                          disabled={createLoading || loading}
                        />
                        <div className="form-text">
                          Between 1 and 168 hours (7 days max)
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={createLoading || loading}
                    >
                      {createLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Creating Auction...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-gavel me-2"></i>
                          Create Auction
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAuction;