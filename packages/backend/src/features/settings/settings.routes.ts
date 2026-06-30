import { Router } from 'express';
import multer from 'multer';
import { SettingsController } from './settings.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { authorize } from '../../shared/middleware/role-guard.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { authorizeGDriveSchema, updateStoreSettingsSchema } from './settings.schema';

const router = Router();
const controller = new SettingsController();
const upload = multer({ limits: { fileSize: 2 * 1024 * 1024 } }); // max 2MB

// Google Drive status - Admin only
router.get('/gdrive/status', authenticate, authorize(['ADMIN']), controller.getStatus);

// Google Drive authorize - Admin only
router.post('/gdrive/authorize', authenticate, authorize(['ADMIN']), validate(authorizeGDriveSchema), controller.authorize);

// Google Drive OAuth callback - Public
router.get('/gdrive/callback', controller.callback);

// Google Drive test connection - Admin only
router.post('/gdrive/test', authenticate, authorize(['ADMIN']), controller.test);

// Store Settings routes
// Both Admin and Cashier can view store settings (needed for printing receipts)
router.get('/store', authenticate, authorize(['ADMIN', 'CASHIER']), controller.getStoreSetting);

// Only Admin can update store settings
router.put('/store', authenticate, authorize(['ADMIN']), validate(updateStoreSettingsSchema), controller.updateStoreSetting);

// Only Admin can upload store logo
router.post('/store/logo', authenticate, authorize(['ADMIN']), upload.single('logo'), controller.uploadLogo);

export default router;
