import { Router } from 'express';
import { UsersController } from './users.controller';
import { createUserSchema, updateUserSchema, deleteUserSchema, changePasswordSchema } from './users.schema';
import { validate } from '../../shared/middleware/validate.middleware';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { authorize } from '../../shared/middleware/role-guard.middleware';

const router = Router();
const controller = new UsersController();

// Change password endpoint is accessible by any authenticated user (ADMIN or CASHIER)
router.post('/change-password', authenticate, validate(changePasswordSchema), controller.changePassword);
router.put('/profile', authenticate, controller.updateProfile);

// All other CRUD routes are restricted to ADMIN only
router.get('/', authenticate, authorize(['ADMIN']), controller.getAll);
router.get('/:id', authenticate, authorize(['ADMIN']), validate(updateUserSchema), controller.getById);
router.post('/', authenticate, authorize(['ADMIN']), validate(createUserSchema), controller.create);
router.put('/:id', authenticate, authorize(['ADMIN']), validate(updateUserSchema), controller.update);
router.delete('/:id', authenticate, authorize(['ADMIN']), validate(deleteUserSchema), controller.delete);

export default router;
