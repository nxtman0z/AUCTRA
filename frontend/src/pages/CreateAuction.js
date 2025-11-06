import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  const [kycStatus, setKycStatus] = useState(null);
  const [kycLoading, setKycLoading] = useState(true);

  // Check KYC status on component mount
  useEffect(() => {
    checkKYCStatus();
  }, []);

  const checkKYCStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/kyc-status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setKycStatus(data.kycStatus);
        
        // If KYC is not approved, show error and redirect after 3 seconds
        if (data.kycStatus !== 'approved') {
          setErrorMessage('You must complete KYC verification before creating auctions. Redirecting to KYC page...');
          setTimeout(() => {
            navigate('/profile/kyc');
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Error checking KYC status:', error);
      setErrorMessage('Failed to verify KYC status. Please try again.');
    } finally {
      setKycLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check KYC status before allowing auction creation
    if (kycStatus !== 'approved') {
      setErrorMessage('You must complete KYC verification before creating auctions.');
      setTimeout(() => {
        navigate('/profile/kyc');
      }, 2000);
      return;
    }

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

  // Show loading while checking KYC
  if (kycLoading) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-3">Checking KYC status...</p>
          </div>
        </div>
      </div>
    );
  }

  // Check KYC verification
  if (kycStatus !== 'approved') {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="alert alert-warning text-center" style={{ 
              background: 'rgba(255, 193, 7, 0.1)', 
              border: '1px solid #ffc107',
              borderRadius: '10px',
              padding: '30px'
            }}>
              <i className="fas fa-id-card fa-4x text-warning mb-3"></i>
              <h3 style={{ color: '#ffc107' }}>KYC Verification Required</h3>
              <p className="text-white mb-4">
                You must complete KYC verification before creating auctions. This helps ensure a secure and trusted marketplace.
              </p>
              <div className="mb-3">
                <span className="badge bg-warning text-dark px-3 py-2" style={{ fontSize: '1rem' }}>
                  KYC Status: {kycStatus === 'pending' ? 'Not Started' : kycStatus === 'submitted' ? 'Under Review' : kycStatus === 'rejected' ? 'Rejected' : 'Pending'}
                </span>
              </div>
              <button 
                className="btn btn-warning btn-lg"
                onClick={() => navigate('/profile/kyc')}
                style={{
                  background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
                  border: 'none',
                  fontWeight: 'bold'
                }}
              >
                <i className="fas fa-arrow-right me-2"></i>
                {kycStatus === 'pending' ? 'Start KYC Verification' : kycStatus === 'rejected' ? 'Resubmit KYC' : 'View KYC Status'}
              </button>
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