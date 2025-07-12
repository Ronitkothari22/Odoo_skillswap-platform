import { config } from '../config/config';

// Types for discovery and matching
export interface DiscoveryUser {
  id: string;
  name: string;
  location: string;
  skills: Array<{
    id: string;
    name: string;
    proficiency: number;
  }>;
  desired_skills?: Array<{
    id: string;
    name: string;
    priority: number;
  }>;
  rating_avg: number;
  total_sessions: number;
  visibility: boolean;
  availability_slots: Array<{
    weekday: number;
    start_time: string;
    end_time: string;
  }>;
  avatar_url?: string;
}

export interface MatchUser {
  user: DiscoveryUser;
  compatibility: {
    overall_score: number;
    skill_match: number;
    availability_match: number;
    location_match: number;
    rating_match: number;
    breakdown: {
      user_can_teach: string[];
      user_can_learn: string[];
      mutual_availability: Array<{
        weekday: number;
        overlap: string;
      }>;
      distance_km?: number;
    };
  };
}

export interface PerfectMatch {
  user: DiscoveryUser;
  perfect_match_details: {
    bidirectional_skills: Array<{
      skill: string;
      alex_teaches?: { proficiency: number };
      sarah_wants?: { priority: number };
      sarah_teaches?: { proficiency: number };
      alex_wants?: { priority: number };
    }>;
    compatibility_score: number;
    mutual_availability: Array<{
      weekday: number;
      overlap: string;
    }>;
    exchange_potential: string;
  };
}

export interface SkillStats {
  name: string;
  user_count: number;
  avg_proficiency: number;
  total_proficiency: number;
}

export interface PlatformStats {
  total_users: number;
  total_skills: number;
  total_locations: number;
  users_with_availability: number;
  avg_skills_per_user: number;
  top_locations: Array<{
    location: string;
    count: number;
  }>;
  skill_distribution: {
    beginner: number;
    intermediate: number;
    advanced: number;
    expert: number;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
  message?: string;
}

class DiscoveryService {
  private baseUrl = config.API_BASE_URL;

  // Helper method to make authenticated requests
  private async makeAuthenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Discovery API methods
  async searchUsers(params: {
    skills?: string;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<DiscoveryUser[]>> {
    const searchParams = new URLSearchParams();
    
    if (params.skills) searchParams.append('skills', params.skills);
    if (params.location) searchParams.append('location', params.location);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const response = await this.makeAuthenticatedRequest<any>(
      `/api/discovery/search?${searchParams.toString()}`
    );

    return {
      success: response.success,
      data: response.users,
      pagination: response.pagination,
      message: response.message
    };
  }

  async getAllUsers(params: {
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<DiscoveryUser[]>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const response = await this.makeAuthenticatedRequest<any>(
      `/api/discovery/users?${searchParams.toString()}`
    );

    return {
      success: response.success,
      data: response.users,
      pagination: response.pagination,
      message: response.message
    };
  }

  async getSkillStats(): Promise<SkillStats[]> {
    const response = await this.makeAuthenticatedRequest<any>('/api/discovery/skills');
    return response.skills;
  }

  async getPlatformStats(): Promise<PlatformStats> {
    const response = await this.makeAuthenticatedRequest<any>('/api/discovery/stats');
    return response.stats;
  }

  // Matching API methods
  async getPersonalizedMatches(params: {
    minCompatibility?: number;
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<MatchUser[]>> {
    const searchParams = new URLSearchParams();
    
    if (params.minCompatibility) searchParams.append('minCompatibility', params.minCompatibility.toString());
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const response = await this.makeAuthenticatedRequest<any>(
      `/api/matching/matches?${searchParams.toString()}`
    );

    return {
      success: response.success,
      data: response.matches,
      pagination: response.pagination,
      message: response.message
    };
  }

  async getPerfectMatches(params: {
    bidirectional?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<PerfectMatch[]>> {
    const searchParams = new URLSearchParams();
    
    if (params.bidirectional) searchParams.append('bidirectional', 'true');
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const response = await this.makeAuthenticatedRequest<any>(
      `/api/matching/perfect?${searchParams.toString()}`
    );

    return {
      success: response.success,
      data: response.perfect_matches,
      pagination: response.pagination,
      message: response.message
    };
  }

  async getCompatibilityAnalysis(userId: string): Promise<any> {
    const response = await this.makeAuthenticatedRequest<any>(
      `/api/matching/analysis/${userId}`
    );
    return response.analysis;
  }

  async getSkillRecommendations(params: {
    skill?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<MatchUser[]>> {
    const searchParams = new URLSearchParams();
    
    if (params.skill) searchParams.append('skill', params.skill);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const response = await this.makeAuthenticatedRequest<any>(
      `/api/matching/recommendations?${searchParams.toString()}`
    );

    return {
      success: response.success,
      data: response.recommendations,
      pagination: response.pagination,
      message: response.message
    };
  }

  // Utility methods
  getWeekdayName(weekday: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[weekday] || 'Unknown';
  }

  formatAvailability(slots: Array<{ weekday: number; start_time: string; end_time: string }>): string {
    if (!slots || slots.length === 0) return 'No availability set';
    
    const formatted = slots.map(slot => 
      `${this.getWeekdayName(slot.weekday)} ${slot.start_time}-${slot.end_time}`
    ).join(', ');
    
    return formatted;
  }

  getProficiencyLevel(proficiency: number): string {
    if (proficiency <= 1) return 'Beginner';
    if (proficiency <= 2) return 'Novice';
    if (proficiency <= 3) return 'Intermediate';
    if (proficiency <= 4) return 'Advanced';
    return 'Expert';
  }

  getProficiencyColor(proficiency: number): string {
    if (proficiency <= 1) return 'bg-red-100 text-red-800';
    if (proficiency <= 2) return 'bg-yellow-100 text-yellow-800';
    if (proficiency <= 3) return 'bg-blue-100 text-blue-800';
    if (proficiency <= 4) return 'bg-green-100 text-green-800';
    return 'bg-purple-100 text-purple-800';
  }

  getCompatibilityColor(score: number): string {
    if (score >= 0.8) return 'bg-green-100 text-green-800';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800';
    if (score >= 0.4) return 'bg-blue-100 text-blue-800';
    return 'bg-red-100 text-red-800';
  }
}

export const discoveryService = new DiscoveryService();
export default discoveryService; 