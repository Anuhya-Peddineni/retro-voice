import type { ErrorRequestHandler } from 'express';

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  const statusCode = typeof err?.statusCode === 'number' ? err.statusCode : 500;
  const message = err instanceof Error ? err.message : 'Internal Server Error';

  res.status(statusCode).json({
    error: {
      code: statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_FAILED',
      message,
    },
  });
};

