# Authentication API Documentation

## Overview
This API provides authentication services using Supabase Auth with support for both email/password and Google OAuth authentication.

## Base URL
```
http://localhost:8080/api/auth
```

## Authentication Endpoints

### 1. Email/Password Signup
**POST** `/signup`

Creates a new user account with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response (201 Created) - Email Confirmation Disabled:**
```json
{
  "success": true,
  "message": "Account created successfully! You are now logged in.",
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "v1:abc123...",
    "expires_in": 3600
  },
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "user_metadata": {
      "name": "John Doe"
    }
  },
  "emailConfirmationRequired": false
}
```

**Response (201 Created) - Email Confirmation Enabled:**
```json
{
  "success": true,
  "message": "Account created successfully. Please check your email to verify your account.",
  "session": null,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "user_metadata": {
      "name": "John Doe"
    }
  },
  "emailConfirmationRequired": true
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Email and password are required"
}
```

### 2. Email/Password Login
**POST** `/login`

Authenticates a user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "v1:abc123...",
    "expires_in": 3600
  },
  "user": {
    "id": "user-uuid",
    "email": "user@example.com"
  },
  "profile": {
    "id": "user-uuid",
    "name": "John Doe",
    "location": null,
    "avatar_url": null,
    "visibility": true,
    "rating_avg": 0,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Google OAuth Login
**GET** `/google`

Initiates Google OAuth authentication flow.

**Query Parameters:**
- `redirectTo` (optional): Custom redirect URL after authentication

**Example:**
```
GET /api/auth/google?redirectTo=http://localhost:3000/dashboard
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Google OAuth URL generated",
  "url": "https://accounts.google.com/oauth/authorize?..."
}
```

### 4. OAuth Callback
**POST** `/callback`

Handles OAuth callback and exchanges authorization code for session.

**Request Body:**
```json
{
  "code": "authorization_code_from_oauth_provider"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OAuth authentication successful",
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "v1:abc123...",
    "expires_in": 3600
  },
  "user": {
    "id": "user-uuid",
    "email": "user@gmail.com",
    "user_metadata": {
      "name": "John Doe",
      "avatar_url": "https://lh3.googleusercontent.com/..."
    }
  }
}
```

### 5. Logout
**POST** `/logout`

Logs out the current user and invalidates their session.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### 6. Refresh Session
**POST** `/refresh`

Refreshes an expired access token using the refresh token.

**Request Body:**
```json
{
  "refresh_token": "v1:abc123..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Session refreshed successfully",
  "session": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "v1:def456...",
    "expires_in": 3600
  }
}
```

### 7. Get Current User
**GET** `/me`

Retrieves the current authenticated user's profile information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "location": "New York, NY",
    "avatar_url": "https://example.com/avatar.jpg",
    "visibility": true,
    "rating_avg": 4.5,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

## Error Handling

All endpoints follow a consistent error response format:

**4xx Client Errors:**
```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

**5xx Server Errors:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Authentication Flow

### Email/Password Flow
1. User signs up with `/signup` (gets session immediately since email confirmation is disabled)
2. Use the returned `access_token` for authenticated requests
3. Refresh token when needed with `/refresh`

### Google OAuth Flow
1. Frontend redirects user to `/google` endpoint
2. User completes OAuth flow with Google
3. Google redirects back to your app with authorization code
4. Your app sends the code to `/callback`
5. Use the returned `access_token` for authenticated requests

## Environment Variables Required

Make sure these environment variables are set in your `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:5173
```

## Frontend Integration Examples

### JavaScript/React Example

```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store tokens in localStorage or secure storage
    localStorage.setItem('access_token', data.session.access_token);
    localStorage.setItem('refresh_token', data.session.refresh_token);
  }
  
  return data;
};

// Make authenticated requests
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return response.json();
};

// Google OAuth
const loginWithGoogle = async () => {
  const response = await fetch('/api/auth/google');
  const data = await response.json();
  
  if (data.success) {
    // Redirect to Google OAuth
    window.location.href = data.url;
  }
};
```

## Testing with curl

```bash
# Signup
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get current user (replace TOKEN with actual token)
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## Supabase Configuration

To enable Google OAuth in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Settings
3. Enable Google provider
4. Add your Google OAuth credentials
5. Add your frontend URL to the redirect URLs
6. Make sure email confirmations are configured as needed 