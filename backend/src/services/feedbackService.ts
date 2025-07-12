import supabase, { createUserClient } from '../config/supabaseClient';
import { 
  Feedback, 
  FeedbackWithDetails, 
  CreateFeedbackDto, 
  UserFeedbackSummary, 
  FeedbackStats, 
  FeedbackFilters, 
  FeedbackListResponse, 
  FeedbackValidation
} from '../types/feedback';
import { SwapStatus } from '../types/swap';

export class FeedbackService {
  
  /**
   * Create new feedback for a completed swap
   */
  async createFeedback(
    fromUserId: string, 
    feedbackData: CreateFeedbackDto,
    userToken?: string
  ): Promise<{ success: boolean; feedback?: FeedbackWithDetails; error?: string }> {
    try {
      // Validate the feedback
      const validation = await this.validateFeedback(fromUserId, feedbackData);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      // Get swap details to determine the recipient
      const { data: swap, error: swapError } = await supabase
        .from('swap_requests')
        .select('*')
        .eq('id', feedbackData.swap_id)
        .single();

      if (swapError || !swap) {
        return { success: false, error: 'Swap request not found' };
      }

      // Determine who is giving feedback to whom
      const toUserId = swap.requester_id === fromUserId ? swap.responder_id : swap.requester_id;

      // Check if feedback already exists
      const existingFeedback = await this.findExistingFeedback(feedbackData.swap_id, fromUserId);
      if (existingFeedback) {
        return { success: false, error: 'Feedback already exists for this swap' };
      }

      // Create the feedback - use user client if token provided to respect RLS
      const client = userToken ? createUserClient(userToken) : supabase;
      const { data: newFeedback, error } = await client
        .from('feedback')
        .insert({
          swap_id: feedbackData.swap_id,
          from_user_id: fromUserId,
          to_user_id: toUserId,
          stars: feedbackData.stars,
          comment: feedbackData.comment || null
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Get the full feedback with details
      const fullFeedback = await this.getFeedbackById(newFeedback.id, userToken);
      if (!fullFeedback) {
        return { success: false, error: 'Failed to retrieve created feedback' };
      }

      return { success: true, feedback: fullFeedback };
    } catch (error) {
      console.error('Error creating feedback:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Get feedback by ID with full details
   */
  async getFeedbackById(feedbackId: string, userToken?: string): Promise<FeedbackWithDetails | null> {
    try {
      const client = userToken ? createUserClient(userToken) : supabase;
      const { data: feedback, error } = await client
        .from('feedback')
        .select(`
          *,
          swap:swap_id(
            id,
            give_skill:give_skill_id(id, name),
            take_skill:take_skill_id(id, name),
            status,
            created_at
          ),
          from_user:from_user_id(id, name, avatar_url),
          to_user:to_user_id(id, name, avatar_url)
        `)
        .eq('id', feedbackId)
        .single();

      if (error || !feedback) {
        return null;
      }

      return {
        id: feedback.id,
        swap_id: feedback.swap_id,
        from_user_id: feedback.from_user_id,
        to_user_id: feedback.to_user_id,
        stars: feedback.stars,
        comment: feedback.comment,
        created_at: feedback.created_at,
        swap: {
          id: feedback.swap.id,
          give_skill: {
            id: feedback.swap.give_skill.id,
            name: feedback.swap.give_skill.name
          },
          take_skill: {
            id: feedback.swap.take_skill.id,
            name: feedback.swap.take_skill.name
          },
          status: feedback.swap.status,
          created_at: feedback.swap.created_at
        },
        from_user: {
          id: feedback.from_user.id,
          name: feedback.from_user.name,
          avatar_url: feedback.from_user.avatar_url
        },
        to_user: {
          id: feedback.to_user.id,
          name: feedback.to_user.name,
          avatar_url: feedback.to_user.avatar_url
        }
      };
    } catch (error) {
      console.error('Error getting feedback:', error);
      return null;
    }
  }

  /**
   * Get user's feedback summary including rating and recent feedback
   */
  async getUserFeedbackSummary(
    userId: string, 
    limit: number = 10
  ): Promise<UserFeedbackSummary | null> {
    try {
      // Get user details
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, name, avatar_url, rating_avg')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        return null;
      }

      // Get all feedback for this user
      const { data: allFeedback, error: feedbackError } = await supabase
        .from('feedback')
        .select(`
          *,
          swap:swap_id(
            id,
            give_skill:give_skill_id(id, name),
            take_skill:take_skill_id(id, name),
            status,
            created_at
          ),
          from_user:from_user_id(id, name, avatar_url)
        `)
        .eq('to_user_id', userId)
        .order('created_at', { ascending: false });

      if (feedbackError) {
        return null;
      }

      // Calculate feedback breakdown
      const feedbackBreakdown = {
        five_star: 0,
        four_star: 0,
        three_star: 0,
        two_star: 0,
        one_star: 0
      };

      allFeedback?.forEach(feedback => {
        switch (feedback.stars) {
          case 5: feedbackBreakdown.five_star++; break;
          case 4: feedbackBreakdown.four_star++; break;
          case 3: feedbackBreakdown.three_star++; break;
          case 2: feedbackBreakdown.two_star++; break;
          case 1: feedbackBreakdown.one_star++; break;
        }
      });

      // Transform recent feedback
      const recentFeedback: FeedbackWithDetails[] = (allFeedback?.slice(0, limit) || []).map(feedback => ({
        id: feedback.id,
        swap_id: feedback.swap_id,
        from_user_id: feedback.from_user_id,
        to_user_id: feedback.to_user_id,
        stars: feedback.stars,
        comment: feedback.comment,
        created_at: feedback.created_at,
        swap: {
          id: feedback.swap.id,
          give_skill: {
            id: feedback.swap.give_skill.id,
            name: feedback.swap.give_skill.name
          },
          take_skill: {
            id: feedback.swap.take_skill.id,
            name: feedback.swap.take_skill.name
          },
          status: feedback.swap.status,
          created_at: feedback.swap.created_at
        },
        from_user: {
          id: feedback.from_user.id,
          name: feedback.from_user.name,
          avatar_url: feedback.from_user.avatar_url
        },
        to_user: {
          id: user.id,
          name: user.name,
          avatar_url: user.avatar_url
        }
      }));

      return {
        user_id: user.id,
        user_name: user.name,
        avatar_url: user.avatar_url,
        rating_avg: parseFloat(user.rating_avg || '0'),
        total_feedback_count: allFeedback?.length || 0,
        feedback_breakdown: feedbackBreakdown,
        recent_feedback: recentFeedback
      };
    } catch (error) {
      console.error('Error getting user feedback summary:', error);
      return null;
    }
  }

  /**
   * Get feedback statistics for a user
   */
  async getUserFeedbackStats(userId: string): Promise<FeedbackStats> {
    try {
      // Get feedback given by user
      const { data: feedbackGiven, error: givenError } = await supabase
        .from('feedback')
        .select(`
          *,
          swap:swap_id(
            id,
            give_skill:give_skill_id(id, name),
            take_skill:take_skill_id(id, name),
            status,
            created_at
          ),
          to_user:to_user_id(id, name, avatar_url)
        `)
        .eq('from_user_id', userId)
        .order('created_at', { ascending: false });

      // Get feedback received by user
      const { data: feedbackReceived, error: receivedError } = await supabase
        .from('feedback')
        .select(`
          *,
          swap:swap_id(
            id,
            give_skill:give_skill_id(id, name),
            take_skill:take_skill_id(id, name),
            status,
            created_at
          ),
          from_user:from_user_id(id, name, avatar_url)
        `)
        .eq('to_user_id', userId)
        .order('created_at', { ascending: false });

      if (givenError || receivedError) {
        throw new Error('Error fetching feedback stats');
      }

      // Calculate averages
      const avgGiven = feedbackGiven?.length ? 
        feedbackGiven.reduce((sum, f) => sum + f.stars, 0) / feedbackGiven.length : 0;
      const avgReceived = feedbackReceived?.length ? 
        feedbackReceived.reduce((sum, f) => sum + f.stars, 0) / feedbackReceived.length : 0;

      // Transform recent feedback
      const transformFeedback = (feedback: any[], isGiven: boolean) => {
        return feedback.slice(0, 5).map(f => ({
          id: f.id,
          swap_id: f.swap_id,
          from_user_id: f.from_user_id,
          to_user_id: f.to_user_id,
          stars: f.stars,
          comment: f.comment,
          created_at: f.created_at,
          swap: {
            id: f.swap.id,
            give_skill: {
              id: f.swap.give_skill.id,
              name: f.swap.give_skill.name
            },
            take_skill: {
              id: f.swap.take_skill.id,
              name: f.swap.take_skill.name
            },
            status: f.swap.status,
            created_at: f.swap.created_at
          },
          from_user: isGiven ? {
            id: userId,
            name: 'You',
            avatar_url: undefined
          } : {
            id: f.from_user.id,
            name: f.from_user.name,
            avatar_url: f.from_user.avatar_url
          },
          to_user: isGiven ? {
            id: f.to_user.id,
            name: f.to_user.name,
            avatar_url: f.to_user.avatar_url
          } : {
            id: userId,
            name: 'You',
            avatar_url: undefined
          }
        }));
      };

      return {
        total_given: feedbackGiven?.length || 0,
        total_received: feedbackReceived?.length || 0,
        average_given: Math.round(avgGiven * 100) / 100,
        average_received: Math.round(avgReceived * 100) / 100,
        recent_feedback_given: transformFeedback(feedbackGiven || [], true),
        recent_feedback_received: transformFeedback(feedbackReceived || [], false)
      };
    } catch (error) {
      console.error('Error getting feedback stats:', error);
      return {
        total_given: 0,
        total_received: 0,
        average_given: 0,
        average_received: 0,
        recent_feedback_given: [],
        recent_feedback_received: []
      };
    }
  }

  /**
   * Get feedback for a user with filtering and pagination
   */
  async getUserFeedback(
    userId: string,
    filters: FeedbackFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<FeedbackListResponse> {
    try {
      let query = supabase
        .from('feedback')
        .select(`
          *,
          swap:swap_id(
            id,
            give_skill:give_skill_id(id, name),
            take_skill:take_skill_id(id, name),
            status,
            created_at
          ),
          from_user:from_user_id(id, name, avatar_url)
        `, { count: 'exact' })
        .eq('to_user_id', userId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.stars) {
        query = query.eq('stars', filters.stars);
      }

      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      // Apply pagination
      const { data: feedback, error, count } = await query
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        throw error;
      }

      const transformedFeedback: FeedbackWithDetails[] = (feedback || []).map(f => ({
        id: f.id,
        swap_id: f.swap_id,
        from_user_id: f.from_user_id,
        to_user_id: f.to_user_id,
        stars: f.stars,
        comment: f.comment,
        created_at: f.created_at,
        swap: {
          id: f.swap.id,
          give_skill: {
            id: f.swap.give_skill.id,
            name: f.swap.give_skill.name
          },
          take_skill: {
            id: f.swap.take_skill.id,
            name: f.swap.take_skill.name
          },
          status: f.swap.status,
          created_at: f.swap.created_at
        },
        from_user: {
          id: f.from_user.id,
          name: f.from_user.name,
          avatar_url: f.from_user.avatar_url
        },
        to_user: {
          id: userId,
          name: 'You',
          avatar_url: undefined
        }
      }));

      return {
        feedback: transformedFeedback,
        totalCount: count || 0,
        page,
        limit,
        hasMore: (count || 0) > page * limit
      };
    } catch (error) {
      console.error('Error getting user feedback:', error);
      return {
        feedback: [],
        totalCount: 0,
        page,
        limit,
        hasMore: false
      };
    }
  }

  /**
   * Validate feedback creation
   */
  private async validateFeedback(
    fromUserId: string, 
    feedbackData: CreateFeedbackDto
  ): Promise<FeedbackValidation> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate stars rating
      if (!feedbackData.stars || feedbackData.stars < 1 || feedbackData.stars > 5) {
        errors.push('Stars rating must be between 1 and 5');
      }

      // Check if swap exists and is accepted
      const { data: swap, error: swapError } = await supabase
        .from('swap_requests')
        .select('*')
        .eq('id', feedbackData.swap_id)
        .single();

      if (swapError || !swap) {
        errors.push('Swap request not found');
      } else {
        // Check if swap is accepted
        if (swap.status !== SwapStatus.ACCEPTED) {
          errors.push('Feedback can only be given for accepted swaps');
        }

        // Check if user was part of the swap
        if (swap.requester_id !== fromUserId && swap.responder_id !== fromUserId) {
          errors.push('You can only give feedback for swaps you were part of');
        }
      }

      // Check if comment is not too long
      if (feedbackData.comment && feedbackData.comment.length > 500) {
        errors.push('Comment must be less than 500 characters');
      }

    } catch (error) {
      errors.push('Error validating feedback');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Find existing feedback for a swap from a specific user
   */
  private async findExistingFeedback(
    swapId: string, 
    fromUserId: string
  ): Promise<Feedback | null> {
    try {
      const { data: existing, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('swap_id', swapId)
        .eq('from_user_id', fromUserId)
        .single();

      if (error || !existing) {
        return null;
      }

      return existing;
    } catch (error) {
      return null;
    }
  }

  /**
   * Recalculate user's average rating (used by trigger)
   */
  async recalculateUserRating(userId: string): Promise<{ success: boolean; newRating: number }> {
    try {
      const { data: feedbacks, error } = await supabase
        .from('feedback')
        .select('stars')
        .eq('to_user_id', userId);

      if (error) {
        return { success: false, newRating: 0 };
      }

      const totalFeedbacks = feedbacks?.length || 0;
      const averageRating = totalFeedbacks > 0 ? 
        feedbacks.reduce((sum, f) => sum + f.stars, 0) / totalFeedbacks : 0;

      // Update user's rating
      const { error: updateError } = await supabase
        .from('users')
        .update({ rating_avg: Math.round(averageRating * 100) / 100 })
        .eq('id', userId);

      if (updateError) {
        return { success: false, newRating: 0 };
      }

      return { success: true, newRating: Math.round(averageRating * 100) / 100 };
    } catch (error) {
      console.error('Error recalculating user rating:', error);
      return { success: false, newRating: 0 };
    }
  }
} 