import { Request, Response } from 'express';

export const getUsers = (_req: Request, res: Response) => {
  return res.json({ users: [] });
};

export const createUser = (req: Request, res: Response) => {
  const user = req.body;
  return res.status(201).json({ user });
}; 