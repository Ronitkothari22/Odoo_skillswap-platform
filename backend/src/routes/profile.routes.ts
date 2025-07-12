import { Router } from 'express';
import { 
  getProfile, 
  updateProfile, 
  addOrUpdateSkills, 
  addOrUpdateDesiredSkills, 
  addOrUpdateAvailability,
  removeSkill,
  removeDesiredSkill,
  removeAvailabilitySlot,
  getAllSkills
} from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Profile management
router.get('/', authenticate, getProfile);
router.patch('/', authenticate, updateProfile);

// Skills management
router.post('/skills', authenticate, addOrUpdateSkills);
router.delete('/skills/:skillId', authenticate, removeSkill);

// Desired skills management
router.post('/desired-skills', authenticate, addOrUpdateDesiredSkills);
router.delete('/desired-skills/:skillId', authenticate, removeDesiredSkill);

// Availability management
router.post('/availability', authenticate, addOrUpdateAvailability);
router.delete('/availability/:slotId', authenticate, removeAvailabilitySlot);

// Utility routes
router.get('/skills/all', authenticate, getAllSkills);

export default router; 