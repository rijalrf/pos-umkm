import { Router } from 'express';
import { AuthController } from './auth.controller';
import { loginSchema } from './auth.schema';
import { validate } from '../../shared/middleware/validate.middleware';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();
const controller = new AuthController();

router.post('/login', validate(loginSchema), controller.login);
router.get('/me', authenticate, controller.getMe);
router.post('/logout', authenticate, controller.logout);

export default router;
