import { asyncHandler, validateRequest } from '@nexus-core/common';
import { Router } from 'express';

import {
  loginUser,
  refreshTokens,
  registerUser,
  revokeTokens,
} from '@/controllers/authy.controller.js';
import { loginSchema, refreshSchema, registerSchema, revokeSchema } from '@/validation/auth.schema.js';

export const authRouter: Router = Router();

authRouter.post('/register', validateRequest(registerSchema), asyncHandler(registerUser));
authRouter.post('/login', validateRequest(loginSchema), asyncHandler(loginUser));
authRouter.post('/refresh', validateRequest(refreshSchema), asyncHandler(refreshTokens));
authRouter.post('/revoke', validateRequest(revokeSchema), asyncHandler(revokeTokens));
