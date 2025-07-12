import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import supabase from '../config/supabaseClient';
import { UserProfile, SearchFilters, DiscoveryOptions } from '../types/matching';

/**
 * Search users by skills, location, and other criteria
 */
export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const {
      skills = [],
      location,
      minRating,
      availability,
      proficiencyLevel,
      page = 1,
      limit = 20,
      sortBy = 'rating'
    } = req.query;

    // Parse skills if it's a string
    const skillsArray = Array.isArray(skills) ? skills : 
      typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : [];

    // Build base query
    let query = supabase
      .from('users')
      .select(`
        *,
        user_skills!inner(
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
      .neq('id', userId);

    // Apply skill filter if provided
    if (skillsArray.length > 0) {
      query = query.in('user_skills.skills.name', skillsArray);
    }

    // Apply location filter if provided
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    // Apply rating filter if provided
    if (minRating) {
      query = query.gte('rating_avg', parseFloat(minRating as string));
    }

    // Execute query
    const { data: users, error } = await query;

    if (error) {
      return res.status(400).json({ 
        message: 'Error searching users', 
        error: error.message 
      });
    }

    // Transform data to match UserProfile interface
    const transformedUsers = users?.map(user => ({
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

    // Apply additional filters
    let filteredUsers = transformedUsers;

    // Proficiency level filter
    if (proficiencyLevel) {
      const { min, max } = JSON.parse(proficiencyLevel as string);
             filteredUsers = filteredUsers.filter(user => {
         if (user.skills.length === 0) return false;
         const avgProficiency = user.skills.reduce((sum: number, skill: any) => sum + skill.proficiency, 0) / user.skills.length;
         return (!min || avgProficiency >= min) && (!max || avgProficiency <= max);
       });
    }

    // Availability filter
    if (availability) {
      const { weekdays, timeRange } = JSON.parse(availability as string);
      if (weekdays && weekdays.length > 0) {
                 filteredUsers = filteredUsers.filter(user => {
           const userWeekdays = user.availability.map((slot: any) => slot.weekday);
           return weekdays.some((day: number) => userWeekdays.includes(day));
         });
      }
      
      if (timeRange) {
        const timeToMinutes = (time: string) => {
          const [hours, minutes] = time.split(':').map(Number);
          return hours * 60 + minutes;
        };
        
        filteredUsers = filteredUsers.filter(user => {
                     return user.availability.some((slot: any) => {
             const slotStart = timeToMinutes(slot.start_time);
             const slotEnd = timeToMinutes(slot.end_time);
             const filterStart = timeToMinutes(timeRange.start);
             const filterEnd = timeToMinutes(timeRange.end);
             
             return slotStart <= filterEnd && slotEnd >= filterStart;
           });
        });
      }
    }

    // Sort results
    const sortedUsers = sortUsers(filteredUsers, sortBy as string);

    // Paginate results
    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

    return res.json({
      users: paginatedUsers,
      totalCount: sortedUsers.length,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      hasMore: endIndex < sortedUsers.length,
      filters: {
        skills: skillsArray,
        location,
        minRating,
        availability,
        proficiencyLevel
      }
    });
  } catch (error) {
    console.error('Error searching users:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get all users with basic discovery functionality
 */
export const discoverUsers = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const {
      page = 1,
      limit = 20,
      sortBy = 'recent',
      excludeViewed = false
    } = req.query;

    // Build query
    let query = supabase
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
      .neq('id', userId);

    // Execute query
    const { data: users, error } = await query;

    if (error) {
      return res.status(400).json({ 
        message: 'Error discovering users', 
        error: error.message 
      });
    }

    // Transform data
    const transformedUsers = users?.map(user => ({
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

    // Sort and paginate
    const sortedUsers = sortUsers(transformedUsers, sortBy as string);
    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

    return res.json({
      users: paginatedUsers,
      totalCount: sortedUsers.length,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      hasMore: endIndex < sortedUsers.length
    });
  } catch (error) {
    console.error('Error discovering users:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get users by specific skill
 */
export const getUsersBySkill = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { skillName } = req.params;
    const { page = 1, limit = 20, minProficiency = 1 } = req.query;

    if (!skillName) {
      return res.status(400).json({ message: 'Skill name is required' });
    }

    // Query users with the specific skill
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        *,
        user_skills!inner(
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
      .neq('id', userId)
      .eq('user_skills.skills.name', skillName)
      .gte('user_skills.proficiency', parseInt(minProficiency as string));

    if (error) {
      return res.status(400).json({ 
        message: 'Error fetching users by skill', 
        error: error.message 
      });
    }

    // Transform data
    const transformedUsers = users?.map(user => ({
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

         // Sort by proficiency in the requested skill (descending)
     const sortedUsers = transformedUsers.sort((a, b) => {
       const aSkill = a.skills.find((s: any) => s.name.toLowerCase() === skillName.toLowerCase());
       const bSkill = b.skills.find((s: any) => s.name.toLowerCase() === skillName.toLowerCase());
       
       return (bSkill?.proficiency || 0) - (aSkill?.proficiency || 0);
     });

    // Paginate
    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

    return res.json({
      skill: skillName,
      users: paginatedUsers,
      totalCount: sortedUsers.length,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      hasMore: endIndex < sortedUsers.length
    });
  } catch (error) {
    console.error('Error fetching users by skill:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get popular skills with user counts
 */
export const getPopularSkills = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { limit = 20 } = req.query;

    // Query to get skill popularity
    const { data: skillCounts, error } = await supabase
      .from('user_skills')
      .select(`
        skills!inner(id, name),
        proficiency
      `)
      .eq('users.visibility', true);

    if (error) {
      return res.status(400).json({ 
        message: 'Error fetching popular skills', 
        error: error.message 
      });
    }

    // Count and calculate averages
    const skillStats = new Map<string, { count: number, totalProficiency: number, name: string }>();

    skillCounts?.forEach((item: any) => {
      const skillName = item.skills.name;
      if (!skillStats.has(skillName)) {
        skillStats.set(skillName, { count: 0, totalProficiency: 0, name: skillName });
      }
      const stats = skillStats.get(skillName)!;
      stats.count++;
      stats.totalProficiency += item.proficiency;
    });

    // Convert to array and sort
    const popularSkills = Array.from(skillStats.entries())
      .map(([name, stats]) => ({
        name,
        userCount: stats.count,
        averageProficiency: Math.round((stats.totalProficiency / stats.count) * 100) / 100
      }))
      .sort((a, b) => b.userCount - a.userCount)
      .slice(0, parseInt(limit as string));

    return res.json({
      popularSkills,
      totalSkillTypes: skillStats.size
    });
  } catch (error) {
    console.error('Error fetching popular skills:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get discovery statistics
 */
export const getDiscoveryStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Get total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .eq('visibility', true);

    // Get total skills
    const { count: totalSkills } = await supabase
      .from('skills')
      .select('*', { count: 'exact' });

    // Get users with availability
    const { count: usersWithAvailability } = await supabase
      .from('availability_slots')
      .select('user_id', { count: 'exact' });

    // Get average rating
    const { data: ratings } = await supabase
      .from('users')
      .select('rating_avg')
      .eq('visibility', true)
      .gt('rating_avg', 0);

    const averageRating = ratings?.length 
      ? ratings.reduce((sum, user) => sum + user.rating_avg, 0) / ratings.length
      : 0;

    return res.json({
      totalUsers: totalUsers || 0,
      totalSkills: totalSkills || 0,
      usersWithAvailability: usersWithAvailability || 0,
      averageRating: Math.round(averageRating * 100) / 100,
      activeUsers: totalUsers || 0 // For now, all visible users are considered active
    });
  } catch (error) {
    console.error('Error fetching discovery stats:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Helper function to sort users based on criteria
 */
function sortUsers(users: UserProfile[], sortBy: string): UserProfile[] {
  switch (sortBy) {
    case 'rating':
      return users.sort((a, b) => b.rating_avg - a.rating_avg);
    case 'recent':
      return users.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    case 'name':
      return users.sort((a, b) => a.name.localeCompare(b.name));
    case 'skills':
      return users.sort((a, b) => b.skills.length - a.skills.length);
    case 'availability':
      return users.sort((a, b) => b.availability.length - a.availability.length);
    default:
      return users;
  }
} 