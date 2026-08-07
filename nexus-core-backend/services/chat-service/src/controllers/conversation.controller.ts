import type { Request, Response } from "express";
import { conversationService } from "@/services/conversation.service.js";
import { messageService } from "@/services/message.service.js";

export const conversationController = {
    async create(req: Request, res:Response) {
        const conversation = await conversationService.create(req.body.participantIds);
        res.status(201).json(conversation)
    },
    async listForUser(req: Request, res:Response) {
        const conversations = await conversationService.listForUser(req.params.userId as string)
        res.status(201).json(conversations);
    },
    
}