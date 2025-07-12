import supabase, { createUserClient } from '../config/supabaseClient';
import { 
  SwapRequest, 
  SwapRequestWithDetails, 
  SwapStatus, 
  CreateSwapRequestDto, 
  UpdateSwapRequestDto, 
  SwapRequestFilters, 
  SwapRequestListResponse, 
  SwapRequestStats, 
  SwapRequestValidation,
  SwapRequestContext
} from '../types/swap';

export class SwapRequestService {
  
  /**
   * Create a new swap request
   */
  async createSwapRequest(
    requesterId: string, 
    swapData: CreateSwapRequestDto,
    userToken?: string
  ): Promise<{ success: boolean; swap?: SwapRequestWithDetails; error?: string }> {
    try {
      // Validate the swap request
      const validation = await this.validateSwapRequest(requesterId, swapData);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      // Check if a similar swap request already exists
      const existingSwap = await this.findExistingSwapRequest(
        requesterId, 
        swapData.responder_id, 
        swapData.give_skill_id, 
        swapData.take_skill_id
      );

      if (existingSwap) {
        return { success: false, error: 'A similar swap request already exists' };
      }

      // Create the swap request - use user client if token provided to respect RLS
      const client = userToken ? createUserClient(userToken) : supabase;
      const { data: swapRequest, error } = await client
        .from('swap_requests')
        .insert({
          requester_id: requesterId,
          responder_id: swapData.responder_id,
          give_skill_id: swapData.give_skill_id,
          take_skill_id: swapData.take_skill_id,
          status: SwapStatus.PENDING,
          message: swapData.message || null
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Get the full swap request with details
      const fullSwap = await this.getSwapRequestById(swapRequest.id, userToken);
      if (!fullSwap) {
        return { success: false, error: 'Failed to retrieve created swap request' };
      }

      return { success: true, swap: fullSwap };
    } catch (error) {
      console.error('Error creating swap request:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Update swap request status (accept, reject, cancel)
   */
  async updateSwapRequest(
    swapId: string, 
    userId: string, 
    updateData: UpdateSwapRequestDto,
    userToken?: string
  ): Promise<{ success: boolean; swap?: SwapRequestWithDetails; error?: string }> {
    try {
      // Get the current swap request
      const currentSwap = await this.getSwapRequestById(swapId, userToken);
      if (!currentSwap) {
        return { success: false, error: 'Swap request not found' };
      }

      // Check if user is authorized to update this swap
      if (currentSwap.requester_id !== userId && currentSwap.responder_id !== userId) {
        return { success: false, error: 'Unauthorized to update this swap request' };
      }

      // Validate the status update
      const isValidUpdate = this.validateStatusUpdate(currentSwap, updateData.status, userId);
      if (!isValidUpdate.isValid) {
        return { success: false, error: isValidUpdate.errors.join(', ') };
      }

      // Update the swap request - use user client if token provided to respect RLS
      const client = userToken ? createUserClient(userToken) : supabase;
      const { data: updatedSwap, error } = await client
        .from('swap_requests')
        .update({
          status: updateData.status,
          message: updateData.message || currentSwap.message
        })
        .eq('id', swapId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Get the full updated swap request
      const fullSwap = await this.getSwapRequestById(swapId, userToken);
      if (!fullSwap) {
        return { success: false, error: 'Failed to retrieve updated swap request' };
      }

      return { success: true, swap: fullSwap };
    } catch (error) {
      console.error('Error updating swap request:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Get swap request by ID with full details
   */
  async getSwapRequestById(swapId: string, userToken?: string): Promise<SwapRequestWithDetails | null> {
    try {
      // Use user client if token provided to respect RLS, otherwise use service role
      const client = userToken ? createUserClient(userToken) : supabase;
      const { data: swap, error } = await client
        .from('swap_requests')
        .select(`
          *,
          requester:requester_id(id, name, avatar_url, rating_avg),
          responder:responder_id(id, name, avatar_url, rating_avg),
          give_skill:give_skill_id(id, name),
          take_skill:take_skill_id(id, name)
        `)
        .eq('id', swapId)
        .single();

      if (error || !swap) {
        return null;
      }

      return {
        id: swap.id,
        requester_id: swap.requester_id,
        responder_id: swap.responder_id,
        give_skill_id: swap.give_skill_id,
        take_skill_id: swap.take_skill_id,
        status: swap.status,
        message: swap.message,
        created_at: swap.created_at,
        updated_at: swap.updated_at,
        requester: {
          id: swap.requester.id,
          name: swap.requester.name,
          avatar_url: swap.requester.avatar_url,
          rating_avg: swap.requester.rating_avg
        },
        responder: {
          id: swap.responder.id,
          name: swap.responder.name,
          avatar_url: swap.responder.avatar_url,
          rating_avg: swap.responder.rating_avg
        },
        give_skill: {
          id: swap.give_skill.id,
          name: swap.give_skill.name
        },
        take_skill: {
          id: swap.take_skill.id,
          name: swap.take_skill.name
        }
      };
    } catch (error) {
      console.error('Error getting swap request:', error);
      return null;
    }
  }

  /**
   * Get swap requests for a user with filtering
   */
  async getSwapRequestsForUser(
    userId: string, 
    filters: SwapRequestFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<SwapRequestListResponse> {
    try {
      let query = supabase
        .from('swap_requests')
        .select(`
          *,
          requester:requester_id(id, name, avatar_url, rating_avg),
          responder:responder_id(id, name, avatar_url, rating_avg),
          give_skill:give_skill_id(id, name),
          take_skill:take_skill_id(id, name)
        `)
        .or(`requester_id.eq.${userId},responder_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.skill_id) {
        query = query.or(`give_skill_id.eq.${filters.skill_id},take_skill_id.eq.${filters.skill_id}`);
      }

      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      // Execute query with pagination
      const { data: swaps, error, count } = await query
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        throw error;
      }

      const transformedSwaps: SwapRequestWithDetails[] = swaps?.map(swap => ({
        id: swap.id,
        requester_id: swap.requester_id,
        responder_id: swap.responder_id,
        give_skill_id: swap.give_skill_id,
        take_skill_id: swap.take_skill_id,
        status: swap.status,
        message: swap.message,
        created_at: swap.created_at,
        updated_at: swap.updated_at,
        requester: {
          id: swap.requester.id,
          name: swap.requester.name,
          avatar_url: swap.requester.avatar_url,
          rating_avg: swap.requester.rating_avg
        },
        responder: {
          id: swap.responder.id,
          name: swap.responder.name,
          avatar_url: swap.responder.avatar_url,
          rating_avg: swap.responder.rating_avg
        },
        give_skill: {
          id: swap.give_skill.id,
          name: swap.give_skill.name
        },
        take_skill: {
          id: swap.take_skill.id,
          name: swap.take_skill.name
        }
      })) || [];

      return {
        swaps: transformedSwaps,
        totalCount: count || 0,
        page,
        limit,
        hasMore: (count || 0) > page * limit
      };
    } catch (error) {
      console.error('Error getting swap requests for user:', error);
      return {
        swaps: [],
        totalCount: 0,
        page,
        limit,
        hasMore: false
      };
    }
  }

  /**
   * Get swap request statistics for a user
   */
  async getSwapRequestStats(userId: string): Promise<SwapRequestStats> {
    try {
      const { data: stats, error } = await supabase
        .from('swap_requests')
        .select('status, requester_id, responder_id')
        .or(`requester_id.eq.${userId},responder_id.eq.${userId}`);

      if (error) {
        throw error;
      }

      const totalSent = stats?.filter(s => s.requester_id === userId).length || 0;
      const totalReceived = stats?.filter(s => s.responder_id === userId).length || 0;
      const totalAccepted = stats?.filter(s => s.status === SwapStatus.ACCEPTED).length || 0;
      const totalCancelled = stats?.filter(s => s.status === SwapStatus.CANCELLED).length || 0;
      const totalPending = stats?.filter(s => s.status === SwapStatus.PENDING).length || 0;

      // Get recent swaps
      const recentSwaps = await this.getSwapRequestsForUser(userId, {}, 1, 5);

      return {
        totalSent,
        totalReceived,
        totalAccepted,
        totalCancelled,
        totalPending,
        recentSwaps: recentSwaps.swaps
      };
    } catch (error) {
      console.error('Error getting swap request stats:', error);
      return {
        totalSent: 0,
        totalReceived: 0,
        totalAccepted: 0,
        totalCancelled: 0,
        totalPending: 0,
        recentSwaps: []
      };
    }
  }

  /**
   * Delete/withdraw a swap request
   */
  async deleteSwapRequest(swapId: string, userId: string, userToken?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if the swap request exists and user is authorized
      const swap = await this.getSwapRequestById(swapId, userToken);
      if (!swap) {
        return { success: false, error: 'Swap request not found' };
      }

      // Only requester can withdraw pending requests
      if (swap.requester_id !== userId || swap.status !== SwapStatus.PENDING) {
        return { success: false, error: 'Cannot withdraw this swap request' };
      }

      const { error } = await supabase
        .from('swap_requests')
        .delete()
        .eq('id', swapId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting swap request:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  /**
   * Validate swap request creation
   */
  private async validateSwapRequest(
    requesterId: string, 
    swapData: CreateSwapRequestDto
  ): Promise<SwapRequestValidation> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check if requester and responder are different
      if (requesterId === swapData.responder_id) {
        errors.push('Cannot create swap request with yourself');
      }

      // Check if both users exist and are visible
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, visibility')
        .in('id', [requesterId, swapData.responder_id]);

      if (usersError || !users || users.length !== 2) {
        errors.push('Invalid user IDs');
      } else {
        const responder = users.find(u => u.id === swapData.responder_id);
        if (!responder?.visibility) {
          errors.push('Responder profile is not visible');
        }
      }

      // Check if both skills exist
      const { data: skills, error: skillsError } = await supabase
        .from('skills')
        .select('id')
        .in('id', [swapData.give_skill_id, swapData.take_skill_id]);

      if (skillsError || !skills || skills.length !== 2) {
        errors.push('Invalid skill IDs');
      }

      // Check if requester actually has the skill they want to give
      const { data: requesterSkills, error: requesterSkillsError } = await supabase
        .from('user_skills')
        .select('skill_id')
        .eq('user_id', requesterId)
        .eq('skill_id', swapData.give_skill_id);

      if (requesterSkillsError || !requesterSkills || requesterSkills.length === 0) {
        errors.push('You do not have the skill you are offering');
      }

      // Check if responder has the skill requester wants
      const { data: responderSkills, error: responderSkillsError } = await supabase
        .from('user_skills')
        .select('skill_id')
        .eq('user_id', swapData.responder_id)
        .eq('skill_id', swapData.take_skill_id);

      if (responderSkillsError || !responderSkills || responderSkills.length === 0) {
        warnings.push('Responder may not have the skill you are requesting');
      }

      // Check if responder actually wants the skill requester is offering
      const { data: responderDesiredSkills, error: responderDesiredError } = await supabase
        .from('desired_skills')
        .select('skill_id')
        .eq('user_id', swapData.responder_id)
        .eq('skill_id', swapData.give_skill_id);

      if (responderDesiredError || !responderDesiredSkills || responderDesiredSkills.length === 0) {
        warnings.push('Responder may not be looking for the skill you are offering');
      }

    } catch (error) {
      errors.push('Error validating swap request');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Find existing swap request
   */
  private async findExistingSwapRequest(
    requesterId: string, 
    responderId: string, 
    giveSkillId: string, 
    takeSkillId: string
  ): Promise<SwapRequest | null> {
    try {
      const { data: existing, error } = await supabase
        .from('swap_requests')
        .select('*')
        .eq('requester_id', requesterId)
        .eq('responder_id', responderId)
        .eq('give_skill_id', giveSkillId)
        .eq('take_skill_id', takeSkillId)
        .eq('status', SwapStatus.PENDING)
        .single();

      if (error || !existing) {
        return null;
      }

      return existing;
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate status update
   */
  private validateStatusUpdate(
    currentSwap: SwapRequestWithDetails, 
    newStatus: SwapStatus, 
    userId: string
  ): SwapRequestValidation {
    const errors: string[] = [];

    // Can only update pending swaps
    if (currentSwap.status !== SwapStatus.PENDING) {
      errors.push('Can only update pending swap requests');
    }

    // Only responder can accept/reject, only requester can cancel
    if (newStatus === SwapStatus.ACCEPTED || newStatus === SwapStatus.CANCELLED) {
      if (newStatus === SwapStatus.ACCEPTED && currentSwap.responder_id !== userId) {
        errors.push('Only the responder can accept a swap request');
      }
      if (newStatus === SwapStatus.CANCELLED && currentSwap.requester_id !== userId) {
        errors.push('Only the requester can cancel a swap request');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }
} 