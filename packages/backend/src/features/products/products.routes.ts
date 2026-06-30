import { Router } from 'express';
import { ProductsController } from './products.controller';
import { createProductSchema, updateProductSchema, deleteProductSchema, getProductsSchema } from './products.schema';
import { validate } from '../../shared/middleware/validate.middleware';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { authorize } from '../../shared/middleware/role-guard.middleware';

const router = Router();
const controller = new ProductsController();

// All routes require authentication and admin role
router.use(authenticate, authorize(['ADMIN']));

router.get('/', validate(getProductsSchema), controller.getAll);
router.get('/:id', controller.getById);
router.post('/', validate(createProductSchema), controller.create);
router.put('/:id', validate(updateProductSchema), controller.update);
router.delete('/:id', validate(deleteProductSchema), controller.delete);

export default router;
