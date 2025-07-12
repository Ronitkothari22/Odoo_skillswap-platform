import { Router, Request, Response } from 'express';
import userRoutes from './user.routes';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  return res.json({ message: 'Welcome to Skill Swap Platform API' });
});

router.use('/users', userRoutes);

export default router; 