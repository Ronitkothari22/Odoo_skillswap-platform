import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { SwapRequestService } from '../services/swapRequestService';
import { SwapStatus, CreateSwapRequestDto, UpdateSwapRequestDto } from '../types/swap';

const swapRequestService = new SwapRequestService();

/**
 * Create a new swap request
 * POST /api/swaps
 */
export const createSwapRequest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { responder_id, give_skill_id, take_skill_id, message } = req.body;

    if (!responder_id || !give_skill_id || !take_skill_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: responder_id, give_skill_id, take_skill_id' 
      });
    }

    const createSwapData: CreateSwapRequestDto = {
      responder_id,
      give_skill_id,
      take_skill_id,
      message
    };

    // Extract the user token from Authorization header
    const authHeader = req.headers['authorization'];
    const userToken = authHeader ? authHeader.split(' ')[1] : undefined;

    const result = await swapRequestService.createSwapRequest(userId, createSwapData, userToken);

    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: result.error || 'Failed to create swap request' 
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Swap request created successfully',
      data: result.swap
    });

  } catch (error) {
    console.error('Error creating swap request:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Get all swap requests for the current user
 * GET /api/swaps
 */
export const getSwapRequests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { 
      status, 
      skill_id, 
      date_from, 
      date_to,
      page = 1,
      limit = 20
    } = req.query;

    const filters = {
      status: status as SwapStatus,
      skill_id: skill_id as string,
      date_from: date_from as string,
      date_to: date_to as string
    };

    const result = await swapRequestService.getSwapRequestsForUser(
      userId, 
      filters, 
      parseInt(page as string), 
      parseInt(limit as string)
    );

    return res.json({
      success: true,
      data: result,
      message: 'Swap requests retrieved successfully'
    });

  } catch (error) {
    console.error('Error getting swap requests:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Get a specific swap request by ID
 * GET /api/swaps/:id
 */
export const getSwapRequestById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Swap request ID is required' 
      });
    }

    const swap = await swapRequestService.getSwapRequestById(id);
    if (!swap) {
      return res.status(404).json({ 
        success: false, 
        message: 'Swap request not found' 
      });
    }

    // Check if user is authorized to view this swap
    if (swap.requester_id !== userId && swap.responder_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to view this swap request' 
      });
    }

    return res.json({
      success: true,
      data: swap,
      message: 'Swap request retrieved successfully'
    });

  } catch (error) {
    console.error('Error getting swap request:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Update swap request status (accept/reject/cancel)
 * PATCH /api/swaps/:id
 */
export const updateSwapRequest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    const { status, message } = req.body;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Swap request ID is required' 
      });
    }

    if (!status || !Object.values(SwapStatus).includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid status is required (pending, accepted, cancelled)' 
      });
    }

    const updateData: UpdateSwapRequestDto = {
      status,
      message
    };

    // Extract the user token from Authorization header
    const authHeader = req.headers['authorization'];
    const userToken = authHeader ? authHeader.split(' ')[1] : undefined;

    const result = await swapRequestService.updateSwapRequest(id, userId, updateData, userToken);

    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: result.error || 'Failed to update swap request' 
      });
    }

    return res.json({
      success: true,
      data: result.swap,
      message: 'Swap request updated successfully'
    });

  } catch (error) {
    console.error('Error updating swap request:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Delete/withdraw a swap request
 * DELETE /api/swaps/:id
 */
export const deleteSwapRequest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Swap request ID is required' 
      });
    }

    const result = await swapRequestService.deleteSwapRequest(id, userId);

    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: result.error || 'Failed to delete swap request' 
      });
    }

    return res.json({
      success: true,
      message: 'Swap request deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting swap request:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Get swap request statistics for the current user
 * GET /api/swaps/stats
 */
export const getSwapRequestStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const stats = await swapRequestService.getSwapRequestStats(userId);

    return res.json({
      success: true,
      data: stats,
      message: 'Swap request statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Error getting swap request stats:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Get pending swap requests received by the current user
 * GET /api/swaps/received
 */
export const getReceivedSwapRequests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { page = 1, limit = 20 } = req.query;

    const result = await swapRequestService.getSwapRequestsForUser(
      userId, 
      { status: SwapStatus.PENDING }, 
      parseInt(page as string), 
      parseInt(limit as string)
    );

    // Filter to only received requests (where current user is responder)
    const receivedSwaps = result.swaps.filter(swap => swap.responder_id === userId);

    return res.json({
      success: true,
      data: {
        ...result,
        swaps: receivedSwaps,
        totalCount: receivedSwaps.length
      },
      message: 'Received swap requests retrieved successfully'
    });

  } catch (error) {
    console.error('Error getting received swap requests:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Get sent swap requests by the current user
 * GET /api/swaps/sent
 */
export const getSentSwapRequests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { page = 1, limit = 20, status } = req.query;

    const filters = status ? { status: status as SwapStatus } : {};

    const result = await swapRequestService.getSwapRequestsForUser(
      userId, 
      filters, 
      parseInt(page as string), 
      parseInt(limit as string)
    );

    // Filter to only sent requests (where current user is requester)
    const sentSwaps = result.swaps.filter(swap => swap.requester_id === userId);

    return res.json({
      success: true,
      data: {
        ...result,
        swaps: sentSwaps,
        totalCount: sentSwaps.length
      },
      message: 'Sent swap requests retrieved successfully'
    });

  } catch (error) {
    console.error('Error getting sent swap requests:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Accept a swap request
 * POST /api/swaps/:id/accept
 */
export const acceptSwapRequest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    const { message } = req.body;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Swap request ID is required' 
      });
    }

    const updateData: UpdateSwapRequestDto = {
      status: SwapStatus.ACCEPTED,
      message
    };

    // Extract the user token from Authorization header
    const authHeader = req.headers['authorization'];
    const userToken = authHeader ? authHeader.split(' ')[1] : undefined;

    const result = await swapRequestService.updateSwapRequest(id, userId, updateData, userToken);

    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: result.error || 'Failed to accept swap request' 
      });
    }

    return res.json({
      success: true,
      data: result.swap,
      message: 'Swap request accepted successfully'
    });

  } catch (error) {
    console.error('Error accepting swap request:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Reject/Cancel a swap request
 * POST /api/swaps/:id/reject
 */
export const rejectSwapRequest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    const { message } = req.body;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Swap request ID is required' 
      });
    }

    const updateData: UpdateSwapRequestDto = {
      status: SwapStatus.CANCELLED,
      message
    };

    // Extract the user token from Authorization header
    const authHeader = req.headers['authorization'];
    const userToken = authHeader ? authHeader.split(' ')[1] : undefined;

    const result = await swapRequestService.updateSwapRequest(id, userId, updateData, userToken);

    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: result.error || 'Failed to reject swap request' 
      });
    }

    return res.json({
      success: true,
      data: result.swap,
      message: 'Swap request rejected successfully'
    });

  } catch (error) {
    console.error('Error rejecting swap request:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}; 