// Authentication context - manages user login state across the app
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, isAuthenticated, clearTokens } from '../utils/api';
import toast from 'react-hot-toast';

// Create the auth context
const AuthContext = createContext(null);

// Hook to access auth state from any component
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Main auth provider component
export default function AuthProvider({ children }) {
  // Track current user and loading state
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in when app starts
  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticated()) {
        try {
          // Get user info from backend
          const response = await authAPI.getProfile();
          setUser(response.data);
        } catch (error) {
          // Token might be expired, clear it
          console.error('Failed to load user profile:', error);
          clearTokens();
        }
      }
      // Done checking, stop loading
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Handle user login
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const { user } = await authAPI.login(credentials);
      setUser(user);
      // Show welcome message
      toast.success(`Welcome back, ${user.first_name}!`);
      return { success: true };
    } catch (error) {
      // Extract error message from API response
      const message = error?.response?.data?.message || 
                     error?.response?.data?.non_field_errors?.[0] ||
                     'Login failed. Please check your credentials.';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = async (userData) => {
    try {
      setIsLoading(true);
      const { user } = await authAPI.register(userData);
      setUser(user);
      toast.success(`Welcome to Event Tracker, ${user.first_name}!`);
      return { success: true };
    } catch (error) {
      const errors = error?.response?.data;
      let message = 'Registration failed. Please try again.';
      
      if (errors) {
        // Handle field-specific errors
        if (errors.email) {
          message = Array.isArray(errors.email) ? errors.email[0] : errors.email;
        } else if (errors.password) {
          message = Array.isArray(errors.password) ? errors.password[0] : errors.password;
        } else if (errors.password_confirm) {
          message = Array.isArray(errors.password_confirm) ? errors.password_confirm[0] : errors.password_confirm;
        } else if (errors.non_field_errors) {
          message = Array.isArray(errors.non_field_errors) ? errors.non_field_errors[0] : errors.non_field_errors;
        }
      }
      
      toast.error(message);
      return { success: false, error: message, errors };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    authAPI.logout();
    setUser(null);
    toast.success('Logged out successfully');
  };

  /**
   * Update user profile data
   */
  const updateUser = (userData) => {
    setUser(userData);
  };

  const contextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}