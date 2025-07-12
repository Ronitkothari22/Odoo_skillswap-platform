import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getMatches,
  getMatchAnalysis,
  getSkillRecommendations,
  getSkillRequesters,
  getSkillTeachers,
  getPerfectMatches,
  getMatchingStats
} from '../controllers/matching.controller';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   GET /api/matching/matches
 * @desc    Get intelligent matches for the current user
 * @access  Private
 * @params  page, limit, sortBy, includeMatchScore, minCompatibility
 */
router.get('/matches', getMatches);

/**
 * @route   GET /api/matching/analysis/:targetUserId
 * @desc    Get detailed match analysis for a specific user
 * @access  Private
 * @params  targetUserId (path parameter)
 */
router.get('/analysis/:targetUserId', getMatchAnalysis);

/**
 * @route   GET /api/matching/recommendations/skills
 * @desc    Get skill-based recommendations
 * @access  Private
 * @params  limit
 */
router.get('/recommendations/skills', getSkillRecommendations);

/**
 * @route   GET /api/matching/requesters
 * @desc    Get users who want to learn what the current user can teach
 * @access  Private
 * @params  page, limit
 */
router.get('/requesters', getSkillRequesters);

/**
 * @route   GET /api/matching/teachers
 * @desc    Get users who can teach what the current user wants to learn
 * @access  Private
 * @params  page, limit, minProficiency
 */
router.get('/teachers', getSkillTeachers);

/**
 * @route   GET /api/matching/perfect
 * @desc    Get perfect matches (users with mutual skill exchange potential)
 * @access  Private
 * @params  page, limit
 */
router.get('/perfect', getPerfectMatches);

/**
 * @route   GET /api/matching/stats
 * @desc    Get matching statistics for the current user
 * @access  Private
 */
router.get('/stats', getMatchingStats);

export default router; 