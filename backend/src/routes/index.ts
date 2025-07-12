import { Router, Request, Response } from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';
import discoveryRoutes from './discovery.routes';
import publicDiscoveryRoutes from './public-discovery.routes';
import matchingRoutes from './matching.routes';
import swapRoutes from './swap.routes';
import feedbackRoutes from './feedback.routes';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  return res.json({ 
    message: 'Welcome to Skill Swap Platform API',
    version: '1.0.0',
    features: {
      authentication: 'Available',
      profiles: 'Available',
      skillDiscovery: 'Available',
      publicSkillDiscovery: 'Available (No Auth Required)',
      intelligentMatching: 'Available',
      swapRequests: 'Available',
      feedbackSystem: 'Available'
    }
  });
});

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/discovery', discoveryRoutes);
router.use('/public/discovery', publicDiscoveryRoutes);
router.use('/matching', matchingRoutes);
router.use('/swaps', swapRoutes);
router.use('/feedback', feedbackRoutes);

export default router; 