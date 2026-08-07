import { conversationController } from '@/controllers/conversation.controller.js';
import { createConversationSchema } from '@/validation/conversation.schema.js';
import { asyncHandler, validateRequest } from '@nexus-core/common';
import { Router } from 'express';

export const conversationRouter = Router();

conversationRouter.post(
  '/',
  validateRequest(createConversationSchema),
  asyncHandler(conversationController.create),
);

conversationRouter.post('/user/:userId', asyncHandler(conversationController.listForUser));

conversationRouter.post('/:id/messages', asyncHandler(conversationController.sendMessage));

conversationRouter.get('/:id/messages', asyncHandler(conversationController.listMessages));
