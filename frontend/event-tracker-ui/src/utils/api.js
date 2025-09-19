// API utilities - handles all communication with the backend
import axios from 'axios';

// Backend API URL - can be overridden with environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Main API client with default settings
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Don't wait more than 10 seconds
});

// Token storage keys
const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Get the current access token from storage
export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);

// Get the refresh token from storage
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

// Save both tokens to localStorage
export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

// Remove all tokens (for logout)
export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Check if user has a valid token
export const isAuthenticated = () => !!getAccessToken();

// Automatically add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      // Add Bearer token to request headers
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
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken })
          });
          const response = { data: await refreshResponse.json() };
          
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
  updateEvent: (id, eventData) => api.put(`/events/${id}/`, eventData),

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
export { api };
export default api;