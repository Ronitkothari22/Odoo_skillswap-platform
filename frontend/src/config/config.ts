/// <reference types="vite/client" />

// Environment Configuration
export const config = {
  // Backend API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  
  // Google OAuth Configuration
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '454746507967-rn4nqinp2ndfo63m0p3i0sk9i7f4kmsq.apps.googleusercontent.com',
  
  // Frontend Configuration
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000',
};

// Construct API URLs from base URL
const API_AUTH_URL = `${config.API_BASE_URL}/api/auth`;
const API_PROFILE_URL = `${config.API_BASE_URL}/api/profile`;

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
  PROFILE: {
    GET: `${API_PROFILE_URL}`,
    UPDATE: `${API_PROFILE_URL}`,
    SKILLS: {
      ALL: `${API_PROFILE_URL}/skills/all`,
      ADD_UPDATE: `${API_PROFILE_URL}/skills`,
      REMOVE: `${API_PROFILE_URL}/skills`, // :skillId will be appended
    },
    DESIRED_SKILLS: {
      ADD_UPDATE: `${API_PROFILE_URL}/desired-skills`,
      REMOVE: `${API_PROFILE_URL}/desired-skills`, // :skillId will be appended
    },
    AVAILABILITY: {
      ADD_UPDATE: `${API_PROFILE_URL}/availability`,
      REMOVE: `${API_PROFILE_URL}/availability`, // :slotId will be appended
    },
  },
}; 
