import { Router } from 'express';
import { getUsers, createUser, getUserById } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getUsers);
router.post('/', createUser);
router.get('/:userId', authenticate, getUserById);

export default router; 