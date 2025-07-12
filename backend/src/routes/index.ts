import { Router, Request, Response } from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  return res.json({ message: 'Welcome to Skill Swap Platform API' });
});

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);

export default router; 