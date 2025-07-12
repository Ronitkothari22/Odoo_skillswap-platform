/// <reference types="vite/client" />

// Environment Configuration
export const config = {
  // Backend API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  
  // Google OAuth Configuration
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '454746507967-m4nqinp2ndfo63m0p3i0sk9i7f4kmsq.apps.googleusercontent.com',
  
  // Ensure this matches your authorized JavaScript origin
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000',
};

// Construct auth URL from base URL
const API_AUTH_URL = `${config.API_BASE_URL}/api/auth`;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: `${API_AUTH_URL}/signup`,
    LOGIN: `${API_AUTH_URL}/login`,
    LOGOUT: `${API_AUTH_URL}/logout`,
    REFRESH: `${API_AUTH_URL}/refresh`,
    ME: `${API_AUTH_URL}/me`,
    GOOGLE: `${API_AUTH_URL}/google`,
    CALLBACK: `${API_AUTH_URL}/callback`,
  },
}; 
