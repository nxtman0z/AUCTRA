import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Verify token is still valid
        try {
          await apiService.getCurrentUser();
        } catch (error) {
          console.error('Token validation failed:', error);
          logout();
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Admin login with admin key
  const loginAdmin = async (adminKey) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔐 Attempting admin login...');
      const response = await apiService.adminLogin({ adminKey });

      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        console.log('✅ Admin login successful');
        return { success: true, user: response.data.user };
      } else {
        throw new Error(response.message || 'Admin login failed');
      }
    } catch (error) {
      console.error('❌ Admin login error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // User login with credentials
  const loginUser = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔐 Attempting user login...');
      const response = await apiService.login({ 
        login: email, 
        password
      });

      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        console.log('✅ User login successful');
        return { success: true, user: response.data.user };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ User login error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // User signup
  const signupUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      console.log('📝 Attempting user signup...');
      const response = await apiService.signup(userData);

      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        console.log('✅ User signup successful');
        return { success: true, user: response.data.user };
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (error) {
      console.error('❌ User signup error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setLoading(true);
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      setLoading(false);
    }
  };

  // Check if user is admin
  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  // Check if user is verified/active
  const isVerified = () => {
    return user && user.isActive !== false;
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    loginAdmin,
    loginUser,
    signupUser,
    logout,
    isAdmin,
    isVerified,
    clearError,
    ADMIN_KEY: "AUCTRA_ADMIN_2024" // For display purposes only
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;