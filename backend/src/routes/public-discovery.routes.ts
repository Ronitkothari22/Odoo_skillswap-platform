import { Router } from 'express';
import {
  publicSearchUsers,
  publicDiscoverUsers,
  publicGetUsersBySkill,
  publicGetPopularSkills,
  publicGetDiscoveryStats
} from '../controllers/discovery.controller';

const router = Router();

// No authentication middleware applied to these routes - they are public

/**
 * @route   GET /api/public/discovery/search
 * @desc    Search users by skills, location, and other criteria (Public)
 * @access  Public
 * @params  skills, location, minRating, availability, proficiencyLevel, page, limit, sortBy
 */
router.get('/search', publicSearchUsers);

/**
 * @route   GET /api/public/discovery/users
 * @desc    Get all users with basic discovery functionality (Public)
 * @access  Public
 * @params  page, limit, sortBy
 */
router.get('/users', publicDiscoverUsers);

/**
 * @route   GET /api/public/discovery/skills/:skillName/users
 * @desc    Get users who have a specific skill (Public)
 * @access  Public
 * @params  page, limit, minProficiency
 */
router.get('/skills/:skillName/users', publicGetUsersBySkill);

/**
 * @route   GET /api/public/discovery/skills/popular
 * @desc    Get popular skills with user counts (Public)
 * @access  Public
 * @params  limit
 */
router.get('/skills/popular', publicGetPopularSkills);

/**
 * @route   GET /api/public/discovery/stats
 * @desc    Get discovery statistics (Public)
 * @access  Public
 */
router.get('/stats', publicGetDiscoveryStats);

export default router; 