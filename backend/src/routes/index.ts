import { Router, Request, Response } from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';
import discoveryRoutes from './discovery.routes';
import matchingRoutes from './matching.routes';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  return res.json({ 
    message: 'Welcome to Skill Swap Platform API',
    version: '1.0.0',
    features: {
      authentication: 'Available',
      profiles: 'Available',
      skillDiscovery: 'Available',
      intelligentMatching: 'Available'
    }
  });
});

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/discovery', discoveryRoutes);
router.use('/matching', matchingRoutes);

export default router; 