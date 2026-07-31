import type { Request, Response, NextFunction, RequestHandler } from 'express';
export type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

// wraps async express route handlers to catch errors and forwerd them to next()

export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
