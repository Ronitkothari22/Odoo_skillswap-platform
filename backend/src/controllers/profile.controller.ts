import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import supabase from '../config/supabaseClient';

// Get complete profile with skills and availability
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      return res.status(400).json({ message: 'Profile not found', error: profileError.message });
    }

    // Get user skills with skill names
    const { data: userSkills, error: skillsError } = await supabase
      .from('user_skills')
      .select(`
        skill_id,
        proficiency,
        skills!inner(id, name)
      `)
      .eq('user_id', userId);

    if (skillsError) {
      return res.status(400).json({ message: 'Error fetching skills', error: skillsError.message });
    }

    // Get desired skills with skill names
    const { data: desiredSkills, error: desiredError } = await supabase
      .from('desired_skills')
      .select(`
        skill_id,
        priority,
        skills!inner(id, name)
      `)
      .eq('user_id', userId);

    if (desiredError) {
      return res.status(400).json({ message: 'Error fetching desired skills', error: desiredError.message });
    }

    // Get availability slots
    const { data: availability, error: availabilityError } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('user_id', userId)
      .order('weekday')
      .order('start_time');

    if (availabilityError) {
      return res.status(400).json({ message: 'Error fetching availability', error: availabilityError.message });
    }

    // Format the response
    const formattedProfile = {
      ...profile,
      skills: userSkills?.map((skill: any) => ({
        id: skill.skill_id,
        name: skill.skills.name,
        proficiency: skill.proficiency
      })) || [],
      desiredSkills: desiredSkills?.map((skill: any) => ({
        id: skill.skill_id,
        name: skill.skills.name,
        priority: skill.priority
      })) || [],
      availability: availability || []
    };

    return res.json({ profile: formattedProfile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Update basic profile information
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name, location, avatar_url, visibility } = req.body;

    // Validate input
    if (name && (typeof name !== 'string' || name.trim().length === 0)) {
      return res.status(400).json({ message: 'Name must be a non-empty string' });
    }

    if (location && typeof location !== 'string') {
      return res.status(400).json({ message: 'Location must be a string' });
    }

    if (avatar_url && typeof avatar_url !== 'string') {
      return res.status(400).json({ message: 'Avatar URL must be a string' });
    }

    if (visibility !== undefined && typeof visibility !== 'boolean') {
      return res.status(400).json({ message: 'Visibility must be a boolean' });
    }

    // Prepare update payload
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (location !== undefined) updateData.location = location;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    if (visibility !== undefined) updateData.visibility = visibility;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: 'Failed to update profile', error: error.message });
    }

    return res.json({ message: 'Profile updated successfully', profile: data });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Add or update user skills
export const addOrUpdateSkills = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({ message: 'Skills must be an array' });
    }

    // Validate skills format
    for (const skill of skills) {
      if (!skill.name || typeof skill.name !== 'string') {
        return res.status(400).json({ message: 'Each skill must have a name' });
      }
      if (skill.proficiency && (typeof skill.proficiency !== 'number' || skill.proficiency < 1 || skill.proficiency > 5)) {
        return res.status(400).json({ message: 'Proficiency must be a number between 1 and 5' });
      }
    }

    const results = [];

    for (const skill of skills) {
      // First, ensure the skill exists in the skills table
      const { data: existingSkill, error: skillError } = await supabase
        .from('skills')
        .select('id')
        .eq('name', skill.name)
        .single();

      let skillId;
      if (skillError && skillError.code === 'PGRST116') {
        // Skill doesn't exist, create it
        const { data: newSkill, error: createError } = await supabase
          .from('skills')
          .insert({ name: skill.name })
          .select('id')
          .single();

        if (createError) {
          return res.status(400).json({ message: 'Failed to create skill', error: createError.message });
        }
        skillId = newSkill.id;
      } else if (skillError) {
        return res.status(400).json({ message: 'Error checking skill', error: skillError.message });
      } else {
        skillId = existingSkill.id;
      }

      // Upsert user skill
      const { data: userSkill, error: userSkillError } = await supabase
        .from('user_skills')
        .upsert({
          user_id: userId,
          skill_id: skillId,
          proficiency: skill.proficiency || 1
        }, { onConflict: 'user_id,skill_id' })
        .select(`
          skill_id,
          proficiency,
          skills!inner(id, name)
        `)
        .single();

      if (userSkillError) {
        return res.status(400).json({ message: 'Failed to add skill', error: userSkillError.message });
      }

      results.push({
        id: userSkill.skill_id,
        name: (userSkill as any).skills.name,
        proficiency: userSkill.proficiency
      });
    }

    return res.json({ message: 'Skills updated successfully', skills: results });
  } catch (error) {
    console.error('Error adding/updating skills:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Add or update desired skills
export const addOrUpdateDesiredSkills = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({ message: 'Skills must be an array' });
    }

    // Validate skills format
    for (const skill of skills) {
      if (!skill.name || typeof skill.name !== 'string') {
        return res.status(400).json({ message: 'Each skill must have a name' });
      }
      if (skill.priority && (typeof skill.priority !== 'number' || skill.priority < 1 || skill.priority > 5)) {
        return res.status(400).json({ message: 'Priority must be a number between 1 and 5' });
      }
    }

    const results = [];

    for (const skill of skills) {
      // First, ensure the skill exists in the skills table
      const { data: existingSkill, error: skillError } = await supabase
        .from('skills')
        .select('id')
        .eq('name', skill.name)
        .single();

      let skillId;
      if (skillError && skillError.code === 'PGRST116') {
        // Skill doesn't exist, create it
        const { data: newSkill, error: createError } = await supabase
          .from('skills')
          .insert({ name: skill.name })
          .select('id')
          .single();

        if (createError) {
          return res.status(400).json({ message: 'Failed to create skill', error: createError.message });
        }
        skillId = newSkill.id;
      } else if (skillError) {
        return res.status(400).json({ message: 'Error checking skill', error: skillError.message });
      } else {
        skillId = existingSkill.id;
      }

      // Upsert desired skill
      const { data: desiredSkill, error: desiredSkillError } = await supabase
        .from('desired_skills')
        .upsert({
          user_id: userId,
          skill_id: skillId,
          priority: skill.priority || 1
        }, { onConflict: 'user_id,skill_id' })
        .select(`
          skill_id,
          priority,
          skills!inner(id, name)
        `)
        .single();

      if (desiredSkillError) {
        return res.status(400).json({ message: 'Failed to add desired skill', error: desiredSkillError.message });
      }

      results.push({
        id: desiredSkill.skill_id,
        name: (desiredSkill as any).skills.name,
        priority: desiredSkill.priority
      });
    }

    return res.json({ message: 'Desired skills updated successfully', skills: results });
  } catch (error) {
    console.error('Error adding/updating desired skills:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Add or update availability slots
export const addOrUpdateAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { slots } = req.body;

    if (!Array.isArray(slots)) {
      return res.status(400).json({ message: 'Slots must be an array' });
    }

    // Validate slots format
    for (const slot of slots) {
      if (typeof slot.weekday !== 'number' || slot.weekday < 0 || slot.weekday > 6) {
        return res.status(400).json({ message: 'Weekday must be a number between 0 and 6' });
      }
      if (!slot.start_time || typeof slot.start_time !== 'string') {
        return res.status(400).json({ message: 'Start time must be a string in HH:MM format' });
      }
      if (!slot.end_time || typeof slot.end_time !== 'string') {
        return res.status(400).json({ message: 'End time must be a string in HH:MM format' });
      }
      // Validate time format (HH:MM)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(slot.start_time)) {
        return res.status(400).json({ message: 'Start time must be in HH:MM format' });
      }
      if (!timeRegex.test(slot.end_time)) {
        return res.status(400).json({ message: 'End time must be in HH:MM format' });
      }
    }

    // Clear existing availability for the user
    const { error: deleteError } = await supabase
      .from('availability_slots')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      return res.status(400).json({ message: 'Failed to clear existing availability', error: deleteError.message });
    }

    // Insert new availability slots
    const slotsToInsert = slots.map(slot => ({
      user_id: userId,
      weekday: slot.weekday,
      start_time: slot.start_time,
      end_time: slot.end_time
    }));

    const { data: newSlots, error: insertError } = await supabase
      .from('availability_slots')
      .insert(slotsToInsert)
      .select('*');

    if (insertError) {
      return res.status(400).json({ message: 'Failed to add availability slots', error: insertError.message });
    }

    return res.json({ message: 'Availability updated successfully', slots: newSlots });
  } catch (error) {
    console.error('Error adding/updating availability:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Remove a skill from user's skills
export const removeSkill = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { skillId } = req.params;

    if (!skillId) {
      return res.status(400).json({ message: 'Skill ID is required' });
    }

    const { error } = await supabase
      .from('user_skills')
      .delete()
      .eq('user_id', userId)
      .eq('skill_id', skillId);

    if (error) {
      return res.status(400).json({ message: 'Failed to remove skill', error: error.message });
    }

    return res.json({ message: 'Skill removed successfully' });
  } catch (error) {
    console.error('Error removing skill:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Remove a desired skill
export const removeDesiredSkill = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { skillId } = req.params;

    if (!skillId) {
      return res.status(400).json({ message: 'Skill ID is required' });
    }

    const { error } = await supabase
      .from('desired_skills')
      .delete()
      .eq('user_id', userId)
      .eq('skill_id', skillId);

    if (error) {
      return res.status(400).json({ message: 'Failed to remove desired skill', error: error.message });
    }

    return res.json({ message: 'Desired skill removed successfully' });
  } catch (error) {
    console.error('Error removing desired skill:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Remove an availability slot
export const removeAvailabilitySlot = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { slotId } = req.params;

    if (!slotId) {
      return res.status(400).json({ message: 'Slot ID is required' });
    }

    const { error } = await supabase
      .from('availability_slots')
      .delete()
      .eq('user_id', userId)
      .eq('id', slotId);

    if (error) {
      return res.status(400).json({ message: 'Failed to remove availability slot', error: error.message });
    }

    return res.json({ message: 'Availability slot removed successfully' });
  } catch (error) {
    console.error('Error removing availability slot:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all available skills (for frontend dropdown/search)
export const getAllSkills = async (req: AuthRequest, res: Response) => {
  try {
    const { data: skills, error } = await supabase
      .from('skills')
      .select('id, name')
      .order('name');

    if (error) {
      return res.status(400).json({ message: 'Failed to fetch skills', error: error.message });
    }

    return res.json({ skills });
  } catch (error) {
    console.error('Error fetching skills:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 