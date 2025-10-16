import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import './CreateAuction.css';

const CreateAuction = () => {
  const { 
    isConnected, 
    userInfo, 
    createAuction,
    loading,
    error,
    setError 
  } = useWeb3();

  const [formData, setFormData] = useState({
    productName: '',
    productDescription: '',
    imageHash: '',
    startingPrice: '',
    durationInHours: ''
  });

  const [createLoading, setCreateLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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
      setError('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.startingPrice) <= 0) {
      setError('Starting price must be greater than 0');
      return;
    }

    if (parseInt(formData.durationInHours) < 1 || parseInt(formData.durationInHours) > 168) {
      setError('Duration must be between 1 and 168 hours');
      return;
    }

    try {
      setCreateLoading(true);
      setError(null);
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
      setError('Failed to create auction: ' + err.message);
    } finally {
      setCreateLoading(false);
    }
  };

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

                {error && (
                  <div className="alert alert-danger alert-dismissible fade show">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setError(null)}
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