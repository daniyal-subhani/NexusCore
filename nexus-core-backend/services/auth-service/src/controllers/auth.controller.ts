import { asyncHandler, HttpError } from "@nexus-core/common";
import * as authService from "@/services/auth.service.js";
import type {
    LoginInput, RefreshInput, RegisterInput, RevokeInput
} from "@/validation/auth.schema.js";



export const authController = {
    // user registration handler
    register: asyncHandler(async (req, res) => {
        // middleware pehle hi zod schema se body validate kar chuka hota hai
        const tokens = await authService.register(req.body as RegisterInput);
        res.status(201).json(tokens);
    }),

    // user login handler
    login: asyncHandler(async (req, res) => {
        const tokens = await authService.login(req.body as LoginInput)
        res.status(200).json(tokens)
    }),

    // refresh token handler 
    refresh: asyncHandler(async (req, res) => {
        const {refreshToken} = req.body as RefreshInput;
        if(!refreshToken) {
            throw new HttpError(400, "Refresh token is required");
        }

        const tokens =await authService.refreshTokens(refreshToken);
        res.status(200).json(tokens)
    }),

    // revoke user tokens (global logout)
    revoke: asyncHandler(async(req, res) => {
        const {userId} = req.body as RevokeInput;
        if(!userId) {
            throw new HttpError(400, "User ID is required")
        }
        await authService.revokeRefreshToken(userId);
        res.status(204).send()
    })
}