import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  searchUsers,
  discoverUsers,
  getUsersBySkill,
  getPopularSkills,
  getDiscoveryStats
} from '../controllers/discovery.controller';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   GET /api/discovery/search
 * @desc    Search users by skills, location, and other criteria
 * @access  Private
 * @params  skills, location, minRating, availability, proficiencyLevel, page, limit, sortBy
 */
router.get('/search', searchUsers);

/**
 * @route   GET /api/discovery/users
 * @desc    Get all users with basic discovery functionality
 * @access  Private
 * @params  page, limit, sortBy, excludeViewed
 */
router.get('/users', discoverUsers);

/**
 * @route   GET /api/discovery/skills/:skillName/users
 * @desc    Get users who have a specific skill
 * @access  Private
 * @params  page, limit, minProficiency
 */
router.get('/skills/:skillName/users', getUsersBySkill);

/**
 * @route   GET /api/discovery/skills/popular
 * @desc    Get popular skills with user counts
 * @access  Private
 * @params  limit
 */
router.get('/skills/popular', getPopularSkills);

/**
 * @route   GET /api/discovery/stats
 * @desc    Get discovery statistics
 * @access  Private
 */
router.get('/stats', getDiscoveryStats);

export default router; 