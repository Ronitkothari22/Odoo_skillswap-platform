import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import supabase from '../config/supabaseClient';
import { MatchingService } from '../services/matchingService';
import { UserProfile, SearchFilters, DiscoveryOptions } from '../types/matching';

const matchingService = new MatchingService();

/**
 * Get intelligent matches for the current user
 */
export const getMatches = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const {
      page = 1,
      limit = 20,
      sortBy = 'compatibility',
      includeMatchScore = true,
      minCompatibility = 0.3
    } = req.query;

    // Get current user's profile
    const currentUser = await getUserProfile(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Get all other users
    const allUsers = await getAllUsers(userId);

    // Apply minimum compatibility filter
    const filteredUsers = allUsers.filter(user => {
      const score = matchingService['calculateMatchScore'](currentUser, user);
      return score.totalScore >= parseFloat(minCompatibility as string);
    });

         // Find matches using the matching service
     const result = await matchingService.findMatches(
       currentUser,
       filteredUsers,
       {
         page: parseInt(page as string),
         limit: parseInt(limit as string),
         sortBy: sortBy as 'compatibility' | 'rating' | 'distance' | 'recent',
         includeMatchScore: includeMatchScore === 'true'
       }
     );

    return res.json({
      success: true,
      ...result,
      currentUser: {
        id: currentUser.id,
        name: currentUser.name,
        skillsOffered: currentUser.skills.length,
        skillsWanted: currentUser.desiredSkills.length
      }
    });
  } catch (error) {
    console.error('Error getting matches:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get detailed match analysis for a specific user
 */
export const getMatchAnalysis = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { targetUserId } = req.params;
    if (!targetUserId) {
      return res.status(400).json({ message: 'Target user ID is required' });
    }

    // Get both user profiles
    const [currentUser, targetUser] = await Promise.all([
      getUserProfile(userId),
      getUserProfile(targetUserId)
    ]);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Calculate detailed match analysis
    const matchScore = matchingService['calculateMatchScore'](currentUser, targetUser);
    const mutualSkills = matchingService['findMutualSkills'](currentUser, targetUser);
    const matchType = matchingService['determineMatchType'](matchScore, mutualSkills);
    const recommendationReason = matchingService['generateRecommendationReason'](
      currentUser,
      targetUser,
      mutualSkills,
      matchScore
    );

    // Get what current user can teach to target user
    const canTeach = currentUser.skills.filter(skill => 
      targetUser.desiredSkills.some(desired => 
        desired.name.toLowerCase() === skill.name.toLowerCase()
      )
    );

    // Get what current user can learn from target user
    const canLearn = targetUser.skills.filter(skill => 
      currentUser.desiredSkills.some(desired => 
        desired.name.toLowerCase() === skill.name.toLowerCase()
      )
    );

    return res.json({
      success: true,
      analysis: {
        matchScore,
        mutualSkills,
        matchType,
        recommendationReason,
        canTeach,
        canLearn,
        compatibility: {
          skillMatch: matchScore.skillCompatibility,
          scheduleMatch: matchScore.availabilityOverlap,
          locationMatch: matchScore.locationProximity,
          reputationMatch: matchScore.ratingMatch
        }
      },
      users: {
        current: {
          id: currentUser.id,
          name: currentUser.name,
          location: currentUser.location,
          rating: currentUser.rating_avg
        },
        target: {
          id: targetUser.id,
          name: targetUser.name,
          location: targetUser.location,
          rating: targetUser.rating_avg
        }
      }
    });
  } catch (error) {
    console.error('Error getting match analysis:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get skill-based recommendations
 */
export const getSkillRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { limit = 10 } = req.query;

    // Get current user's profile
    const currentUser = await getUserProfile(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Get all other users
    const allUsers = await getAllUsers(userId);

    // Get skill recommendations
    const recommendations = matchingService.getSkillRecommendations(currentUser, allUsers);

    return res.json({
      success: true,
      recommendations: recommendations.slice(0, parseInt(limit as string)),
      totalRecommendations: recommendations.length,
      userProfile: {
        id: currentUser.id,
        name: currentUser.name,
        currentSkills: currentUser.skills.length,
        desiredSkills: currentUser.desiredSkills.length
      }
    });
  } catch (error) {
    console.error('Error getting skill recommendations:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get users who want to learn what the current user can teach
 */
export const getSkillRequesters = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { page = 1, limit = 20 } = req.query;

    // Get current user's profile
    const currentUser = await getUserProfile(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Get all other users
    const allUsers = await getAllUsers(userId);

    // Find users who want to learn what current user can teach
    const requesters = allUsers.filter(user => {
      return user.desiredSkills.some(desired => 
        currentUser.skills.some(skill => 
          skill.name.toLowerCase() === desired.name.toLowerCase()
        )
      );
    });

    // Calculate compatibility for each requester
    const requestersWithScores = requesters.map(user => {
      const score = matchingService['calculateMatchScore'](currentUser, user);
      const mutualSkills = matchingService['findMutualSkills'](currentUser, user);
      
      // Find what skills they want that current user can teach
      const requestedSkills = user.desiredSkills.filter(desired => 
        currentUser.skills.some(skill => 
          skill.name.toLowerCase() === desired.name.toLowerCase()
        )
      );

      return {
        user,
        score,
        requestedSkills,
        mutualSkills
      };
    });

    // Sort by compatibility score
    const sortedRequesters = requestersWithScores
      .sort((a, b) => b.score.totalScore - a.score.totalScore);

    // Paginate
    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedRequesters = sortedRequesters.slice(startIndex, endIndex);

    return res.json({
      success: true,
      requesters: paginatedRequesters,
      totalCount: sortedRequesters.length,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      hasMore: endIndex < sortedRequesters.length,
      teachableSkills: currentUser.skills.map(skill => skill.name)
    });
  } catch (error) {
    console.error('Error getting skill requesters:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get users who can teach what the current user wants to learn
 */
export const getSkillTeachers = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { page = 1, limit = 20, minProficiency = 1 } = req.query;

    // Get current user's profile
    const currentUser = await getUserProfile(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Get all other users
    const allUsers = await getAllUsers(userId);

    // Find users who can teach what current user wants to learn
    const teachers = allUsers.filter(user => {
      return user.skills.some(skill => {
        const isDesired = currentUser.desiredSkills.some(desired => 
          desired.name.toLowerCase() === skill.name.toLowerCase()
        );
        const meetsProficiency = skill.proficiency >= parseInt(minProficiency as string);
        return isDesired && meetsProficiency;
      });
    });

    // Calculate compatibility for each teacher
    const teachersWithScores = teachers.map(user => {
      const score = matchingService['calculateMatchScore'](currentUser, user);
      const mutualSkills = matchingService['findMutualSkills'](currentUser, user);
      
      // Find what skills they can teach that current user wants
      const teachableSkills = user.skills.filter(skill => 
        currentUser.desiredSkills.some(desired => 
          desired.name.toLowerCase() === skill.name.toLowerCase()
        )
      );

      return {
        user,
        score,
        teachableSkills,
        mutualSkills
      };
    });

    // Sort by compatibility score
    const sortedTeachers = teachersWithScores
      .sort((a, b) => b.score.totalScore - a.score.totalScore);

    // Paginate
    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedTeachers = sortedTeachers.slice(startIndex, endIndex);

    return res.json({
      success: true,
      teachers: paginatedTeachers,
      totalCount: sortedTeachers.length,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      hasMore: endIndex < sortedTeachers.length,
      desiredSkills: currentUser.desiredSkills.map(skill => skill.name)
    });
  } catch (error) {
    console.error('Error getting skill teachers:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get perfect matches (users with mutual skill exchange potential)
 */
export const getPerfectMatches = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { page = 1, limit = 10 } = req.query;

    // Get current user's profile
    const currentUser = await getUserProfile(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Get all other users
    const allUsers = await getAllUsers(userId);

    // Find perfect matches (bidirectional skill exchange)
    const perfectMatches = allUsers.filter(user => {
      const canTeach = currentUser.skills.some(skill => 
        user.desiredSkills.some(desired => 
          desired.name.toLowerCase() === skill.name.toLowerCase()
        )
      );
      
      const canLearn = user.skills.some(skill => 
        currentUser.desiredSkills.some(desired => 
          desired.name.toLowerCase() === skill.name.toLowerCase()
        )
      );

      return canTeach && canLearn;
    });

    // Calculate scores and create detailed match objects
    const matchesWithScores = perfectMatches.map(user => {
      const score = matchingService['calculateMatchScore'](currentUser, user);
      const mutualSkills = matchingService['findMutualSkills'](currentUser, user);
      const matchType = matchingService['determineMatchType'](score, mutualSkills);
      const recommendationReason = matchingService['generateRecommendationReason'](
        currentUser,
        user,
        mutualSkills,
        score
      );

      return {
        user,
        score,
        mutualSkills,
        matchType,
        recommendationReason
      };
    });

    // Sort by total score
    const sortedMatches = matchesWithScores
      .sort((a, b) => b.score.totalScore - a.score.totalScore);

    // Paginate
    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedMatches = sortedMatches.slice(startIndex, endIndex);

    return res.json({
      success: true,
      perfectMatches: paginatedMatches,
      totalCount: sortedMatches.length,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      hasMore: endIndex < sortedMatches.length,
      criteria: {
        bidirectionalSkillExchange: true,
        minimumSkillOverlap: 1
      }
    });
  } catch (error) {
    console.error('Error getting perfect matches:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get matching statistics for the current user
 */
export const getMatchingStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Get current user's profile
    const currentUser = await getUserProfile(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Get all other users
    const allUsers = await getAllUsers(userId);

    // Calculate various statistics
    const totalUsers = allUsers.length;
    const usersWithSkills = allUsers.filter(user => user.skills.length > 0).length;
    const usersWantingSkills = allUsers.filter(user => user.desiredSkills.length > 0).length;

    // Find users who want what current user can teach
    const interestedInMySkills = allUsers.filter(user => 
      user.desiredSkills.some(desired => 
        currentUser.skills.some(skill => 
          skill.name.toLowerCase() === desired.name.toLowerCase()
        )
      )
    ).length;

    // Find users who can teach what current user wants
    const canTeachMyDesires = allUsers.filter(user => 
      user.skills.some(skill => 
        currentUser.desiredSkills.some(desired => 
          desired.name.toLowerCase() === skill.name.toLowerCase()
        )
      )
    ).length;

    // Calculate compatibility distribution
    const compatibilityScores = allUsers.map(user => 
      matchingService['calculateMatchScore'](currentUser, user).totalScore
    );

    const highCompatibility = compatibilityScores.filter(score => score >= 0.7).length;
    const mediumCompatibility = compatibilityScores.filter(score => score >= 0.5 && score < 0.7).length;
    const lowCompatibility = compatibilityScores.filter(score => score < 0.5).length;

    return res.json({
      success: true,
      stats: {
        totalUsers,
        usersWithSkills,
        usersWantingSkills,
        interestedInMySkills,
        canTeachMyDesires,
        compatibility: {
          high: highCompatibility,
          medium: mediumCompatibility,
          low: lowCompatibility
        },
        averageCompatibility: compatibilityScores.length > 0 
          ? Math.round((compatibilityScores.reduce((a, b) => a + b, 0) / compatibilityScores.length) * 100) / 100
          : 0
      },
      userProfile: {
        id: currentUser.id,
        name: currentUser.name,
        skillsOffered: currentUser.skills.length,
        skillsWanted: currentUser.desiredSkills.length,
        hasAvailability: currentUser.availability.length > 0,
        hasLocation: !!currentUser.location,
        rating: currentUser.rating_avg
      }
    });
  } catch (error) {
    console.error('Error getting matching stats:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Helper function to get user profile with all related data
 */
async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        user_skills(
          proficiency,
          skills!inner(id, name)
        ),
        desired_skills(
          priority,
          skills!inner(id, name)
        ),
        availability_slots(*)
      `)
      .eq('id', userId)
      .single();

    if (error || !user) return null;

    return {
      id: user.id,
      name: user.name,
      location: user.location,
      avatar_url: user.avatar_url,
      visibility: user.visibility,
      rating_avg: user.rating_avg,
      created_at: user.created_at,
      skills: user.user_skills?.map((us: any) => ({
        id: us.skills.id,
        name: us.skills.name,
        proficiency: us.proficiency
      })) || [],
      desiredSkills: user.desired_skills?.map((ds: any) => ({
        id: ds.skills.id,
        name: ds.skills.name,
        priority: ds.priority
      })) || [],
      availability: user.availability_slots || []
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Helper function to get all users except the current user
 */
async function getAllUsers(currentUserId: string): Promise<UserProfile[]> {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        *,
        user_skills(
          proficiency,
          skills!inner(id, name)
        ),
        desired_skills(
          priority,
          skills!inner(id, name)
        ),
        availability_slots(*)
      `)
      .eq('visibility', true)
      .neq('id', currentUserId);

    if (error) return [];

    return users?.map(user => ({
      id: user.id,
      name: user.name,
      location: user.location,
      avatar_url: user.avatar_url,
      visibility: user.visibility,
      rating_avg: user.rating_avg,
      created_at: user.created_at,
      skills: user.user_skills?.map((us: any) => ({
        id: us.skills.id,
        name: us.skills.name,
        proficiency: us.proficiency
      })) || [],
      desiredSkills: user.desired_skills?.map((ds: any) => ({
        id: ds.skills.id,
        name: ds.skills.name,
        priority: ds.priority
      })) || [],
      availability: user.availability_slots || []
    })) || [];
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
} 