// Matching system types and interfaces

export interface UserProfile {
  id: string;
  name: string;
  location?: string;
  avatar_url?: string;
  visibility: boolean;
  rating_avg: number;
  created_at: string;
  skills: UserSkill[];
  desiredSkills: DesiredSkill[];
  availability: AvailabilitySlot[];
}

export interface UserSkill {
  id: string;
  name: string;
  proficiency: number; // 1-5 scale
}

export interface DesiredSkill {
  id: string;
  name: string;
  priority: number; // 1-5 scale
}

export interface AvailabilitySlot {
  id: string;
  user_id: string;
  weekday: number; // 0-6 (Sunday-Saturday)
  start_time: string;
  end_time: string;
}

export interface MatchScore {
  totalScore: number;
  skillCompatibility: number;
  availabilityOverlap: number;
  locationProximity: number;
  ratingMatch: number;
  breakdownScores: ScoreBreakdown;
}

export interface ScoreBreakdown {
  skillMatch: {
    score: number;
    matchedSkills: SkillMatch[];
  };
  availability: {
    score: number;
    overlappingSlots: number;
  };
  location: {
    score: number;
    distance?: number;
  };
  reputation: {
    score: number;
    ratingDifference: number;
  };
}

export interface SkillMatch {
  skill: string;
  userProficiency: number;
  partnerDesire: number;
  compatibility: number;
}

export interface UserMatch {
  user: UserProfile;
  score: MatchScore;
  mutualSkills: SkillMatch[];
  recommendationReason: string;
  matchType: MatchType;
}

export enum MatchType {
  PERFECT_MATCH = 'perfect_match',
  GOOD_MATCH = 'good_match',
  SKILL_COMPLEMENTARY = 'skill_complementary',
  AVAILABILITY_MATCH = 'availability_match',
  LOCATION_BASED = 'location_based',
  SIMILAR_INTERESTS = 'similar_interests'
}

export interface SearchFilters {
  skills?: string[];
  location?: string;
  minRating?: number;
  maxDistance?: number;
  availability?: {
    weekdays?: number[];
    timeRange?: {
      start: string;
      end: string;
    };
  };
  proficiencyLevel?: {
    min?: number;
    max?: number;
  };
}

export interface DiscoveryOptions {
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'distance' | 'compatibility' | 'recent';
  includeMatchScore?: boolean;
}

export interface RecommendationContext {
  userId: string;
  preferredSkills: string[];
  learnedSkills: string[];
  previousMatches: string[];
  rejectedUsers: string[];
  preferences: UserPreferences;
}

export interface UserPreferences {
  preferredLocations: string[];
  preferredTimeSlots: AvailabilitySlot[];
  skillPriorities: { [skillName: string]: number };
  matchingPreferences: {
    prioritizeSkillMatch: boolean;
    prioritizeAvailability: boolean;
    prioritizeLocation: boolean;
    prioritizeRating: boolean;
  };
}

export interface MatchingWeights {
  skillCompatibility: number;
  availabilityOverlap: number;
  locationProximity: number;
  ratingMatch: number;
  activityLevel: number;
}

export interface MatchingResult {
  matches: UserMatch[];
  totalCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
  searchQuery?: string;
  filters?: SearchFilters;
}

export interface SkillRecommendation {
  skill: string;
  reason: string;
  relevanceScore: number;
  availableTeachers: number;
  averageRating: number;
  popularityScore: number;
}

export interface LocationInfo {
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  address?: string;
}

export interface MatchingStats {
  totalUsers: number;
  totalSkills: number;
  averageMatches: number;
  topSkills: string[];
  matchingSuccess: number;
} 