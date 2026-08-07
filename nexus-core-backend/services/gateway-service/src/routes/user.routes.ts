import { userController } from '@/controllers/user.controller.js';
import { asyncHandler } from '@nexus-core/common';
import { Router } from 'express';

export const userRouter = Router();

userRouter.get('/:id', asyncHandler(userController.getProfile));
userRouter.patch('/:id', asyncHandler(userController.updateProfile));
