import { Router } from 'express';
import { asyncHandler, validateRequest } from '@nexus-core/common';
import { userController } from '@/controllers/user.controller.js';
import { updateProfileSchema } from '@/validation/user.schema.js';

export const userRouter = Router();

userRouter.get('/:id', asyncHandler(userController.getProfile));
userRouter.patch('/:id', validateRequest(updateProfileSchema), asyncHandler(userController.updateProfile));