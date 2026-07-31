import { HttpError } from "../errors/http-error.js";
import type {RequestHandler} from "express";

export interface InternalAuthOptions {
    headerName?: string;
    examptPaths?: string[];
}

const DEFAULT_HEADER_NAME = "x-internal-token";

export const createInternalAuthMiddleware = (
    expectedToken: string,
    options: InternalAuthOptions = {},
): RequestHandler => {
    const headerName = (options.headerName ?? DEFAULT_HEADER_NAME).toLowerCase();
    const examptPaths = new Set(options.examptPaths ?? []);

    return (req, _res, next) => {
        // Check both req.path and req.originalUrl for safety
        if(examptPaths.has(req.path) || examptPaths.has(req.originalUrl)) {
            return next();
        }

        const provided = req.headers[headerName];
        const token = Array.isArray(provided) ? provided[0] : provided;

        if(typeof token !== 'string' || token !== expectedToken) {
            return next(new HttpError(401, 'Unauthorized: Invalid internal service token'))
        }
        next();
    }
}