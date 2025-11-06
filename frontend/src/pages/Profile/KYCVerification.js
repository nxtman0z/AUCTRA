import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './KYCVerification.css';

const KYCVerification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [kycData, setKycData] = useState({
    aadhaarNumber: '',
    panNumber: '',
    aadhaarFront: null,
    aadhaarBack: null,
    panCard: null,
    selfie: null,
    aadhaarFrontPreview: '',
    aadhaarBackPreview: '',
    panCardPreview: '',
    selfiePreview: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [kycStatus, setKycStatus] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchKYCStatus();
  }, [user, navigate]);

  const fetchKYCStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/kyc-status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setKycStatus(data.kycStatus);
        if (data.kyc) {
          setKycData(prev => ({
            ...prev,
            aadhaarNumber: data.kyc.aadhaarNumber || '',
            panNumber: data.kyc.panNumber || '',
            aadhaarFrontPreview: data.kyc.aadhaarFront || '',
            aadhaarBackPreview: data.kyc.aadhaarBack || '',
            panCardPreview: data.kyc.panCard || '',
            selfiePreview: data.kyc.selfie || ''
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching KYC status:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setKycData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${fieldName} size should be less than 5MB`);
        return;
      }
      setKycData(prev => ({
        ...prev,
        [fieldName]: file,
        [`${fieldName}Preview`]: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!kycData.aadhaarNumber || kycData.aadhaarNumber.length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar number');
      setLoading(false);
      return;
    }

    if (!kycData.panNumber || kycData.panNumber.length !== 10) {
      setError('Please enter a valid 10-character PAN number');
      setLoading(false);
      return;
    }

    if (!kycData.aadhaarFront || !kycData.aadhaarBack || !kycData.panCard || !kycData.selfie) {
      setError('Please upload all required documents');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('aadhaarNumber', kycData.aadhaarNumber);
      formData.append('panNumber', kycData.panNumber.toUpperCase());
      formData.append('aadhaarFront', kycData.aadhaarFront);
      formData.append('aadhaarBack', kycData.aadhaarBack);
      formData.append('panCard', kycData.panCard);
      formData.append('selfie', kycData.selfie);

      const response = await fetch('http://localhost:5000/api/users/kyc-submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('KYC documents submitted successfully! Admin will review your documents.');
        setKycStatus('submitted');
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        setError(data.message || 'Failed to submit KYC');
      }
    } catch (err) {
      setError('Error submitting KYC: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (kycStatus) {
      case 'approved':
        return <span className="badge badge-approved"><i className="fas fa-check-circle me-1"></i>Approved</span>;
      case 'rejected':
        return <span className="badge badge-rejected"><i className="fas fa-times-circle me-1"></i>Rejected</span>;
      case 'submitted':
        return <span className="badge badge-submitted"><i className="fas fa-clock me-1"></i>Under Review</span>;
      default:
        return <span className="badge badge-pending"><i className="fas fa-exclamation-circle me-1"></i>Pending</span>;
    }
  };

  return (
    <div className="kyc-verification-page">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="kyc-card">
              <div className="kyc-header">
                <h2>
                  <i className="fas fa-id-card me-3"></i>
                  KYC Verification
                </h2>
                <p className="text-muted">Complete your KYC to create auctions on the platform</p>
                <div className="status-badge-container">
                  {getStatusBadge()}
                </div>
              </div>

              {success && (
                <div className="alert alert-success">
                  <i className="fas fa-check-circle me-2"></i>
                  {success}
                </div>
              )}

              {error && (
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              {kycStatus === 'approved' ? (
                <div className="text-center py-5">
                  <i className="fas fa-check-circle text-success" style={{ fontSize: '5rem' }}></i>
                  <h3 className="mt-4 text-success">KYC Verified!</h3>
                  <p className="text-muted">Your KYC has been approved. You can now create auctions.</p>
                  <button className="btn btn-primary mt-3" onClick={() => navigate('/create-auction')}>
                    <i className="fas fa-gavel me-2"></i>
                    Create Auction
                  </button>
                </div>
              ) : kycStatus === 'rejected' ? (
                <div className="alert alert-danger">
                  <h5><i className="fas fa-times-circle me-2"></i>KYC Rejected</h5>
                  <p>Your KYC verification was rejected. Please resubmit with correct documents.</p>
                </div>
              ) : null}

              {(kycStatus === 'pending' || kycStatus === 'rejected') && (
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Aadhaar Number */}
                    <div className="col-md-6 mb-4">
                      <label className="form-label">
                        <i className="fas fa-id-card me-2"></i>
                        Aadhaar Number *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="aadhaarNumber"
                        value={kycData.aadhaarNumber}
                        onChange={handleInputChange}
                        placeholder="Enter 12-digit Aadhaar number"
                        pattern="[0-9]{12}"
                        maxLength="12"
                        required
                        disabled={loading || kycStatus === 'submitted'}
                      />
                      <small className="form-text">12 digits without spaces</small>
                    </div>

                    {/* PAN Number */}
                    <div className="col-md-6 mb-4">
                      <label className="form-label">
                        <i className="fas fa-credit-card me-2"></i>
                        PAN Number *
                      </label>
                      <input
                        type="text"
                        className="form-control text-uppercase"
                        name="panNumber"
                        value={kycData.panNumber}
                        onChange={handleInputChange}
                        placeholder="Enter 10-character PAN number"
                        pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                        maxLength="10"
                        required
                        disabled={loading || kycStatus === 'submitted'}
                      />
                      <small className="form-text">Format: ABCDE1234F</small>
                    </div>

                    {/* Aadhaar Front */}
                    <div className="col-md-6 mb-4">
                      <label className="form-label">
                        <i className="fas fa-image me-2"></i>
                        Aadhaar Card (Front) *
                      </label>
                      <div className="file-upload-container">
                        {kycData.aadhaarFrontPreview && (
                          <div className="image-preview">
                            <img src={kycData.aadhaarFrontPreview} alt="Aadhaar Front" />
                          </div>
                        )}
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'aadhaarFront')}
                          required={!kycData.aadhaarFrontPreview}
                          disabled={loading || kycStatus === 'submitted'}
                        />
                      </div>
                    </div>

                    {/* Aadhaar Back */}
                    <div className="col-md-6 mb-4">
                      <label className="form-label">
                        <i className="fas fa-image me-2"></i>
                        Aadhaar Card (Back) *
                      </label>
                      <div className="file-upload-container">
                        {kycData.aadhaarBackPreview && (
                          <div className="image-preview">
                            <img src={kycData.aadhaarBackPreview} alt="Aadhaar Back" />
                          </div>
                        )}
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'aadhaarBack')}
                          required={!kycData.aadhaarBackPreview}
                          disabled={loading || kycStatus === 'submitted'}
                        />
                      </div>
                    </div>

                    {/* PAN Card */}
                    <div className="col-md-6 mb-4">
                      <label className="form-label">
                        <i className="fas fa-image me-2"></i>
                        PAN Card *
                      </label>
                      <div className="file-upload-container">
                        {kycData.panCardPreview && (
                          <div className="image-preview">
                            <img src={kycData.panCardPreview} alt="PAN Card" />
                          </div>
                        )}
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'panCard')}
                          required={!kycData.panCardPreview}
                          disabled={loading || kycStatus === 'submitted'}
                        />
                      </div>
                    </div>

                    {/* Selfie */}
                    <div className="col-md-6 mb-4">
                      <label className="form-label">
                        <i className="fas fa-camera me-2"></i>
                        Selfie with Aadhaar *
                      </label>
                      <div className="file-upload-container">
                        {kycData.selfiePreview && (
                          <div className="image-preview">
                            <img src={kycData.selfiePreview} alt="Selfie" />
                          </div>
                        )}
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'selfie')}
                          required={!kycData.selfiePreview}
                          disabled={loading || kycStatus === 'submitted'}
                        />
                      </div>
                      <small className="form-text">Hold your Aadhaar card near your face</small>
                    </div>
                  </div>

                  {kycStatus !== 'submitted' && (
                    <div className="d-grid mt-4">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Submitting KYC...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane me-2"></i>
                            Submit KYC for Verification
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="kyc-info mt-4">
                    <div className="alert alert-info">
                      <h6><i className="fas fa-info-circle me-2"></i>Important Information</h6>
                      <ul className="mb-0">
                        <li>All documents should be clear and readable</li>
                        <li>File size should not exceed 5MB per document</li>
                        <li>Supported formats: JPG, JPEG, PNG</li>
                        <li>KYC verification typically takes 24-48 hours</li>
                        <li>You can create auctions only after KYC approval</li>
                      </ul>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYCVerification;
