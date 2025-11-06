import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './UserProfile.css';

const UserProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState({
    profilePicture: null,
    profilePicturePreview: '',
    fullName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [kycStatus, setKycStatus] = useState('pending'); // pending, submitted, approved, rejected

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Fetch user profile data
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile({
          ...profile,
          ...data.profile,
          profilePicturePreview: data.profile.profilePicture || ''
        });
        setKycStatus(data.kycStatus || 'pending');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }
      setProfile(prev => ({
        ...prev,
        profilePicture: file,
        profilePicturePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      if (profile.profilePicture) {
        formData.append('profilePicture', profile.profilePicture);
      }
      formData.append('fullName', profile.fullName);
      formData.append('phone', profile.phone);
      formData.append('address', profile.address);
      formData.append('city', profile.city);
      formData.append('state', profile.state);
      formData.append('pincode', profile.pincode);
      formData.append('country', profile.country);

      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Error updating profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyForAdmin = async () => {
    if (window.confirm('Are you sure you want to apply for admin role? Your profile will be reviewed by the admin team.')) {
      try {
        const response = await fetch('http://localhost:5000/api/users/apply-admin', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (response.ok) {
          alert('Admin role application submitted successfully! We will review your request.');
        } else {
          alert(data.message || 'Failed to submit application');
        }
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  return (
    <div className="user-profile-page">
      <div className="container py-5">
        <div className="row">
          <div className="col-lg-4 mb-4">
            {/* Profile Card */}
            <div className="profile-card">
              <div className="profile-picture-container">
                <div className="profile-picture">
                  {profile.profilePicturePreview ? (
                    <img src={profile.profilePicturePreview} alt="Profile" />
                  ) : (
                    <i className="fas fa-user"></i>
                  )}
                </div>
                <label htmlFor="profilePictureInput" className="change-picture-btn">
                  <i className="fas fa-camera"></i>
                </label>
                <input
                  type="file"
                  id="profilePictureInput"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
              
              <div className="profile-info">
                <h4>{profile.fullName || user?.username || 'User'}</h4>
                <p className="text-muted">{profile.email}</p>
                
                <div className="kyc-status-card">
                  <h6>KYC Status</h6>
                  <span className={`badge badge-${kycStatus}`}>
                    {kycStatus === 'approved' && <i className="fas fa-check-circle me-1"></i>}
                    {kycStatus === 'rejected' && <i className="fas fa-times-circle me-1"></i>}
                    {kycStatus === 'submitted' && <i className="fas fa-clock me-1"></i>}
                    {kycStatus === 'pending' && <i className="fas fa-exclamation-circle me-1"></i>}
                    {kycStatus.toUpperCase()}
                  </span>
                  {kycStatus === 'pending' && (
                    <p className="small text-warning mt-2">
                      <i className="fas fa-info-circle me-1"></i>
                      Complete KYC to create auctions
                    </p>
                  )}
                  {kycStatus === 'approved' && (
                    <p className="small text-success mt-2">
                      <i className="fas fa-check me-1"></i>
                      You can create auctions
                    </p>
                  )}
                  <button 
                    className="btn btn-outline-primary btn-sm mt-2 w-100"
                    onClick={() => navigate('/profile/kyc')}
                  >
                    <i className="fas fa-id-card me-2"></i>
                    {kycStatus === 'pending' ? 'Complete KYC' : 'View KYC Details'}
                  </button>
                </div>

                <button 
                  className="btn btn-gradient-admin w-100 mt-3"
                  onClick={handleApplyForAdmin}
                >
                  <i className="fas fa-user-shield me-2"></i>
                  Apply for Admin Role
                </button>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            {/* Profile Form */}
            <div className="profile-form-card">
              <h3 className="mb-4">
                <i className="fas fa-edit me-2"></i>
                Edit Profile
              </h3>

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

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="fas fa-user me-2"></i>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="fas fa-envelope me-2"></i>
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      value={profile.email}
                      disabled
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="fas fa-phone me-2"></i>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      value={profile.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter phone number"
                      pattern="[0-9]{10}"
                    />
                    <small className="form-text">10 digit mobile number</small>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="fas fa-map-pin me-2"></i>
                      Pincode *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="pincode"
                      value={profile.pincode}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter pincode"
                      pattern="[0-9]{6}"
                    />
                  </div>

                  <div className="col-12 mb-3">
                    <label className="form-label">
                      <i className="fas fa-home me-2"></i>
                      Address *
                    </label>
                    <textarea
                      className="form-control"
                      name="address"
                      value={profile.address}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      placeholder="Enter your address"
                    />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">
                      <i className="fas fa-city me-2"></i>
                      City *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="city"
                      value={profile.city}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter city"
                    />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">
                      <i className="fas fa-map-marked-alt me-2"></i>
                      State *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="state"
                      value={profile.state}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter state"
                    />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">
                      <i className="fas fa-globe me-2"></i>
                      Country
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="country"
                      value={profile.country}
                      onChange={handleInputChange}
                      disabled
                    />
                  </div>
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Save Profile
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

export default UserProfile;
