import { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env.config';
import { logger } from '../utils/logger.util';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Unhandled error occurred', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.nodeEnv === 'development' ? { stack: err.stack } : {}),
  });
};
