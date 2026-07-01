import { Request, Response, NextFunction } from 'express';
import { TablesService } from './tables.service';
import { TableQuery } from './tables.types';

export class TablesController {
  private service = new TablesService();

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query: TableQuery = {
        status: req.query.status as string,
        search: req.query.search as string,
      };
      const data = await this.service.getAllTables(query);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getTableById(req.params.id);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.createTable(req.body);
      res.status(201).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.updateTable(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.deleteTable(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Meja berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  };
}
