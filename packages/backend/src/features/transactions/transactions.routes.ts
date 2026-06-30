import { Router } from 'express';
import { TransactionsController } from './transactions.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { authorize } from '../../shared/middleware/role-guard.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { createTransactionSchema, getTransactionByIdSchema, getTransactionsSchema } from './transactions.schema';

const router = Router();
const controller = new TransactionsController();

// All transactions routes require authentication
router.use(authenticate);

// Get all transactions - Cashier or Admin
router.get('/', authorize(['CASHIER', 'ADMIN']), validate(getTransactionsSchema), controller.getAll);

// Create transaction - Cashier or Admin
router.post('/', authorize(['CASHIER', 'ADMIN']), validate(createTransactionSchema), controller.create);

// Get transaction details - Cashier or Admin
router.get('/:id', authorize(['CASHIER', 'ADMIN']), validate(getTransactionByIdSchema), controller.getById);

// Get printable receipt (HTML) - Cashier or Admin
router.get('/:id/receipt', authorize(['CASHIER', 'ADMIN']), validate(getTransactionByIdSchema), controller.getReceipt);

export default router;
