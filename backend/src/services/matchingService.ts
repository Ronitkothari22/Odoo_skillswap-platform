import { 
  UserProfile, 
  UserMatch, 
  MatchScore, 
  SkillMatch, 
  MatchType,
  ScoreBreakdown,
  MatchingWeights,
  AvailabilitySlot,
  SearchFilters,
  DiscoveryOptions,
  MatchingResult,
  SkillRecommendation,
  LocationInfo
} from '../types/matching';

export class MatchingService {
  private defaultWeights: MatchingWeights = {
    skillCompatibility: 0.4,
    availabilityOverlap: 0.3,
    locationProximity: 0.2,
    ratingMatch: 0.1,
    activityLevel: 0.0
  };

  /**
   * Find matches for a user based on their profile and preferences
   */
  async findMatches(
    currentUser: UserProfile,
    allUsers: UserProfile[],
    options: DiscoveryOptions = {}
  ): Promise<MatchingResult> {
    const { page = 1, limit = 20, sortBy = 'compatibility', includeMatchScore = true } = options;

    // Filter out the current user and private profiles
    const candidateUsers = allUsers.filter(user => 
      user.id !== currentUser.id && 
      user.visibility === true
    );

    // Calculate match scores for all candidates
    const userMatches: UserMatch[] = [];
    
    for (const candidate of candidateUsers) {
      const matchScore = this.calculateMatchScore(currentUser, candidate);
      const mutualSkills = this.findMutualSkills(currentUser, candidate);
      const matchType = this.determineMatchType(matchScore, mutualSkills);
      const recommendationReason = this.generateRecommendationReason(
        currentUser, 
        candidate, 
        mutualSkills, 
        matchScore
      );

      userMatches.push({
        user: candidate,
        score: matchScore,
        mutualSkills,
        matchType,
        recommendationReason
      });
    }

    // Sort matches based on the selected criteria
    const sortedMatches = this.sortMatches(userMatches, sortBy);

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMatches = sortedMatches.slice(startIndex, endIndex);

    return {
      matches: paginatedMatches,
      totalCount: sortedMatches.length,
      page,
      limit,
      hasMore: endIndex < sortedMatches.length
    };
  }

  /**
   * Calculate comprehensive match score between two users
   */
  private calculateMatchScore(user1: UserProfile, user2: UserProfile): MatchScore {
    const skillCompatibility = this.calculateSkillCompatibility(user1, user2);
    const availabilityOverlap = this.calculateAvailabilityOverlap(user1, user2);
    const locationProximity = this.calculateLocationProximity(user1, user2);
    const ratingMatch = this.calculateRatingMatch(user1, user2);

    const totalScore = (
      skillCompatibility * this.defaultWeights.skillCompatibility +
      availabilityOverlap * this.defaultWeights.availabilityOverlap +
      locationProximity * this.defaultWeights.locationProximity +
      ratingMatch * this.defaultWeights.ratingMatch
    );

    const breakdownScores = this.createScoreBreakdown(
      user1, 
      user2, 
      skillCompatibility, 
      availabilityOverlap, 
      locationProximity, 
      ratingMatch
    );

    return {
      totalScore: Math.round(totalScore * 100) / 100,
      skillCompatibility,
      availabilityOverlap,
      locationProximity,
      ratingMatch,
      breakdownScores
    };
  }

  /**
   * Calculate skill compatibility between two users
   */
  private calculateSkillCompatibility(user1: UserProfile, user2: UserProfile): number {
    const user1Skills = user1.skills.map(s => ({ name: s.name, proficiency: s.proficiency }));
    const user1Desired = user1.desiredSkills.map(s => ({ name: s.name, priority: s.priority }));
    const user2Skills = user2.skills.map(s => ({ name: s.name, proficiency: s.proficiency }));
    const user2Desired = user2.desiredSkills.map(s => ({ name: s.name, priority: s.priority }));

    let compatibilityScore = 0;
    let totalPossibleScore = 0;

    // Check what user1 can teach to user2
    for (const desired of user2Desired) {
      const matchingSkill = user1Skills.find(skill => 
        skill.name.toLowerCase() === desired.name.toLowerCase()
      );
      
      if (matchingSkill) {
        const skillScore = (matchingSkill.proficiency / 5) * (desired.priority / 5);
        compatibilityScore += skillScore;
      }
      totalPossibleScore += 1;
    }

    // Check what user2 can teach to user1
    for (const desired of user1Desired) {
      const matchingSkill = user2Skills.find(skill => 
        skill.name.toLowerCase() === desired.name.toLowerCase()
      );
      
      if (matchingSkill) {
        const skillScore = (matchingSkill.proficiency / 5) * (desired.priority / 5);
        compatibilityScore += skillScore;
      }
      totalPossibleScore += 1;
    }

    return totalPossibleScore > 0 ? compatibilityScore / totalPossibleScore : 0;
  }

  /**
   * Calculate availability overlap between two users
   */
  private calculateAvailabilityOverlap(user1: UserProfile, user2: UserProfile): number {
    const user1Availability = user1.availability || [];
    const user2Availability = user2.availability || [];

    if (user1Availability.length === 0 || user2Availability.length === 0) {
      return 0.5; // Default score if no availability data
    }

    let overlappingMinutes = 0;
    let totalMinutes = 0;

    for (const slot1 of user1Availability) {
      for (const slot2 of user2Availability) {
        if (slot1.weekday === slot2.weekday) {
          const overlap = this.calculateTimeOverlap(slot1, slot2);
          overlappingMinutes += overlap;
        }
      }
      totalMinutes += this.getSlotDuration(slot1);
    }

    return totalMinutes > 0 ? overlappingMinutes / totalMinutes : 0;
  }

  /**
   * Calculate location proximity score
   */
  private calculateLocationProximity(user1: UserProfile, user2: UserProfile): number {
    if (!user1.location || !user2.location) {
      return 0.5; // Default score if no location data
    }

    // Simple location matching for now (exact match or partial match)
    const location1 = user1.location.toLowerCase();
    const location2 = user2.location.toLowerCase();

    if (location1 === location2) {
      return 1.0; // Perfect match
    }

    // Check if locations share common words (city, state, country)
    const location1Words = location1.split(/[,\s]+/);
    const location2Words = location2.split(/[,\s]+/);
    
    const commonWords = location1Words.filter(word => 
      location2Words.includes(word) && word.length > 2
    );

    return commonWords.length > 0 ? 0.7 : 0.3;
  }

  /**
   * Calculate rating compatibility
   */
  private calculateRatingMatch(user1: UserProfile, user2: UserProfile): number {
    const rating1 = user1.rating_avg || 0;
    const rating2 = user2.rating_avg || 0;

    // Both users have no ratings - neutral score
    if (rating1 === 0 && rating2 === 0) {
      return 0.5;
    }

    // Calculate similarity in ratings (closer ratings = higher score)
    const ratingDifference = Math.abs(rating1 - rating2);
    const maxDifference = 5; // Maximum possible difference
    
    return 1 - (ratingDifference / maxDifference);
  }

  /**
   * Find mutual skills between two users
   */
  private findMutualSkills(user1: UserProfile, user2: UserProfile): SkillMatch[] {
    const mutualSkills: SkillMatch[] = [];

    // Check what user1 can teach to user2
    for (const desired of user2.desiredSkills) {
      const matchingSkill = user1.skills.find(skill => 
        skill.name.toLowerCase() === desired.name.toLowerCase()
      );
      
      if (matchingSkill) {
        mutualSkills.push({
          skill: matchingSkill.name,
          userProficiency: matchingSkill.proficiency,
          partnerDesire: desired.priority,
          compatibility: (matchingSkill.proficiency / 5) * (desired.priority / 5)
        });
      }
    }

    // Check what user2 can teach to user1
    for (const desired of user1.desiredSkills) {
      const matchingSkill = user2.skills.find(skill => 
        skill.name.toLowerCase() === desired.name.toLowerCase()
      );
      
      if (matchingSkill) {
        mutualSkills.push({
          skill: matchingSkill.name,
          userProficiency: matchingSkill.proficiency,
          partnerDesire: desired.priority,
          compatibility: (matchingSkill.proficiency / 5) * (desired.priority / 5)
        });
      }
    }

    return mutualSkills;
  }

  /**
   * Determine the type of match based on score and mutual skills
   */
  private determineMatchType(score: MatchScore, mutualSkills: SkillMatch[]): MatchType {
    if (score.totalScore >= 0.9 && mutualSkills.length >= 2) {
      return MatchType.PERFECT_MATCH;
    } else if (score.totalScore >= 0.7) {
      return MatchType.GOOD_MATCH;
    } else if (score.skillCompatibility >= 0.8) {
      return MatchType.SKILL_COMPLEMENTARY;
    } else if (score.availabilityOverlap >= 0.7) {
      return MatchType.AVAILABILITY_MATCH;
    } else if (score.locationProximity >= 0.8) {
      return MatchType.LOCATION_BASED;
    } else {
      return MatchType.SIMILAR_INTERESTS;
    }
  }

  /**
   * Generate a human-readable recommendation reason
   */
  private generateRecommendationReason(
    user1: UserProfile, 
    user2: UserProfile, 
    mutualSkills: SkillMatch[],
    score: MatchScore
  ): string {
    if (mutualSkills.length === 0) {
      return "Similar interests and compatible schedules";
    }

    const topSkills = mutualSkills
      .sort((a, b) => b.compatibility - a.compatibility)
      .slice(0, 2)
      .map(skill => skill.skill);

    if (topSkills.length === 1) {
      return `Great match for ${topSkills[0]} skill exchange`;
    } else if (topSkills.length === 2) {
      return `Perfect for ${topSkills[0]} and ${topSkills[1]} skill exchange`;
    }

    return `Excellent compatibility across ${mutualSkills.length} skills`;
  }

  /**
   * Sort matches based on specified criteria
   */
  private sortMatches(matches: UserMatch[], sortBy: string): UserMatch[] {
    switch (sortBy) {
      case 'rating':
        return matches.sort((a, b) => b.user.rating_avg - a.user.rating_avg);
      case 'compatibility':
        return matches.sort((a, b) => b.score.totalScore - a.score.totalScore);
      case 'recent':
        return matches.sort((a, b) => 
          new Date(b.user.created_at).getTime() - new Date(a.user.created_at).getTime()
        );
      default:
        return matches.sort((a, b) => b.score.totalScore - a.score.totalScore);
    }
  }

  /**
   * Helper method to calculate time overlap between two availability slots
   */
  private calculateTimeOverlap(slot1: AvailabilitySlot, slot2: AvailabilitySlot): number {
    const start1 = this.timeToMinutes(slot1.start_time);
    const end1 = this.timeToMinutes(slot1.end_time);
    const start2 = this.timeToMinutes(slot2.start_time);
    const end2 = this.timeToMinutes(slot2.end_time);

    const overlapStart = Math.max(start1, start2);
    const overlapEnd = Math.min(end1, end2);

    return overlapEnd > overlapStart ? overlapEnd - overlapStart : 0;
  }

  /**
   * Helper method to get duration of an availability slot in minutes
   */
  private getSlotDuration(slot: AvailabilitySlot): number {
    const start = this.timeToMinutes(slot.start_time);
    const end = this.timeToMinutes(slot.end_time);
    return end - start;
  }

  /**
   * Helper method to convert time string to minutes
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Create detailed score breakdown
   */
  private createScoreBreakdown(
    user1: UserProfile, 
    user2: UserProfile, 
    skillCompatibility: number,
    availabilityOverlap: number,
    locationProximity: number,
    ratingMatch: number
  ): ScoreBreakdown {
    const mutualSkills = this.findMutualSkills(user1, user2);
    const overlappingSlots = this.countOverlappingSlots(user1, user2);
    const ratingDifference = Math.abs(user1.rating_avg - user2.rating_avg);

    return {
      skillMatch: {
        score: skillCompatibility,
        matchedSkills: mutualSkills
      },
      availability: {
        score: availabilityOverlap,
        overlappingSlots
      },
      location: {
        score: locationProximity
      },
      reputation: {
        score: ratingMatch,
        ratingDifference
      }
    };
  }

  /**
   * Count overlapping availability slots
   */
  private countOverlappingSlots(user1: UserProfile, user2: UserProfile): number {
    let count = 0;
    for (const slot1 of user1.availability || []) {
      for (const slot2 of user2.availability || []) {
        if (slot1.weekday === slot2.weekday && 
            this.calculateTimeOverlap(slot1, slot2) > 0) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * Apply filters to user list
   */
  applyFilters(users: UserProfile[], filters: SearchFilters): UserProfile[] {
    return users.filter(user => {
      // Skill filter
      if (filters.skills && filters.skills.length > 0) {
        const userSkills = user.skills.map(s => s.name.toLowerCase());
        const hasRequiredSkills = filters.skills.some(skill => 
          userSkills.includes(skill.toLowerCase())
        );
        if (!hasRequiredSkills) return false;
      }

      // Location filter
      if (filters.location) {
        if (!user.location || 
            !user.location.toLowerCase().includes(filters.location.toLowerCase())) {
          return false;
        }
      }

      // Rating filter
      if (filters.minRating && user.rating_avg < filters.minRating) {
        return false;
      }

      // Proficiency level filter
      if (filters.proficiencyLevel) {
        const { min, max } = filters.proficiencyLevel;
        if (min || max) {
          const userProficiencies = user.skills.map(s => s.proficiency);
          const avgProficiency = userProficiencies.reduce((a, b) => a + b, 0) / userProficiencies.length;
          
          if (min && avgProficiency < min) return false;
          if (max && avgProficiency > max) return false;
        }
      }

      // Availability filter
      if (filters.availability) {
        const { weekdays, timeRange } = filters.availability;
        
        if (weekdays && weekdays.length > 0) {
          const userWeekdays = user.availability.map(slot => slot.weekday);
          const hasMatchingWeekday = weekdays.some(day => userWeekdays.includes(day));
          if (!hasMatchingWeekday) return false;
        }

        if (timeRange) {
          const hasMatchingTimeRange = user.availability.some(slot => {
            const slotStart = this.timeToMinutes(slot.start_time);
            const slotEnd = this.timeToMinutes(slot.end_time);
            const filterStart = this.timeToMinutes(timeRange.start);
            const filterEnd = this.timeToMinutes(timeRange.end);
            
            return slotStart <= filterEnd && slotEnd >= filterStart;
          });
          if (!hasMatchingTimeRange) return false;
        }
      }

      return true;
    });
  }

  /**
   * Get skill recommendations for a user
   */
  getSkillRecommendations(
    user: UserProfile, 
    allUsers: UserProfile[]
  ): SkillRecommendation[] {
    const skillStats = new Map<string, { count: number, ratings: number[] }>();
    
    // Analyze what skills are popular and well-rated
    for (const otherUser of allUsers) {
      if (otherUser.id === user.id) continue;
      
      for (const skill of otherUser.skills) {
        if (!skillStats.has(skill.name)) {
          skillStats.set(skill.name, { count: 0, ratings: [] });
        }
        const stats = skillStats.get(skill.name)!;
        stats.count++;
        stats.ratings.push(otherUser.rating_avg);
      }
    }

    const recommendations: SkillRecommendation[] = [];
    const userSkillNames = user.skills.map(s => s.name.toLowerCase());

    for (const [skillName, stats] of skillStats) {
      // Don't recommend skills user already has
      if (userSkillNames.includes(skillName.toLowerCase())) continue;

      const averageRating = stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length;
      const popularityScore = Math.min(stats.count / 10, 1); // Normalize to 0-1

      recommendations.push({
        skill: skillName,
        reason: `Popular skill with ${stats.count} available teachers`,
        relevanceScore: (popularityScore + (averageRating / 5)) / 2,
        availableTeachers: stats.count,
        averageRating,
        popularityScore
      });
    }

    return recommendations
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10);
  }
} 