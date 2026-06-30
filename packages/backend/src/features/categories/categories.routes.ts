import { Router } from 'express';
import { CategoriesController } from './categories.controller';
import { createCategorySchema, updateCategorySchema, deleteCategorySchema } from './categories.schema';
import { validate } from '../../shared/middleware/validate.middleware';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { authorize } from '../../shared/middleware/role-guard.middleware';

const router = Router();
const controller = new CategoriesController();

// All routes require authentication and admin role
router.use(authenticate, authorize(['ADMIN']));

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', validate(createCategorySchema), controller.create);
router.put('/:id', validate(updateCategorySchema), controller.update);
router.delete('/:id', validate(deleteCategorySchema), controller.delete);

export default router;
