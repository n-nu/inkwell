import { afterEach, describe, expect, jest, test } from '@jest/globals';

const mockLogger = {
  error: jest.fn(),
};

jest.unstable_mockModule('../../lib/logger.js', () => ({
  logger: mockLogger,
}));

const { errorHandler } = await import('../error-handler.js');
const { ValidationError } = await import('../../utils/validation.js');

function responseDouble() {
  return {
    statusCode: undefined,
    body: undefined,
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  jest.resetAllMocks();
  if (originalNodeEnv === undefined) {
    delete process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = originalNodeEnv;
  }
});

describe('errorHandler', () => {
  test('hides unexpected internal details in production', () => {
    process.env.NODE_ENV = 'production';
    const res = responseDouble();
    const error = new Error('sensitive database connection detail');
    error.stack = `${error.name}: ${error.message}\n at C:\\private\\server.js`;

    errorHandler(error, { method: 'GET', originalUrl: '/api/posts' }, res, () => {});

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred.',
      },
    });
    expect(JSON.stringify(res.body)).not.toContain('sensitive');
    expect(JSON.stringify(res.body)).not.toContain('private');
    expect(mockLogger.error).toHaveBeenCalledWith(
      { err: error, method: 'GET', path: '/api/posts' },
      'Request failed',
    );
  });

  test('preserves known validation responses', () => {
    const res = responseDouble();

    errorHandler(
      new ValidationError('Title is required.', 'INVALID_TITLE'),
      { method: 'POST', originalUrl: '/api/posts' },
      res,
      () => {},
    );

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toEqual({
      code: 'INVALID_TITLE',
      message: 'Title is required.',
    });
    expect(mockLogger.error).not.toHaveBeenCalled();
  });
});
