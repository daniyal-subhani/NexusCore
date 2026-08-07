import type { ErrorRequestHandler } from "express";
import { HttpError } from "@nexus-core/common";
import { logger } from "@/utils/logger.js";


export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
// 1. Expected Business / HTTP Errors (Custom HttpError)
if(err instanceof HttpError) {
  res.status(err.statusCode).json({
    statusCode: err.statusCode,
    message: err.message,
    ...(err.details && {details: err.details}),
    ...(process.env.NODE_ENV !== "production" && {stack: err.stack})
  });
  return;
}
// 2. Unecpected / Internal Server Errors (500)
// Internal errors ko strictly log karein
logger.error({err}, "Unhandled Internal Server Error");

// Client ko sanitized safe error bhein (No DB stack leaks in prod)
res.status(500).json({
  statusCode: 500,
  message: "Internal Server Error",
  ...(process.env.NODE_ENV !== "production" && {
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined
  })
})
}