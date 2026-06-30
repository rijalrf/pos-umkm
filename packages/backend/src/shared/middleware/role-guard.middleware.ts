import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/common.types';

export const authorize = (allowedRoles: ('ADMIN' | 'CASHIER' | 'CUSTOMER')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied: insufficient permissions',
      });
      return;
    }

    next();
  };
};
