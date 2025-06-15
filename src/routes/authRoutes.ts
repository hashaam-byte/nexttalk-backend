import { Router } from 'express';
import * as authController from '../controllers/authController';
import { handleAsync } from '../utils/errorHandler';

const router = Router();

// Convert controller responses to void
const wrapController = (fn: Function) => handleAsync(async (req, res, _next) => {
  await fn(req, res);
});

router.post('/login', wrapController(authController.login));
router.post('/register', wrapController(authController.register));
router.post('/forgot-password', wrapController(authController.forgotPassword));
router.post('/reset-password', wrapController(authController.resetPassword));
router.get('/me', wrapController(authController.getCurrentUser));

export default router;
