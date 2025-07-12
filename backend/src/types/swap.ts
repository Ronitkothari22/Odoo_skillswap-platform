// Swap request types and interfaces

export enum SwapStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  CANCELLED = 'cancelled'
}

export interface SwapRequest {
  id: string;
  requester_id: string;
  responder_id: string;
  give_skill_id: string;
  take_skill_id: string;
  status: SwapStatus;
  message?: string;
  created_at: string;
  updated_at?: string;
}

export interface SwapRequestWithDetails extends SwapRequest {
  requester: {
    id: string;
    name: string;
    avatar_url?: string;
    rating_avg: number;
  };
  responder: {
    id: string;
    name: string;
    avatar_url?: string;
    rating_avg: number;
  };
  give_skill: {
    id: string;
    name: string;
  };
  take_skill: {
    id: string;
    name: string;
  };
}

export interface CreateSwapRequestDto {
  responder_id: string;
  give_skill_id: string;
  take_skill_id: string;
  message?: string;
}

export interface UpdateSwapRequestDto {
  status: SwapStatus;
  message?: string;
}

export interface SwapRequestFilters {
  status?: SwapStatus;
  skill_id?: string;
  user_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface SwapRequestListResponse {
  swaps: SwapRequestWithDetails[];
  totalCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SwapRequestStats {
  totalSent: number;
  totalReceived: number;
  totalAccepted: number;
  totalCancelled: number;
  totalPending: number;
  recentSwaps: SwapRequestWithDetails[];
}

export interface SwapNotification {
  id: string;
  user_id: string;
  swap_id: string;
  type: 'swap_request_received' | 'swap_request_accepted' | 'swap_request_cancelled';
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface SwapRequestValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// For real-time updates
export interface SwapRequestUpdate {
  swap_id: string;
  status: SwapStatus;
  updated_by: string;
  timestamp: string;
}

export interface SwapRequestContext {
  currentUserId: string;
  userSkills: Array<{id: string; name: string; proficiency: number}>;
  userDesiredSkills: Array<{id: string; name: string; priority: number}>;
} 