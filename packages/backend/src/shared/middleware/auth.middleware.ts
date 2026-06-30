import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util';
import { logger } from '../utils/logger.util';
import { AuthenticatedRequest } from '../types/common.types';

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authentication token required',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Authentication failed: invalid token', { path: req.path });
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};
