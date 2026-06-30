import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { getReportSchema } from './reports.schema';
import { validate } from '../../shared/middleware/validate.middleware';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { authorize } from '../../shared/middleware/role-guard.middleware';

const router = Router();
const controller = new ReportsController();

// All routes require authentication and admin role
router.use(authenticate, authorize(['ADMIN']));

router.get('/sales', validate(getReportSchema), controller.getReportData);
router.get('/sales/export/csv', validate(getReportSchema), controller.exportCSV);
router.get('/sales/export/pdf', validate(getReportSchema), controller.exportPDF);

export default router;
