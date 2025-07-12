import { API_ENDPOINTS } from '../config/config';

// Types for Profile API responses
export interface Skill {
  id: string;
  name: string;
  proficiency?: number; // For offered skills (1-5)
  priority?: number; // For desired skills (1-5)
}

export interface AvailabilitySlot {
  id: string;
  user_id?: string;
  weekday: number; // 0-6 (Sunday-Saturday)
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
}

export interface UserProfile {
  id: string;
  name: string;
  location?: string;
  avatar_url?: string;
  visibility: boolean;
  rating_avg: number;
  created_at: string;
  skills?: Skill[];
  desiredSkills?: Skill[];
  availability?: AvailabilitySlot[];
}

export interface ProfileResponse {
  profile: UserProfile;
}

export interface UpdateProfileRequest {
  name?: string;
  location?: string;
  avatar_url?: string;
  visibility?: boolean;
}

export interface AddSkillsRequest {
  skills: {
    name: string;
    proficiency: number; // 1-5
  }[];
}

export interface AddDesiredSkillsRequest {
  skills: {
    name: string;
    priority: number; // 1-5
  }[];
}

export interface AddAvailabilityRequest {
  slots: {
    weekday: number;
    start_time: string;
    end_time: string;
  }[];
}

export interface ApiSuccessResponse {
  message: string;
  profile?: UserProfile;
  skills?: Skill[];
  slots?: AvailabilitySlot[];
}

export interface AllSkillsResponse {
  skills: { id: string; name: string; }[];
}

class ProfileService {
  private baseHeaders = {
    'Content-Type': 'application/json',
  };

  // Helper method to make authenticated requests
  private async makeAuthenticatedRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    let token = localStorage.getItem('access_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Add debugging info
    console.log('🔍 Making authenticated request to:', url);
    console.log('🔍 Token present:', !!token);
    console.log('🔍 Token length:', token?.length);
    console.log('🔍 Token expires at:', localStorage.getItem('token_expires_at'));

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.baseHeaders,
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      console.log('🔍 Got 401, attempting token refresh...');
      
      // Try to refresh the token
      const { authService } = await import('./authService');
      const refreshResult = await authService.refreshToken();
      
      if (refreshResult.success) {
        console.log('✅ Token refreshed successfully');
        token = localStorage.getItem('access_token');
        
        // Retry the original request with new token
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            ...this.baseHeaders,
            ...options.headers,
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!retryResponse.ok) {
          const errorData = await retryResponse.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${retryResponse.status}`);
        }
        
        return retryResponse.json();
      } else {
        console.log('❌ Token refresh failed, redirecting to login');
        // Clear tokens and redirect to login
        localStorage.clear();
        window.location.href = '/signin';
        throw new Error('Session expired. Please login again.');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('🔍 Request failed:', {
        url,
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // 1. Get complete user profile
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await this.makeAuthenticatedRequest<ProfileResponse>(
        API_ENDPOINTS.PROFILE.GET
      );
      return response.profile;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // 2. Update basic profile information
  async updateProfile(profileData: UpdateProfileRequest): Promise<UserProfile> {
    try {
      const response = await this.makeAuthenticatedRequest<ApiSuccessResponse>(
        API_ENDPOINTS.PROFILE.UPDATE,
        {
          method: 'PATCH',
          body: JSON.stringify(profileData),
        }
      );
      return response.profile!;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // 3. Get all available skills
  async getAllSkills(): Promise<{ id: string; name: string; }[]> {
    try {
      const response = await this.makeAuthenticatedRequest<AllSkillsResponse>(
        API_ENDPOINTS.PROFILE.SKILLS.ALL
      );
      return response.skills;
    } catch (error) {
      console.error('Get all skills error:', error);
      throw error;
    }
  }

  // 4. Add/Update user's offered skills
  async updateSkills(skills: AddSkillsRequest): Promise<Skill[]> {
    try {
      const response = await this.makeAuthenticatedRequest<ApiSuccessResponse>(
        API_ENDPOINTS.PROFILE.SKILLS.ADD_UPDATE,
        {
          method: 'POST',
          body: JSON.stringify(skills),
        }
      );
      return response.skills!;
    } catch (error) {
      console.error('Update skills error:', error);
      throw error;
    }
  }

  // 5. Remove a specific offered skill
  async removeSkill(skillId: string): Promise<void> {
    try {
      await this.makeAuthenticatedRequest<ApiSuccessResponse>(
        `${API_ENDPOINTS.PROFILE.SKILLS.REMOVE}/${skillId}`,
        {
          method: 'DELETE',
        }
      );
    } catch (error) {
      console.error('Remove skill error:', error);
      throw error;
    }
  }

  // 6. Add/Update user's desired skills
  async updateDesiredSkills(skills: AddDesiredSkillsRequest): Promise<Skill[]> {
    try {
      const response = await this.makeAuthenticatedRequest<ApiSuccessResponse>(
        API_ENDPOINTS.PROFILE.DESIRED_SKILLS.ADD_UPDATE,
        {
          method: 'POST',
          body: JSON.stringify(skills),
        }
      );
      return response.skills!;
    } catch (error) {
      console.error('Update desired skills error:', error);
      throw error;
    }
  }

  // 7. Remove a specific desired skill
  async removeDesiredSkill(skillId: string): Promise<void> {
    try {
      await this.makeAuthenticatedRequest<ApiSuccessResponse>(
        `${API_ENDPOINTS.PROFILE.DESIRED_SKILLS.REMOVE}/${skillId}`,
        {
          method: 'DELETE',
        }
      );
    } catch (error) {
      console.error('Remove desired skill error:', error);
      throw error;
    }
  }

  // 8. Add/Update user's availability slots
  async updateAvailability(availability: AddAvailabilityRequest): Promise<AvailabilitySlot[]> {
    try {
      const response = await this.makeAuthenticatedRequest<ApiSuccessResponse>(
        API_ENDPOINTS.PROFILE.AVAILABILITY.ADD_UPDATE,
        {
          method: 'POST',
          body: JSON.stringify(availability),
        }
      );
      return response.slots!;
    } catch (error) {
      console.error('Update availability error:', error);
      throw error;
    }
  }

  // 9. Remove a specific availability slot
  async removeAvailabilitySlot(slotId: string): Promise<void> {
    try {
      await this.makeAuthenticatedRequest<ApiSuccessResponse>(
        `${API_ENDPOINTS.PROFILE.AVAILABILITY.REMOVE}/${slotId}`,
        {
          method: 'DELETE',
        }
      );
    } catch (error) {
      console.error('Remove availability slot error:', error);
      throw error;
    }
  }

  // Helper method to get weekday name
  getWeekdayName(weekday: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[weekday] || 'Unknown';
  }

  // Helper method to format time
  formatTime(time: string): string {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  }
}

// Export singleton instance
export const profileService = new ProfileService();
export default profileService; 