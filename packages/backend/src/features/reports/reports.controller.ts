import { Request, Response, NextFunction } from 'express';
import { ReportsService } from './reports.service';

export class ReportsController {
  private service = new ReportsService();

  getReportData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      const reportData = await this.service.getReportData(startDate, endDate);

      res.status(200).json({
        success: true,
        data: reportData,
      });
    } catch (error) {
      next(error);
    }
  };

  exportCSV = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      const rawTransactions = await this.service.getRawTransactions(startDate, endDate);
      const csvContent = this.service.generateCSV(rawTransactions);

      const filename = `sales-report-${startDate || 'all'}-to-${endDate || 'all'}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(csvContent);
    } catch (error) {
      next(error);
    }
  };

  exportPDF = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      const reportData = await this.service.getReportData(startDate, endDate);
      const pdfHtml = this.service.generatePDFHtml(reportData, startDate, endDate);

      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(pdfHtml);
    } catch (error) {
      next(error);
    }
  };
}
