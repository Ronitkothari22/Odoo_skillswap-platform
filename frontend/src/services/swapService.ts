// Swap request service for frontend API communication

export interface SwapRequest {
  id: string;
  requester_id: string;
  responder_id: string;
  give_skill_id: string;
  take_skill_id: string;
  status: 'pending' | 'accepted' | 'cancelled';
  message?: string;
  created_at: string;
  updated_at?: string;
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

export interface CreateSwapRequestData {
  responder_id: string;
  give_skill_id: string;
  take_skill_id: string;
  message?: string;
}

export interface SwapRequestStats {
  totalSent: number;
  totalReceived: number;
  totalAccepted: number;
  totalCancelled: number;
  totalPending: number;
  recentSwaps: SwapRequest[];
}

export interface SwapRequestResponse {
  success: boolean;
  message: string;
  data?: SwapRequest | SwapRequest[] | SwapRequestStats;
}

export interface SwapRequestListResponse {
  success: boolean;
  message: string;
  data?: {
    swaps: SwapRequest[];
    totalCount: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

class SwapService {
  private baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

  private async getAuthToken(): Promise<string | null> {
    return localStorage.getItem('token');
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  /**
   * Create a new swap request
   */
  async createSwapRequest(data: CreateSwapRequestData): Promise<SwapRequestResponse> {
    return this.makeRequest<SwapRequestResponse>('/swaps', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get all swap requests for the current user
   */
  async getSwapRequests(params?: {
    status?: string;
    skill_id?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
  }): Promise<SwapRequestListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/swaps${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest<SwapRequestListResponse>(endpoint);
  }

  /**
   * Get a specific swap request by ID
   */
  async getSwapRequestById(id: string): Promise<SwapRequestResponse> {
    return this.makeRequest<SwapRequestResponse>(`/swaps/${id}`);
  }

  /**
   * Update swap request status
   */
  async updateSwapRequest(id: string, data: {
    status: 'pending' | 'accepted' | 'cancelled';
    message?: string;
  }): Promise<SwapRequestResponse> {
    return this.makeRequest<SwapRequestResponse>(`/swaps/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete/withdraw a swap request
   */
  async deleteSwapRequest(id: string): Promise<SwapRequestResponse> {
    return this.makeRequest<SwapRequestResponse>(`/swaps/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Accept a swap request
   */
  async acceptSwapRequest(id: string, message?: string): Promise<SwapRequestResponse> {
    return this.makeRequest<SwapRequestResponse>(`/swaps/${id}/accept`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  /**
   * Reject a swap request
   */
  async rejectSwapRequest(id: string, message?: string): Promise<SwapRequestResponse> {
    return this.makeRequest<SwapRequestResponse>(`/swaps/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  /**
   * Get received swap requests
   */
  async getReceivedSwapRequests(params?: {
    page?: number;
    limit?: number;
  }): Promise<SwapRequestListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/swaps/received${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest<SwapRequestListResponse>(endpoint);
  }

  /**
   * Get sent swap requests
   */
  async getSentSwapRequests(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<SwapRequestListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/swaps/sent${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest<SwapRequestListResponse>(endpoint);
  }

  /**
   * Get swap request statistics
   */
  async getSwapRequestStats(): Promise<SwapRequestResponse> {
    return this.makeRequest<SwapRequestResponse>('/swaps/stats');
  }
}

export const swapService = new SwapService();
export default swapService; 