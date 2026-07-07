import { Request, Response, NextFunction } from 'express';
import { TransactionsService } from './transactions.service';
import { logger } from '../../shared/utils/logger.util';
import { AuthenticatedRequest } from '../../shared/types/common.types';

export class TransactionsController {
  private service = new TransactionsService();

  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cashierId = req.user!.id;
      const transaction = await this.service.createTransaction(cashierId, req.body);
      
      logger.info('Transaction created successfully', {
        transactionId: transaction.id,
        code: transaction.transactionCode,
        cashierId,
      });

      res.status(201).json({
        success: true,
        data: { transaction },
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page as any;
      const limit = req.query.limit as any;
      const search = req.query.search as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      const data = await this.service.getAllTransactions({ page, limit, search, startDate, endDate });
      
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
      const data = await this.service.getTransactionById(req.params.id);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getReceipt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const html = await this.service.getReceiptHtml(req.params.id);
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(html);
    } catch (error) {
      next(error);
    }
  };

  updateOrderStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transaction = await this.service.updateOrderStatus(req.params.id, req.body.orderStatus);

      logger.info('Order status updated', {
        transactionId: transaction.id,
        code: transaction.transactionCode,
        orderStatus: req.body.orderStatus,
      });

      res.status(200).json({
        success: true,
        data: { transaction },
      });
    } catch (error) {
      next(error);
    }
  };

  payPending = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cashierId = req.user!.id;
      const transaction = await this.service.payPendingTransaction(req.params.id, cashierId, req.body);
      
      logger.info('Transaction paid/completed successfully', {
        transactionId: transaction.id,
        code: transaction.transactionCode,
        cashierId,
      });

      res.status(200).json({
        success: true,
        data: { transaction },
      });
    } catch (error) {
      next(error);
    }
  };
}
