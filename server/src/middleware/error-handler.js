import {
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
  WeakPasswordError,
} from '../services/auth.service.js';
import { ValidationError } from '../utils/validation.js';
import { logger } from '../lib/logger.js';

const knownClientErrors = new Map([
  [EmailAlreadyRegisteredError, 400],
  [InvalidCredentialsError, 401],
  [WeakPasswordError, 400],
  [ValidationError, 400],
]);

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const knownStatus = [...knownClientErrors]
    .find(([ErrorType]) => error instanceof ErrorType)?.[1];
  const status = knownStatus
    || (Number.isInteger(error.statusCode) && error.statusCode >= 400 && error.statusCode <= 599
      ? error.statusCode
      : Number.isInteger(error.status) && error.status >= 400 && error.status <= 599
        ? error.status
        : 500);
  const isInternalError = status >= 500;

  if (isInternalError) {
    logger.error(
      { err: error, method: req.method, path: req.originalUrl },
      'Request failed',
    );
  }

  return res.status(status).json({
    error: {
      code: isInternalError ? 'INTERNAL_ERROR' : error.code || 'REQUEST_ERROR',
      message: isInternalError ? 'An unexpected error occurred.' : error.message,
    },
  });
}
