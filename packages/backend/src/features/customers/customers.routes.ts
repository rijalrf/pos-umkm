import { Router } from 'express';
import { CustomersController } from './customers.controller';
import { registerCustomerSchema, loginCustomerSchema, verifyEmailSchema } from './customers.schema';
import { validate } from '../../shared/middleware/validate.middleware';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { authorize } from '../../shared/middleware/role-guard.middleware';

const router = Router();
const controller = new CustomersController();

// Public routes
router.post('/register', validate(registerCustomerSchema), controller.register);
router.get('/verify-email', validate(verifyEmailSchema), controller.verifyEmail);
router.post('/login', validate(loginCustomerSchema), controller.login);

// Private customer routes
router.get('/me', authenticate, controller.getProfile);
router.get('/transactions', authenticate, controller.getMyTransactions);

// Cashier / Admin customer lookup routes
router.get('/search', authenticate, authorize(['CASHIER', 'ADMIN']), controller.searchByPhone);
router.get('/', authenticate, authorize(['CASHIER', 'ADMIN']), controller.listAll);

export default router;
