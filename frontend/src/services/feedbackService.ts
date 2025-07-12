import { config } from '@/config/config';

// Types for feedback system
export interface Feedback {
  id: string;
  swap_id: string;
  from_user_id: string;
  to_user_id: string;
  stars: number;
  comment?: string;
  created_at: string;
}

export interface FeedbackWithDetails extends Feedback {
  swap: {
    id: string;
    give_skill: {
      id: string;
      name: string;
    };
    take_skill: {
      id: string;
      name: string;
    };
    status: string;
    created_at: string;
  };
  from_user: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  to_user: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export interface CreateFeedbackDto {
  swap_id: string;
  stars: number;
  comment?: string;
}

export interface FeedbackStats {
  total_feedback: number;
  average_rating: number;
  five_star_count: number;
  four_star_count: number;
  three_star_count: number;
  two_star_count: number;
  one_star_count: number;
  recent_feedback: FeedbackWithDetails[];
}

export interface UserFeedbackSummary {
  user: {
    id: string;
    name: string;
    avatar_url?: string;
    rating_avg: number;
  };
  feedback_stats: {
    total_feedback: number;
    average_rating: number;
    five_star: number;
    four_star: number;
    three_star: number;
    two_star: number;
    one_star: number;
  };
  recent_feedback: FeedbackWithDetails[];
}

export interface FeedbackFilters {
  stars?: number;
  date_from?: string;
  date_to?: string;
  skill_id?: string;
}

export interface FeedbackListResponse {
  feedback: FeedbackWithDetails[];
  totalCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

class FeedbackService {
  private async makeRequest(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(`${config.API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Create new feedback for a completed swap
   */
  async createFeedback(feedbackData: CreateFeedbackDto): Promise<{ success: boolean; data?: FeedbackWithDetails; message?: string }> {
    try {
      const result = await this.makeRequest('/api/feedback', {
        method: 'POST',
        body: JSON.stringify(feedbackData),
      });
      return result;
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  }

  /**
   * Get feedback statistics for the current user
   */
  async getFeedbackStats(): Promise<{ success: boolean; data: FeedbackStats }> {
    try {
      const result = await this.makeRequest('/api/feedback/stats');
      return result;
    } catch (error) {
      console.error('Error getting feedback stats:', error);
      throw error;
    }
  }

  /**
   * Get feedback received by the current user
   */
  async getMyFeedback(
    filters: FeedbackFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{ success: boolean; data: FeedbackListResponse }> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters.stars && { stars: filters.stars.toString() }),
        ...(filters.date_from && { date_from: filters.date_from }),
        ...(filters.date_to && { date_to: filters.date_to }),
        ...(filters.skill_id && { skill_id: filters.skill_id }),
      });

      const result = await this.makeRequest(`/api/feedback/me?${queryParams}`);
      return result;
    } catch (error) {
      console.error('Error getting my feedback:', error);
      throw error;
    }
  }

  /**
   * Get feedback summary for a specific user
   */
  async getUserFeedbackSummary(userId: string, limit: number = 10): Promise<{ success: boolean; data: UserFeedbackSummary }> {
    try {
      const result = await this.makeRequest(`/api/feedback/${userId}?limit=${limit}`);
      return result;
    } catch (error) {
      console.error('Error getting user feedback summary:', error);
      throw error;
    }
  }

  /**
   * Get detailed feedback for a specific user
   */
  async getUserFeedback(
    userId: string,
    filters: FeedbackFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{ success: boolean; data: FeedbackListResponse }> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters.stars && { stars: filters.stars.toString() }),
        ...(filters.date_from && { date_from: filters.date_from }),
        ...(filters.date_to && { date_to: filters.date_to }),
        ...(filters.skill_id && { skill_id: filters.skill_id }),
      });

      const result = await this.makeRequest(`/api/feedback/user/${userId}?${queryParams}`);
      return result;
    } catch (error) {
      console.error('Error getting user feedback:', error);
      throw error;
    }
  }

  /**
   * Get specific feedback by ID
   */
  async getFeedbackById(feedbackId: string): Promise<{ success: boolean; data: FeedbackWithDetails }> {
    try {
      const result = await this.makeRequest(`/api/feedback/details/${feedbackId}`);
      return result;
    } catch (error) {
      console.error('Error getting feedback by ID:', error);
      throw error;
    }
  }
}

export const feedbackService = new FeedbackService();
export default feedbackService; 