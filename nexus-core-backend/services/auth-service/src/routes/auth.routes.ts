import { authController } from '@/controllers/auth.controller.js';
import {Router} from "express";
import {asyncHandler, validateRequest} from "@nexus-core/common";
import {registerSchema, loginSchema} from "@/validation/auth.schema";

export const authRouter = Router();

authRouter.post('/register', validateRequest(registerSchema), asyncHandler(authController.register))
authRouter.post('/login', validateRequest(loginSchema), asyncHandler(authController.login))
authRouter.post('/refresh', asyncHandler(authController.refresh))
