import { Response, NextFunction } from 'express';
import { UsersService } from './users.service';
import { AuthenticatedRequest } from '../../shared/types/common.types';
import { UnauthorizedError } from '../../shared/utils/errors.util';

export class UsersController {
  private service = new UsersService();

  getAll = async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getAllUsers();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getUserById(req.params.id);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.createUser(req.body);
      res.status(201).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.updateUser(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = req.user?.id;
      if (!currentUserId) {
        throw new UnauthorizedError('User context not found');
      }
      await this.service.changePassword(currentUserId, req.body);
      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = req.user?.id;
      if (!currentUserId) {
        throw new UnauthorizedError('User context not found');
      }
      await this.service.deleteUser(req.params.id, currentUserId);
      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = req.user?.id;
      if (!currentUserId) {
        throw new UnauthorizedError('User context not found');
      }
      const data = await this.service.updateUser(currentUserId, {
        fullName: req.body.fullName
      });
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}
