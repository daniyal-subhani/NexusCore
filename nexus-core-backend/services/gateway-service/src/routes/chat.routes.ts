import { Router } from 'express';
import { asyncHandler, validateRequest } from '@nexus-core/common';
import { requireAuth } from '@/middleware/require-auth.js';
import { chatController } from '@/controllers/chat.controller.js';
import { createConversationSchema, sendMessageSchema } from '@/validation/chat.schema.js';

export const chatRouter = Router();

chatRouter.use(requireAuth); // ← poori router ke liye — sab chat routes authentication maangte hain

chatRouter.post('/', validateRequest(createConversationSchema), asyncHandler(chatController.createConversation));
chatRouter.get('/', asyncHandler(chatController.listConversations));
chatRouter.post('/:id/messages', validateRequest(sendMessageSchema), asyncHandler(chatController.sendMessage));
chatRouter.get('/:id/messages', asyncHandler(chatController.listMessages));