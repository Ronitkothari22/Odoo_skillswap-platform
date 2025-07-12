import { Request, Response } from 'express';
import supabase from '../config/supabaseClient';
import { AuthRequest } from '../middleware/auth';

// Email/Password Signup
export const signUp = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name is required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }

    // Create user profile in database
    const userId = data.user?.id;
    if (userId) {
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .insert({ 
          id: userId, 
          name: name,
          visibility: true 
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't fail the signup if profile creation fails
      }
    }

    // Check if email confirmation is required
    const hasSession = data.session !== null;
    const message = hasSession 
      ? 'Account created successfully! You are now logged in.'
      : 'Account created successfully. Please check your email to verify your account.';

    return res.status(201).json({ 
      success: true,
      message: message,
      session: data.session, 
      user: data.user,
      emailConfirmationRequired: !hasSession
    });

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error during signup' 
    });
  }
};

// Email/Password Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }

    // Get user profile
    const userId = data.user?.id;
    let userProfile = null;
    
    if (userId) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      userProfile = profile;
    }

    return res.json({ 
      success: true,
      message: 'Login successful',
      session: data.session, 
      user: data.user,
      profile: userProfile
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error during login' 
    });
  }
};

// Google OAuth Login
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { redirectTo } = req.query;
    
    console.log('Google OAuth request received');
    console.log('Redirect URL:', redirectTo || `${process.env.FRONTEND_URL}/auth/callback`);
    console.log('FRONTEND_URL from env:', process.env.FRONTEND_URL);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo as string || `${process.env.FRONTEND_URL}/auth/callback`
      }
    });

    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }

    return res.json({ 
      success: true,
      message: 'Google OAuth URL generated',
      url: data.url 
    });

  } catch (error) {
    console.error('Google OAuth error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error during Google OAuth' 
    });
  }
};

// Handle OAuth Callback (for Google)
export const handleOAuthCallback = async (req: Request, res: Response) => {
  try {
    console.log('OAuth callback received:', req.body);
    const { code } = req.body;
    
    if (!code) {
      console.error('No code provided in request body');
      return res.status(400).json({ 
        success: false, 
        message: 'Authorization code is required' 
      });
    }

    console.log('Exchanging code for session');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code as string);
    
    if (error) {
      console.error('Supabase exchange error:', error);
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }

    // Create user profile if it doesn't exist (for OAuth users)
    const userId = data.user?.id;
    const userName = data.user?.user_metadata?.name || data.user?.user_metadata?.full_name;
    
    if (userId) {
      // Check if user profile exists
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      // Create profile if it doesn't exist
      if (!existingProfile && userName) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({ 
            id: userId, 
            name: userName,
            avatar_url: data.user?.user_metadata?.avatar_url,
            visibility: true 
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }
    }

    return res.json({ 
      success: true,
      message: 'OAuth authentication successful',
      session: data.session, 
      user: data.user 
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error during OAuth callback' 
    });
  }
};

// Logout
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }

    return res.json({ 
      success: true,
      message: 'Logout successful' 
    });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error during logout' 
    });
  }
};

// Refresh Session
export const refreshSession = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Refresh token is required' 
      });
    }

    const { data, error } = await supabase.auth.refreshSession({ 
      refresh_token 
    });
    
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }

    return res.json({ 
      success: true,
      message: 'Session refreshed successfully',
      session: data.session 
    });

  } catch (error) {
    console.error('Session refresh error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error during session refresh' 
    });
  }
};

// Get Current User
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    // Get user profile
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(404).json({ 
        success: false, 
        message: 'User profile not found' 
      });
    }

    return res.json({ 
      success: true,
      user: profile 
    });

  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}; 
