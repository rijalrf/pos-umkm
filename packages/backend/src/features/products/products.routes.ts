import { Router } from 'express';
import multer from 'multer';
import { ProductsController } from './products.controller';
import { createProductSchema, updateProductSchema, deleteProductSchema, getProductsSchema, uploadProductImageSchema } from './products.schema';
import { validate } from '../../shared/middleware/validate.middleware';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { authorize } from '../../shared/middleware/role-guard.middleware';

const router = Router();
const controller = new ProductsController();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // max 5MB

// All routes require authentication and admin role
router.use(authenticate, authorize(['ADMIN']));

router.get('/', validate(getProductsSchema), controller.getAll);
router.get('/:id', controller.getById);
router.post('/', validate(createProductSchema), controller.create);
router.put('/:id', validate(updateProductSchema), controller.update);
router.delete('/:id', validate(deleteProductSchema), controller.delete);
router.post('/:id/upload-image', upload.single('image'), validate(uploadProductImageSchema), controller.uploadImage);

export default router;
