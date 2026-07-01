import { Request, Response, NextFunction } from 'express';
import { CustomersService } from './customers.service';

export class CustomersController {
  private service = new CustomersService();

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.register(req.body);
      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.query.token as string;
      await this.service.verifyEmail(token);
      res.status(200).json({
        success: true,
        message: 'Email verified successfully. You can now login.',
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authData = await this.service.login(req.body);
      res.status(200).json({
        success: true,
        data: authData,
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Standard auth middleware places verified token payload in req.user
      const customerId = (req as any).user?.id;
      const profile = await this.service.getProfile(customerId);
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  };

  getMyTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = (req as any).user?.id;
      const transactions = await this.service.getMyTransactions(customerId);
      res.status(200).json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  };

  searchByPhone = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const phone = req.query.phone as string;
      if (!phone) {
        res.status(400).json({ success: false, message: 'Nomor HP wajib diisi untuk melakukan pencarian!' });
        return;
      }
      const customer = await this.service.findByPhone(phone);
      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  };

  listAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const customers = await this.service.listAll();
      res.status(200).json({
        success: true,
        data: customers,
      });
    } catch (error) {
      next(error);
    }
  };
}
