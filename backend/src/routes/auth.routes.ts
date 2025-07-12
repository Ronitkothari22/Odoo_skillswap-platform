import { Router } from 'express';
import { 
  signUp, 
  login, 
  googleAuth, 
  handleOAuthCallback, 
  logout, 
  refreshSession, 
  getCurrentUser 
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Email/Password Authentication
router.post('/signup', signUp);
router.post('/login', login);

// Google OAuth Authentication
router.get('/google', googleAuth);
router.post('/callback', handleOAuthCallback);

// Session Management
router.post('/logout', authenticate, logout);
router.post('/refresh', refreshSession);

// User Info
router.get('/me', authenticate, getCurrentUser);

export default router; 