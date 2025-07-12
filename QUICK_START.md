# 🚀 Quick Start Guide - Authentication System

## Prerequisites

- Node.js (v16 or higher)
- Supabase account and project
- Google Cloud Console account (for OAuth)

## 1. Environment Setup

1. **Copy the environment template:**
   ```bash
   cd backend
   cp env.template .env
   ```

2. **Fill in your Supabase credentials in `.env`:**
   ```env
   PORT=8080
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   
   # Get these from your Supabase project settings
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_JWT_SECRET=your-jwt-secret
   ```

## 2. Database Setup

1. **Apply the database migrations:**
   ```bash
   # If using Supabase CLI
   supabase db push
   
   # Or manually run the SQL files in Supabase dashboard:
   # - backend/supabase/migrations/0001_init.sql
   # - backend/supabase/migrations/0002_auth_policies.sql
   ```

## 3. Google OAuth Setup (Optional)

1. **Go to Google Cloud Console:**
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials

2. **Configure OAuth in Supabase:**
   - Go to Authentication > Settings > Auth Providers
   - Enable Google provider
   - Add your Google Client ID and Secret
   - Add redirect URLs:
     - `https://your-project.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for development)

## 4. Install Dependencies & Run

1. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Start the backend server:**
   ```bash
   npm run dev
   ```

3. **Install frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Start the frontend:**
   ```bash
   npm run dev
   ```

## 5. Test the Authentication System

1. **Run the test script:**
   ```bash
   cd backend
   node test-auth.js
   ```

2. **Test endpoints manually:**
   ```bash
   # Test signup
   curl -X POST http://localhost:8080/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
   
   # Test login
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

## 6. Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Email/password signup |
| POST | `/api/auth/login` | Email/password login |
| GET | `/api/auth/google` | Google OAuth URL |
| POST | `/api/auth/callback` | OAuth callback |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/refresh` | Refresh session |
| GET | `/api/auth/me` | Get current user |

## 7. Frontend Integration

Here's a simple React example to get you started:

```jsx
// src/hooks/useAuth.js
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.session.access_token);
      setUser(data.user);
    }
    
    return data;
  };

  const signup = async (email, password, name) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    
    return response.json();
  };

  const logout = async () => {
    const token = localStorage.getItem('token');
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    localStorage.removeItem('token');
    setUser(null);
  };

  const loginWithGoogle = async () => {
    const response = await fetch('/api/auth/google');
    const data = await response.json();
    
    if (data.success) {
      window.location.href = data.url;
    }
  };

  return { user, login, signup, logout, loginWithGoogle, loading };
};
```

## 8. Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables"**
   - Make sure your `.env` file is properly configured
   - Check that all required environment variables are set

2. **"Invalid JWT token"**
   - Ensure `SUPABASE_JWT_SECRET` matches your Supabase project
   - Check that the token is being sent in the Authorization header

3. **Google OAuth not working**
   - Verify Google OAuth is enabled in Supabase
   - Check redirect URLs match between Google Console and Supabase
   - Ensure `FRONTEND_URL` is set correctly

4. **Database errors**
   - Make sure migrations are applied
   - Check that RLS policies are in place
   - Verify Supabase connection is working

### Useful Commands:

```bash
# Check if server is running
curl http://localhost:8080/api

# View server logs
npm run dev

# Test specific endpoint
curl -X GET http://localhost:8080/api/auth/google
```

## 9. Next Steps

Now that authentication is working, you can:

1. Build the frontend login/signup forms
2. Implement user profile management
3. Add skill management APIs
4. Create the swap request system
5. Build the admin dashboard

## 📚 Documentation

- **API Documentation**: See `AUTH_API_DOCS.md`
- **Backend Tasks**: See `BACKEND_TASKS.md`
- **Project Overview**: See `README.md`

## 🎉 You're Ready!

Your authentication system is now set up with:
- ✅ Email/password authentication
- ✅ Google OAuth integration
- ✅ Secure JWT token handling
- ✅ Row-level security policies
- ✅ Comprehensive error handling
- ✅ User profile management

Start building your skill swap platform! 🚀 