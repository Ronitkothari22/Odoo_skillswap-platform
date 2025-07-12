import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createFeedback,
  getUserFeedbackSummary,
  getUserFeedbackStats,
  getUserFeedback,
  getMyFeedback,
  getFeedbackById,
  recalculateUserRating
} from '../controllers/feedback.controller';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   POST /api/feedback
 * @desc    Create new feedback for a completed swap
 * @access  Private
 * @body    { swap_id, stars, comment? }
 */
router.post('/', createFeedback);

/**
 * @route   GET /api/feedback/stats
 * @desc    Get feedback statistics for the current user
 * @access  Private
 */
router.get('/stats', getUserFeedbackStats);

/**
 * @route   GET /api/feedback/me
 * @desc    Get feedback received by the current user
 * @access  Private
 * @query   stars?, date_from?, date_to?, skill_id?, page?, limit?
 */
router.get('/me', getMyFeedback);

/**
 * @route   GET /api/feedback/details/:feedbackId
 * @desc    Get specific feedback by ID
 * @access  Private
 * @param   feedbackId - feedback ID
 */
router.get('/details/:feedbackId', getFeedbackById);

/**
 * @route   GET /api/feedback/user/:userId
 * @desc    Get feedback for a specific user with filtering and pagination
 * @access  Private
 * @param   userId - user ID
 * @query   stars?, date_from?, date_to?, skill_id?, page?, limit?
 */
router.get('/user/:userId', getUserFeedback);

/**
 * @route   GET /api/feedback/:userId
 * @desc    Get feedback summary for a specific user (includes rating breakdown)
 * @access  Private
 * @param   userId - user ID
 * @query   limit? - number of recent feedback items to include
 */
router.get('/:userId', getUserFeedbackSummary);

/**
 * @route   POST /api/feedback/recalculate/:userId
 * @desc    Recalculate user's average rating (admin function)
 * @access  Private
 * @param   userId - user ID
 */
router.post('/recalculate/:userId', recalculateUserRating);

export default router; 