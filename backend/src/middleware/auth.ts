import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import '../config/env';

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error('SUPABASE_JWT_SECRET is not set in environment');
}

export interface AuthRequest extends Request {
  user?: { id: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Missing Authorization header' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Invalid Authorization header' });

  try {
    console.log('🔍 Debug Info:');
    console.log('Token received:', token.substring(0, 50) + '...');
    console.log('JWT Secret length:', JWT_SECRET.length);
    console.log('JWT Secret first 10 chars:', JWT_SECRET.substring(0, 10));
    
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    console.log('✅ Token decoded successfully');
    console.log('User ID from token:', decoded.sub);
    
    req.user = { id: decoded.sub as string };
    next();
  } catch (err) {
    console.error('❌ JWT Verification Error:', err);
    if (err instanceof jwt.JsonWebTokenError) {
      console.error('JWT Error type:', err.name);
      console.error('JWT Error message:', err.message);
    }
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return res.status(401).json({ 
      message: 'Invalid or expired token',
      debug: process.env.NODE_ENV === 'development' ? errorMessage : undefined 
    });
  }
}; 