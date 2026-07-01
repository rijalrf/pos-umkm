import { Request, Response, NextFunction } from 'express';
import { PublicService } from './public.service';
import { NotFoundError } from '../../shared/utils/errors.util';

export class PublicController {
  private service = new PublicService();

  getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string | undefined;
      const categoryId = req.query.categoryId as string | undefined;

      const data = await this.service.getProducts({ page, limit, search, categoryId });
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const product = await this.service.getProductById(id);
      
      if (!product) {
        throw new NotFoundError('Product not found');
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  getCategories = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await this.service.getCategories();
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  };

  getStoreInfo = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getStoreInfo();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  checkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.checkout(req.body);
      res.status(201).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}
