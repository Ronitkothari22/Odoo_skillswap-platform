import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import supabase from '../config/supabaseClient';

export const getUsers = (_req: Request, res: Response) => {
  return res.json({ users: [] });
};

export const createUser = (req: Request, res: Response) => {
  const user = req.body;
  return res.status(201).json({ user });
};

/**
 * Get a specific user's complete profile by their ID
 * Only returns public profiles (visibility = true)
 * Requires authentication
 */
export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Get user profile with all related data
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
      .eq('visibility', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'User not found or profile is private' });
      }
      return res.status(400).json({ message: 'Error fetching user profile', error: error.message });
    }

    // Format the response to match the expected structure
    const formattedProfile = {
      id: user.id,
      name: user.name,
      location: user.location,
      avatar_url: user.avatar_url,
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

    return res.json({ 
      success: true,
      user: formattedProfile 
    });

  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 