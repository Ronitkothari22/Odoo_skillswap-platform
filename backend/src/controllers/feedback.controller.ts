import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { FeedbackService } from '../services/feedbackService';
import { CreateFeedbackDto, FeedbackFilters } from '../types/feedback';

const feedbackService = new FeedbackService();

/**
 * Create new feedback for a completed swap
 * POST /api/feedback
 */
export const createFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { swap_id, stars, comment } = req.body;

    if (!swap_id || !stars) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: swap_id, stars' 
      });
    }

    if (stars < 1 || stars > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Stars rating must be between 1 and 5' 
      });
    }

    const createFeedbackData: CreateFeedbackDto = {
      swap_id,
      stars,
      comment
    };

    // Extract the user token from Authorization header
    const authHeader = req.headers['authorization'];
    const userToken = authHeader ? authHeader.split(' ')[1] : undefined;

    const result = await feedbackService.createFeedback(userId, createFeedbackData, userToken);

    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: result.error || 'Failed to create feedback' 
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Feedback created successfully',
      data: result.feedback
    });

  } catch (error) {
    console.error('Error creating feedback:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Get feedback summary for a specific user
 * GET /api/feedback/:userId
 */
export const getUserFeedbackSummary = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const summary = await feedbackService.getUserFeedbackSummary(
      userId, 
      parseInt(limit as string)
    );

    if (!summary) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found or no feedback available' 
      });
    }

    return res.json({
      success: true,
      data: summary,
      message: 'User feedback summary retrieved successfully'
    });

  } catch (error) {
    console.error('Error getting user feedback summary:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Get feedback statistics for the current user
 * GET /api/feedback/stats
 */
export const getUserFeedbackStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const stats = await feedbackService.getUserFeedbackStats(userId);

    return res.json({
      success: true,
      data: stats,
      message: 'Feedback statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Error getting feedback stats:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Get feedback for a user with filtering and pagination
 * GET /api/feedback/user/:userId
 */
export const getUserFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { 
      stars, 
      date_from, 
      date_to, 
      skill_id,
      page = 1,
      limit = 20
    } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const filters: FeedbackFilters = {
      stars: stars ? parseInt(stars as string) : undefined,
      date_from: date_from as string,
      date_to: date_to as string,
      skill_id: skill_id as string
    };

    const result = await feedbackService.getUserFeedback(
      userId,
      filters,
      parseInt(page as string),
      parseInt(limit as string)
    );

    return res.json({
      success: true,
      data: result,
      message: 'User feedback retrieved successfully'
    });

  } catch (error) {
    console.error('Error getting user feedback:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Get feedback for the current user (received feedback)
 * GET /api/feedback/me
 */
export const getMyFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { 
      stars, 
      date_from, 
      date_to, 
      skill_id,
      page = 1,
      limit = 20
    } = req.query;

    const filters: FeedbackFilters = {
      stars: stars ? parseInt(stars as string) : undefined,
      date_from: date_from as string,
      date_to: date_to as string,
      skill_id: skill_id as string
    };

    const result = await feedbackService.getUserFeedback(
      userId,
      filters,
      parseInt(page as string),
      parseInt(limit as string)
    );

    return res.json({
      success: true,
      data: result,
      message: 'Your feedback retrieved successfully'
    });

  } catch (error) {
    console.error('Error getting my feedback:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Get feedback by ID
 * GET /api/feedback/details/:feedbackId
 */
export const getFeedbackById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { feedbackId } = req.params;

    if (!feedbackId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Feedback ID is required' 
      });
    }

    // Extract the user token from Authorization header
    const authHeader = req.headers['authorization'];
    const userToken = authHeader ? authHeader.split(' ')[1] : undefined;

    const feedback = await feedbackService.getFeedbackById(feedbackId, userToken);

    if (!feedback) {
      return res.status(404).json({ 
        success: false, 
        message: 'Feedback not found' 
      });
    }

    // Check if user is authorized to view this feedback
    if (feedback.from_user_id !== userId && feedback.to_user_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to view this feedback' 
      });
    }

    return res.json({
      success: true,
      data: feedback,
      message: 'Feedback retrieved successfully'
    });

  } catch (error) {
    console.error('Error getting feedback:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

/**
 * Recalculate user rating (admin function)
 * POST /api/feedback/recalculate/:userId
 */
export const recalculateUserRating = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const result = await feedbackService.recalculateUserRating(userId);

    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to recalculate user rating' 
      });
    }

    return res.json({
      success: true,
      data: {
        user_id: userId,
        new_rating: result.newRating
      },
      message: 'User rating recalculated successfully'
    });

  } catch (error) {
    console.error('Error recalculating user rating:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}; 