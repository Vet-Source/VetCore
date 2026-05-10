import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({ success: false, error: 'A record with this value already exists.' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ success: false, error: 'Record not found.' });
  }

  // Default
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
}
