import { RequestHandler } from "express";
import { asyncHandler, HttpError } from "@nexus-core/common";
import{
    register,
    login,
    refreshTokens,
    revokeRefreshToken
} from "@/services/auth.service.js";
import { RegisterInput, LoginInput } from "@/validation/auth.schema.js";

export const authController = {
    // user registration handler
    register: asyncHandler(async (req, res) => {
        // middleware pehle hi zod schema se body validate kar chuka hota hai
        const result = await register(req.body as RegisterInput);
        res.status(201).json(result);
    }),

    // user login handler
    login: asyncHandler(async (req, res) => {
        const result = await login(req.body as LoginInput)
        res.status(201).json(result)
    }),

    // refresh token handler 
    refresh: asyncHandler(async (req, res) => {
        const {refreshToken} = req.body;
        if(!refreshToken) {
            throw new HttpError(400, "Refresh token is required");
        }

        const tokens =await refreshTokens(refreshToken);
        res.status(200).json(tokens)
    }),

    // revoke user tokens (global logout)
    revoke: asyncHandler(async(req, res) => {
        const {userId} = req.body;
        if(!userId) {
            throw new HttpError(400, "User ID is required")
        }
        await revokeRefreshToken(userId);
        res.status(204).send()
    })
}