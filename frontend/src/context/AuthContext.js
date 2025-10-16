import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Admin key for admin login (in production, this would be more secure)
  const ADMIN_KEY = "AUCTRA_ADMIN_2024";

  // Check for existing session on load
  useEffect(() => {
    const storedUser = localStorage.getItem('auctra_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('auctra_user');
      }
    }
    setLoading(false);
  }, []);

  // Admin login with admin key
  const loginAdmin = async (adminKey, walletAddress) => {
    try {
      setLoading(true);
      
      if (adminKey !== ADMIN_KEY) {
        throw new Error('Invalid admin key');
      }

      if (!walletAddress) {
        throw new Error('Wallet address is required');
      }

      const adminUser = {
        id: 'admin_' + Date.now(),
        walletAddress: walletAddress,
        role: 'admin',
        email: 'admin@auctra.com',
        isVerified: true,
        loginTime: new Date().toISOString()
      };

      setUser(adminUser);
      setIsAuthenticated(true);
      localStorage.setItem('auctra_user', JSON.stringify(adminUser));
      
      return { success: true, user: adminUser };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // User login with credentials
  const loginUser = async (email, password, walletAddress) => {
    try {
      setLoading(true);
      
      // Basic validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (!walletAddress) {
        throw new Error('Please connect your wallet first');
      }

      // In a real app, this would validate against backend
      // For now, we'll create a mock user
      const regularUser = {
        id: 'user_' + Date.now(),
        email: email,
        walletAddress: walletAddress,
        role: 'user',
        isVerified: true,
        loginTime: new Date().toISOString()
      };

      setUser(regularUser);
      setIsAuthenticated(true);
      localStorage.setItem('auctra_user', JSON.stringify(regularUser));
      
      return { success: true, user: regularUser };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // User signup
  const signupUser = async (userData) => {
    try {
      setLoading(true);
      
      const { email, password, confirmPassword, walletAddress } = userData;

      // Basic validation
      if (!email || !password || !confirmPassword) {
        throw new Error('All fields are required');
      }

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (!walletAddress) {
        throw new Error('Please connect your wallet first');
      }

      // In a real app, this would register with backend
      const newUser = {
        id: 'user_' + Date.now(),
        email: email,
        walletAddress: walletAddress,
        role: 'user',
        isVerified: false, // Would be verified via email
        signupTime: new Date().toISOString()
      };

      return { success: true, message: 'Registration successful! Please contact admin for verification.' };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auctra_user');
  };

  // Check if user is admin
  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  // Check if user is verified
  const isVerified = () => {
    return user && user.isVerified;
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    loginAdmin,
    loginUser,
    signupUser,
    logout,
    isAdmin,
    isVerified,
    ADMIN_KEY // For display purposes only
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;