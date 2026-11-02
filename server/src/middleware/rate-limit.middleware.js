import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    error: {
      code: 'TOO_MANY_ATTEMPTS',
      message: 'Too many attempts. Try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
