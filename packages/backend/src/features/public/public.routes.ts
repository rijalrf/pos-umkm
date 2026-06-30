import { Router } from 'express';
import { PublicController } from './public.controller';
import { validate } from '../../shared/middleware/validate.middleware';
import { publicCheckoutSchema } from './public.schema';

const router = Router();
const controller = new PublicController();

// All public catalog endpoints are unauthenticated
router.get('/products', controller.getProducts);
router.get('/products/:id', controller.getProductById);
router.get('/categories', controller.getCategories);
router.post('/checkout', validate(publicCheckoutSchema), controller.checkout);

export default router;
