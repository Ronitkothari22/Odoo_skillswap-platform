import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import supabase from '../config/supabaseClient';

export const getProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return res.status(400).json({ message: error.message });

  return res.json({ profile: data });
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const payload = req.body;

  const { data, error } = await supabase
    .from('users')
    .update(payload)
    .eq('id', userId)
    .single();

  if (error) return res.status(400).json({ message: error.message });

  return res.json({ profile: data });
}; 