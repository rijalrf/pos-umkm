import { Router } from 'express';
import { SettingsController } from './settings.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { authorize } from '../../shared/middleware/role-guard.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { authorizeGDriveSchema } from './settings.schema';

const router = Router();
const controller = new SettingsController();

// Google Drive status - Admin only
router.get('/gdrive/status', authenticate, authorize(['ADMIN']), controller.getStatus);

// Google Drive authorize - Admin only
router.post('/gdrive/authorize', authenticate, authorize(['ADMIN']), validate(authorizeGDriveSchema), controller.authorize);

// Google Drive OAuth callback - Public
router.get('/gdrive/callback', controller.callback);

// Google Drive test connection - Admin only
router.post('/gdrive/test', authenticate, authorize(['ADMIN']), controller.test);

export default router;
