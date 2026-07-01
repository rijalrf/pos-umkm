import { Router } from 'express';
import { TablesController } from './tables.controller';
import {
  createTableSchema,
  updateTableSchema,
  getTableByIdSchema,
  deleteTableSchema,
} from './tables.schema';
import { validate } from '../../shared/middleware/validate.middleware';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { authorize } from '../../shared/middleware/role-guard.middleware';

const router = Router();
const controller = new TablesController();

// Semua rute manajemen meja membutuhkan autentikasi dan role ADMIN
router.use(authenticate, authorize(['ADMIN']));

router.get('/', controller.getAll);
router.get('/:id', validate(getTableByIdSchema), controller.getById);
router.post('/', validate(createTableSchema), controller.create);
router.put('/:id', validate(updateTableSchema), controller.update);
router.delete('/:id', validate(deleteTableSchema), controller.delete);

export default router;
