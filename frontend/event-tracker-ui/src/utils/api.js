/**
 * API utility functions for the Event Tracker application.
 * 
 * Provides centralized API configuration, authentication handling,
 * and HTTP request functions with proper error handling and token management.
 * 
 * Author: Generated for Mini Event Tracker
 * Created: September 16, 2025
 */

import axios from 'axios';

// API base URL - uses environment variable or defaults to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Token management
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Get stored access token
 */
export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);

/**
 * Get stored refresh token
 */
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

/**
 * Store authentication tokens
 */
export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * Clear stored authentication tokens
 */
export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => !!getAccessToken();

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh and error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token is expired and we have a refresh token, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          setTokens(access, refreshToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          clearTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        clearTokens();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  /**
   * Register a new user
   */
  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    const { access, refresh, user } = response.data;
    setTokens(access, refresh);
    return { user, tokens: { access, refresh } };
  },

  /**
   * Login user
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login/', credentials);
    const { access, refresh, user } = response.data;
    setTokens(access, refresh);
    return { user, tokens: { access, refresh } };
  },

  /**
   * Logout user
   */
  logout: () => {
    clearTokens();
  },

  /**
   * Get current user profile
   */
  getProfile: () => api.get('/auth/profile/'),
};

// Events API calls
export const eventsAPI = {
  /**
   * Get all events for current user
   */
  getEvents: (params = {}) => api.get('/events/', { params }),

  /**
   * Get upcoming events
   */
  getUpcomingEvents: () => api.get('/events/upcoming/'),

  /**
   * Get past events
   */
  getPastEvents: () => api.get('/events/past/'),

  /**
   * Get single event by ID
   */
  getEvent: (id) => api.get(`/events/${id}/`),

  /**
   * Create new event
   */
  createEvent: (eventData) => api.post('/events/', eventData),

  /**
   * Update event
   */
  updateEvent: (id, eventData) => api.patch(`/events/${id}/`, eventData),

  /**
   * Delete event
   */
  deleteEvent: (id) => api.delete(`/events/${id}/`),

  /**
   * Generate share link for event
   */
  generateShareLink: (id) => api.post(`/events/${id}/generate_share_link/`),

  /**
   * Get public event by share ID
   */
  getPublicEvent: (shareId) => api.get(`/public/events/${shareId}/`),
};

// Dashboard API calls
export const dashboardAPI = {
  /**
   * Get dashboard statistics
   */
  getStats: () => api.get('/dashboard/stats/'),
};

// Health check
export const healthCheck = () => api.get('/health/');

// Export configured axios instance for custom requests
export default api;