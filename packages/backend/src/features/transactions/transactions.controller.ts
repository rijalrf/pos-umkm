import { Request, Response, NextFunction } from 'express';
import { TransactionsService } from './transactions.service';
import { logger } from '../../shared/utils/logger.util';

export class TransactionsController {
  private service = new TransactionsService();

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
}
