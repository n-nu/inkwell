import express from 'express';
import AuthService from '../services/auth.service.js';
import { authRateLimiter } from '../middleware/rate-limit.middleware.js';

const router = express.Router();
const authService = new AuthService();

router.post('/auth/register', authRateLimiter, async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
});

router.post('/auth/login', authRateLimiter, async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
});

export default router;