import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserVerification.css';

const UserVerification = () => {
  // Removed unused variable: user
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    aadhaar: '',
    pan: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    reason: '',
    documents: {
      aadhaar: null,
      pan: null,
      photo: null
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, docType) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPG, PNG, and PDF files are allowed');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [docType]: file
        }
      }));
      setError('');
    }
  };

  const validateForm = () => {
    if (!formData.aadhaar || formData.aadhaar.length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar number');
      return false;
    }
    
    if (!formData.pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
      setError('Please enter a valid PAN number (e.g., ABCDE1234F)');
      return false;
    }
    
    if (!formData.address || !formData.city || !formData.state || !formData.pincode) {
      setError('Please fill all address fields');
      return false;
    }
    
    if (!formData.reason) {
      setError('Please provide a reason for auction creation');
      return false;
    }
    
    if (!formData.documents.aadhaar || !formData.documents.pan || !formData.documents.photo) {
      setError('Please upload all required documents');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const submitData = new FormData();
      
      // Append form data
      Object.keys(formData).forEach(key => {
        if (key !== 'documents') {
          submitData.append(key, formData[key]);
        }
      });
      
      // Append files
      Object.keys(formData.documents).forEach(docType => {
        if (formData.documents[docType]) {
          submitData.append(docType, formData.documents[docType]);
        }
      });

      const response = await fetch('/api/users/verification-request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: submitData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification request failed');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (error) {
      console.error('Verification error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="verification-container">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="success-card">
                <div className="success-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h3>Verification Request Submitted!</h3>
                <p>Your verification request has been sent to the admin for review. You'll be notified once it's approved.</p>
                <p>You'll be redirected to the dashboard in a few seconds...</p>
                <div className="spinner-border mt-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="verification-container">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="verification-card">
              <div className="verification-header">
                <h2>User Verification</h2>
                <p>Complete your verification to create auctions on AUCTRA</p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="verification-form">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="fas fa-id-card me-2"></i>
                      Aadhaar Number *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="aadhaar"
                      value={formData.aadhaar}
                      onChange={handleInputChange}
                      placeholder="Enter 12-digit Aadhaar number"
                      maxLength="12"
                      required
                    />
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="fas fa-credit-card me-2"></i>
                      PAN Number *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="pan"
                      value={formData.pan}
                      onChange={handleInputChange}
                      placeholder="ABCDE1234F"
                      maxLength="10"
                      style={{textTransform: 'uppercase'}}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    <i className="fas fa-home me-2"></i>
                    Full Address *
                  </label>
                  <textarea
                    className="form-control"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your complete address"
                    rows="3"
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      required
                    />
                  </div>
                  
                  <div className="col-md-4 mb-3">
                    <label className="form-label">State *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      required
                    />
                  </div>
                  
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Pincode *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="123456"
                      maxLength="6"
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    <i className="fas fa-gavel me-2"></i>
                    Reason for Auction Creation *
                  </label>
                  <textarea
                    className="form-control"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Explain why you want to create auctions on AUCTRA"
                    rows="4"
                    required
                  />
                </div>

                <div className="documents-section">
                  <h5>
                    <i className="fas fa-upload me-2"></i>
                    Upload Documents
                  </h5>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Aadhaar Card *</label>
                      <input
                        type="file"
                        className="form-control"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => handleFileChange(e, 'aadhaar')}
                        required
                      />
                      {formData.documents.aadhaar && (
                        <small className="text-success">
                          <i className="fas fa-check me-1"></i>
                          {formData.documents.aadhaar.name}
                        </small>
                      )}
                    </div>
                    
                    <div className="col-md-4 mb-3">
                      <label className="form-label">PAN Card *</label>
                      <input
                        type="file"
                        className="form-control"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => handleFileChange(e, 'pan')}
                        required
                      />
                      {formData.documents.pan && (
                        <small className="text-success">
                          <i className="fas fa-check me-1"></i>
                          {formData.documents.pan.name}
                        </small>
                      )}
                    </div>
                    
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Profile Photo *</label>
                      <input
                        type="file"
                        className="form-control"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, 'photo')}
                        required
                      />
                      {formData.documents.photo && (
                        <small className="text-success">
                          <i className="fas fa-check me-1"></i>
                          {formData.documents.photo.name}
                        </small>
                      )}
                    </div>
                  </div>
                  <small className="text-muted">
                    <i className="fas fa-info-circle me-1"></i>
                    Supported formats: JPG, PNG, PDF. Maximum file size: 5MB
                  </small>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline-secondary me-3"
                    onClick={() => navigate('/dashboard')}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2"></i>
                        Submit for Verification
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
  );
};

export default UserVerification;