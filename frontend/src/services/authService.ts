import { config, API_ENDPOINTS } from '../config/config';

// Types for API responses
export interface AuthResponse {
  success: boolean;
  message: string;
  session?: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  user?: {
    id: string;
    email: string;
    user_metadata?: {
      name?: string;
      avatar_url?: string;
    };
  };
  profile?: {
    id: string;
    name: string;
    location?: string;
    avatar_url?: string;
    visibility: boolean;
    rating_avg: number;
    created_at: string;
  };
  emailConfirmationRequired?: boolean;
}

export interface GoogleAuthResponse {
  success: boolean;
  message: string;
  url?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  location?: string;
  avatar_url?: string;
  visibility: boolean;
  rating_avg: number;
  created_at: string;
}

export interface ApiError {
  success: false;
  message: string;
}

class AuthService {
  private baseHeaders = {
    'Content-Type': 'application/json',
  };

  // Helper method to make authenticated requests
  private async makeAuthenticatedRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.baseHeaders,
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    const data = await response.json();
    
    // Handle token refresh if needed
    if (response.status === 401 && token) {
      const refreshed = await this.refreshToken();
      if (refreshed.success) {
        // Retry the original request with new token
        return this.makeAuthenticatedRequest(url, options);
      }
    }

    return data;
  }

  // 1. Email/Password Signup
  async signup(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.SIGNUP, {
        method: 'POST',
        headers: this.baseHeaders,
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();
      
      if (data.success && data.session) {
        this.storeTokens(data.session);
      }
      
      return data;
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        message: 'Network error occurred during signup',
      };
    }
  }

  // 2. Email/Password Login
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: this.baseHeaders,
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (data.success && data.session) {
        this.storeTokens(data.session);
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error occurred during login',
      };
    }
  }

  // 3. Google OAuth Login - Get OAuth URL
  async getGoogleAuthUrl(redirectTo?: string): Promise<GoogleAuthResponse> {
    try {
      // Make sure redirectTo is set to the correct callback URL
      const callbackUrl = redirectTo || `${config.FRONTEND_URL}/auth/callback`;
      console.log('Using callback URL:', callbackUrl);
      
      const url = new URL(API_ENDPOINTS.AUTH.GOOGLE);
      url.searchParams.append('redirectTo', callbackUrl);

      console.log('🔍 Auth Service - Making request to:', url.toString());
      console.log('🔍 Auth Service - API_ENDPOINTS.AUTH.GOOGLE:', API_ENDPOINTS.AUTH.GOOGLE);

      const response = await fetch(url.toString());
      console.log('🔍 Auth Service - Response status:', response.status);
      console.log('🔍 Auth Service - Response headers:', response.headers);
      
      const data = await response.json();
      console.log('🔍 Auth Service - Response data:', data);
      
      return data;
    } catch (error) {
      console.error('🚨 Auth Service - Google auth URL error:', error);
      return {
        success: false,
        message: 'Failed to get Google authentication URL',
      };
    }
  }

  // 4. OAuth Callback - Handle OAuth callback
  async handleOAuthCallback(code: string): Promise<AuthResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.CALLBACK, {
        method: 'POST',
        headers: this.baseHeaders,
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      
      if (data.success && data.session) {
        this.storeTokens(data.session);
      }
      
      return data;
    } catch (error) {
      console.error('OAuth callback error:', error);
      return {
        success: false,
        message: 'Network error occurred during OAuth callback',
      };
    }
  }

  // 5. Logout
  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeAuthenticatedRequest<{ success: boolean; message: string }>(
        API_ENDPOINTS.AUTH.LOGOUT,
        { method: 'POST' }
      );

      if (response.success) {
        this.clearTokens();
      }
      
      return response;
    } catch (error) {
      console.error('Logout error:', error);
      // Clear tokens anyway on logout
      this.clearTokens();
      return {
        success: false,
        message: 'Network error occurred during logout',
      };
    }
  }

  // 6. Refresh Session
  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        return {
          success: false,
          message: 'No refresh token available',
        };
      }

      const response = await fetch(API_ENDPOINTS.AUTH.REFRESH, {
        method: 'POST',
        headers: this.baseHeaders,
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await response.json();
      
      if (data.success && data.session) {
        this.storeTokens(data.session);
      } else {
        this.clearTokens();
      }
      
      return data;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearTokens();
      return {
        success: false,
        message: 'Network error occurred during token refresh',
      };
    }
  }

  // 7. Get Current User
  async getCurrentUser(): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    try {
      const response = await this.makeAuthenticatedRequest<{ success: boolean; user?: UserProfile; message?: string }>(
        API_ENDPOINTS.AUTH.ME
      );
      
      return response;
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        message: 'Network error occurred while fetching user profile',
      };
    }
  }

  // Token management methods
  private storeTokens(session: { access_token: string; refresh_token: string; expires_in: number }) {
    localStorage.setItem('access_token', session.access_token);
    localStorage.setItem('refresh_token', session.refresh_token);
    localStorage.setItem('token_expires_at', (Date.now() + session.expires_in * 1000).toString());
  }

  private clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires_at');
    localStorage.removeItem('user');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    const expiresAt = localStorage.getItem('token_expires_at');
    
    if (!token || !expiresAt) return false;
    
    return Date.now() < parseInt(expiresAt);
  }

  // Get stored token
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Initialize Google OAuth (for direct Google Sign-In)
  async initializeGoogleOAuth(): Promise<boolean> {
    try {
      // This would be used for direct Google Sign-In flow
      // For now, we'll use the backend OAuth flow
      return true;
    } catch (error) {
      console.error('Google OAuth initialization error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService; 
