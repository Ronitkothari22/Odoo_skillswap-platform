import { Request, Response, NextFunction } from 'express';

export const notFound = (_req: Request, _res: Response, next: NextFunction) => {
  const error: any = new Error('Not Found');
  error.status = 404;
  next(error);
}; 