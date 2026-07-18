import { logger } from '@/utils/logger.js';
import { HttpError } from '@nexus-core/common';
import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof HttpError) {
    logger.warn(
      {
        err,
        path: req.path,
      },
      'Handled operational client error',
    );
    return res.status(err.statusCode).json({
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }
  logger.error(
    {
      err: err instanceof Error ? { message: err.message, stack: err.stack } : err,
      path: req.path,
    },
    'Unhandled systemic failure',
  );
  return res.status(500).json({
    message: 'Internal Server Error',
  });
};
