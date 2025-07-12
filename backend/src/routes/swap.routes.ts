import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createSwapRequest,
  getSwapRequests,
  getSwapRequestById,
  updateSwapRequest,
  deleteSwapRequest,
  getSwapRequestStats,
  getReceivedSwapRequests,
  getSentSwapRequests,
  acceptSwapRequest,
  rejectSwapRequest
} from '../controllers/swapRequest.controller';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   POST /api/swaps
 * @desc    Create a new swap request
 * @access  Private
 * @body    { responder_id, give_skill_id, take_skill_id, message? }
 */
router.post('/', createSwapRequest);

/**
 * @route   GET /api/swaps
 * @desc    Get all swap requests for the current user
 * @access  Private
 * @query   status?, skill_id?, date_from?, date_to?, page?, limit?
 */
router.get('/', getSwapRequests);

/**
 * @route   GET /api/swaps/stats
 * @desc    Get swap request statistics for the current user
 * @access  Private
 */
router.get('/stats', getSwapRequestStats);

/**
 * @route   GET /api/swaps/received
 * @desc    Get pending swap requests received by the current user
 * @access  Private
 * @query   page?, limit?
 */
router.get('/received', getReceivedSwapRequests);

/**
 * @route   GET /api/swaps/sent
 * @desc    Get swap requests sent by the current user
 * @access  Private
 * @query   page?, limit?, status?
 */
router.get('/sent', getSentSwapRequests);

/**
 * @route   GET /api/swaps/:id
 * @desc    Get a specific swap request by ID
 * @access  Private
 * @param   id - swap request ID
 */
router.get('/:id', getSwapRequestById);

/**
 * @route   PATCH /api/swaps/:id
 * @desc    Update swap request status (accept/reject/cancel)
 * @access  Private
 * @param   id - swap request ID
 * @body    { status, message? }
 */
router.patch('/:id', updateSwapRequest);

/**
 * @route   DELETE /api/swaps/:id
 * @desc    Delete/withdraw a swap request
 * @access  Private
 * @param   id - swap request ID
 */
router.delete('/:id', deleteSwapRequest);

/**
 * @route   POST /api/swaps/:id/accept
 * @desc    Accept a swap request
 * @access  Private
 * @param   id - swap request ID
 * @body    { message? }
 */
router.post('/:id/accept', acceptSwapRequest);

/**
 * @route   POST /api/swaps/:id/reject
 * @desc    Reject/Cancel a swap request
 * @access  Private
 * @param   id - swap request ID
 * @body    { message? }
 */
router.post('/:id/reject', rejectSwapRequest);

export default router; 