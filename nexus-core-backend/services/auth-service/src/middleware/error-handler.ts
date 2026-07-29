import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { HttpError } from '@nexus-core/common';
import { ZodError } from 'zod';
import { logger } from '@/utils/logger.js';

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // zod validation error handling (dad request - 400)
  if (err instanceof ZodError) {
    res.status(400).json({
      statusCode: 400,
      message: 'Validation Error',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return; // response bhej kar return ho jao!
  }

  // 2. custom business/HTTP Error Handling (4xx - 409, 401, 404, etc.)
  if(err instanceof HttpError || "statusCode" in err) {
    const statusCode = (err as HttpError).statusCode || 400;
    res.status(statusCode).json({
        statusCode,
        message: err.message,
        ...(process.env.NODE_ENV !== "production" && {stack: err.stack}),
    });
    return;
  }

  // unknown / unexpected server errors (500)
  // internal errors ko log zaroor karo par user ko details mat dikhao (Security)
  logger.error({err}, "Unhandled Internal Server Error");

  res.status(500).json({
    statusCode: 500,
    ...(process.env.NODE_ENV !== "production" && {details: err.message})
  });
};
