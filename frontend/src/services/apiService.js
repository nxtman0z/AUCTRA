// API Service for AUCTRA Backend Communication
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to make API requests
  async makeRequest(url, options = {}) {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      // Add auth token if available
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      console.log(`🚀 Making API request to: ${this.baseURL}${url}`);
      console.log('📦 Request config:', config);

      const response = await fetch(`${this.baseURL}${url}`, config);
      const data = await response.json();

      console.log('📥 Response status:', response.status);
      console.log('📥 Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('❌ API Request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async signup(userData) {
    try {
      console.log('📝 Signing up user:', { ...userData, password: '***' });
      const response = await this.makeRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      // Store token if signup successful
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response;
    } catch (error) {
      console.error('❌ Signup error:', error);
      throw error;
    }
  }

  async login(loginData) {
    try {
      console.log('🔐 Logging in user:', { ...loginData, password: '***' });
      const response = await this.makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginData),
      });

      // Store token if login successful
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  async adminLogin(adminData) {
    try {
      console.log('👑 Admin login attempt');
      const response = await this.makeRequest('/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify(adminData),
      });

      // Store token if login successful
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response;
    } catch (error) {
      console.error('❌ Admin login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      console.log('👋 Logging out user');
      const response = await this.makeRequest('/auth/logout', {
        method: 'POST',
      });

      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      return response;
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Clear local storage even if API fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      console.log('👤 Getting current user');
      const response = await this.makeRequest('/auth/me');
      return response;
    } catch (error) {
      console.error('❌ Get current user error:', error);
      throw error;
    }
  }

  // User management endpoints
  async getUserProfile() {
    try {
      console.log('👤 Getting user profile');
      const response = await this.makeRequest('/users/profile');
      return response;
    } catch (error) {
      console.error('❌ Get profile error:', error);
      throw error;
    }
  }

  async updateUserProfile(profileData) {
    try {
      console.log('📝 Updating user profile');
      const response = await this.makeRequest('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      return response;
    } catch (error) {
      console.error('❌ Update profile error:', error);
      throw error;
    }
  }

  async changePassword(passwordData) {
    try {
      console.log('🔑 Changing password');
      const response = await this.makeRequest('/users/change-password', {
        method: 'PUT',
        body: JSON.stringify(passwordData),
      });
      return response;
    } catch (error) {
      console.error('❌ Change password error:', error);
      throw error;
    }
  }

  // Admin endpoints
  async getAllUsers(page = 1, limit = 10) {
    try {
      console.log('👥 Getting all users (Admin)');
      const response = await this.makeRequest(`/users?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      console.error('❌ Get all users error:', error);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      console.log(`👤 Getting user by ID: ${userId}`);
      const response = await this.makeRequest(`/users/${userId}`);
      return response;
    } catch (error) {
      console.error('❌ Get user by ID error:', error);
      throw error;
    }
  }

  async deactivateUser(userId) {
    try {
      console.log(`🚫 Deactivating user: ${userId}`);
      const response = await this.makeRequest(`/users/${userId}/deactivate`, {
        method: 'PUT',
      });
      return response;
    } catch (error) {
      console.error('❌ Deactivate user error:', error);
      throw error;
    }
  }

  async activateUser(userId) {
    try {
      console.log(`✅ Activating user: ${userId}`);
      const response = await this.makeRequest(`/users/${userId}/activate`, {
        method: 'PUT',
      });
      return response;
    } catch (error) {
      console.error('❌ Activate user error:', error);
      throw error;
    }
  }

  // Health check
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      throw error;
    }
  }

  // Test connection
  async testConnection() {
    try {
      console.log('🔍 Testing backend connection...');
      const response = await this.checkHealth();
      console.log('✅ Backend connection successful:', response);
      return response;
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;