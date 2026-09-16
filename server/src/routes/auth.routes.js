import express from 'express';
import AuthService, {
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
  WeakPasswordError,
} from '../services/auth.service.js';

const router = express.Router();
const authService = new AuthService();

function sendError(res, error) {
  if (error instanceof InvalidCredentialsError) {
    return res.status(401).json({ error: { code: error.code, message: error.message } });
  }
  if (error instanceof EmailAlreadyRegisteredError || error instanceof WeakPasswordError) {
    return res.status(400).json({ error: { code: error.code, message: error.message } });
  }
  if (error.code && error.message && error.name === 'ValidationError') {
    return res.status(400).json({ error: { code: error.code, message: error.message } });
  }
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } });
}

router.post('/auth/register', async (req, res) => {
  try {
    const result = await authService.register(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return sendError(res, error);
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const result = await authService.login(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return sendError(res, error);
  }
});

export default router;