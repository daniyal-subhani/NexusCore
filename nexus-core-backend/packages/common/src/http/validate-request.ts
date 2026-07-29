import {z} from "zod";
import { HttpError } from "../errors/http-error.js";
import type { NextFunction, Request, Response } from "express";
import {ZodObject, ZodError, ZodType} from "zod";
import {AnyZodObject} from "zod";

type Schema = AnyZodObject | ZodType;
type ParamsRecord = Record<string, string>;
type QueryRecord = Record<string, unknown>;

export interface RequestValidationsSchemas {
    body?: Schema;
    params?: Schema,
    query?: Schema
}

const formatError = (error: ZodError)=> error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message
}));

export const validateRequest = (schemas: RequestValidationsSchemas) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        try {
            if(schemas.body) {
                const parsedBody = schemas.body.parse(req.body) as unknown;
                req.body = parsedBody;
            }
            if(schemas.params) {
                const parsedParams = schemas.params.parse(req.params) as ParamsRecord;
                req.params = parsedParams as Request["params"]
            }
            if(schemas.query) {
                const parsedQuery = schemas.query.parse(req.query) as QueryRecord;
                req.query = parsedQuery as Request["query"];
            }
            next();
        } catch (error) {
            if(error instanceof ZodError) {
                next(
                    new HttpError(422, "Validation Error", {
                        issues: formatError(error),
                    })
                )
                return;
            }
            next(error)
        }
    }
}