import { conversationController } from "@/controllers/conversation.controller.js";
import { createConversationSchema } from "@/validation/conversation.schema.js";
import { asyncHandler, validateRequest } from "@nexus-core/common";
import { Router } from "express";

export const conversationRouter = Router();

