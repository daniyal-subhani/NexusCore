import { authController } from '@/controllers/auth.controller.js';
import {Router} from "express";
import {validateRequest} from "@nexus-core/common";
// import {registerSchema, loginSchema} from "@/validation/auth.schema";
import {
    loginSchema,
    refreshSchema,
    registerSchema,
    revokeSchema
} from "@/routes/auth.schema.js";

export const authRouter: Router = Router();

authRouter.post('/register', validateRequest(registerSchema), authController.register)
authRouter.post('/login', validateRequest(loginSchema), authController.login)
authRouter.post('/refresh', validateRequest(refreshSchema), authController.refresh)
authRouter.post("/revoke", validateRequest(revokeSchema), authController.revoke)