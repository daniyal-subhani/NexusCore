import { env } from "@/config/env.js";
import { HttpError, USER_ID_HEADER } from "@nexus-core/common";
import type { Request,Response, NextFunction } from "express";
import jwt from "jsonwebtoken"


interface AccessTokenPayload {
    sub:string;
    email: string;
}

export function requireAuth(req: Request, _res:Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if(!authHeader?.startsWith("Bearer ")) {
        return next(new HttpError(401, "Missing or malformed Authorization header"))
    }
    const token = authHeader.slice("Bearer ".length);

    try {
        const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
        // downstream service ke liye header set karo - WOH tokens verify nahi karenge, gateway ne already ker diya
        req.headers[USER_ID_HEADER] = payload.sub;
        next();
    } catch  {
        next(new HttpError(401, "Invalid or expired access token"))
    }
}