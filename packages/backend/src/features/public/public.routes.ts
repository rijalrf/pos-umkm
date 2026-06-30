import { Router } from 'express';
import { PublicController } from './public.controller';

const router = Router();
const controller = new PublicController();

// All public catalog endpoints are unauthenticated
router.get('/products', controller.getProducts);
router.get('/products/:id', controller.getProductById);
router.get('/categories', controller.getCategories);

export default router;
