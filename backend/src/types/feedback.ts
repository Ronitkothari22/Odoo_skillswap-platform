// Feedback system types and interfaces

export interface Feedback {
  id: string;
  swap_id: string;
  from_user_id: string;
  to_user_id: string;
  stars: number; // 1-5 scale
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

export interface UserFeedbackSummary {
  user_id: string;
  user_name: string;
  avatar_url?: string;
  rating_avg: number;
  total_feedback_count: number;
  feedback_breakdown: {
    five_star: number;
    four_star: number;
    three_star: number;
    two_star: number;
    one_star: number;
  };
  recent_feedback: FeedbackWithDetails[];
}

export interface FeedbackStats {
  total_given: number;
  total_received: number;
  average_given: number;
  average_received: number;
  recent_feedback_given: FeedbackWithDetails[];
  recent_feedback_received: FeedbackWithDetails[];
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

export interface FeedbackValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface RatingCalculation {
  user_id: string;
  old_rating: number;
  new_rating: number;
  feedback_count: number;
  calculation_date: string;
} 