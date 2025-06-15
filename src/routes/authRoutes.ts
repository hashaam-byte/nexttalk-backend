import { Router, Request, Response } from 'express';
import * as authController from '../controllers/authController';
import { handleAsync } from '../utils/errorHandler';

const router = Router();

router.post('/login', handleAsync(authController.login));
router.post('/register', handleAsync(authController.register));
router.post('/forgot-password', handleAsync(authController.forgotPassword));
router.post('/reset-password', handleAsync(authController.resetPassword));
router.get('/me', handleAsync(authController.getCurrentUser));

export default router;
