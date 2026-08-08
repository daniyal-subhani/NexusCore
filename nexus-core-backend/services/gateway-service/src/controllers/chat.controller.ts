import { chatProxyService } from "@/services/chat-proxy.service.js";
import { USER_ID_HEADER } from "@nexus-core/common";
import type { Request, Response } from "express";

function getUserId(req: Request): string {
    return req.headers[USER_ID_HEADER] as string; // requireAuth ne already set kiya
}

export const chatController = {
    async createConversation(req: Request, res: Response) {
        const {status, data} = await chatProxyService.createConversation(getUserId(req), req.body);
        res.status(status).json(data)
    },
    async listConversations(req: Request, res:Response) {
        const {status, data} = await chatProxyService.listConversations(getUserId(req));
        res.status(status).json(data)
    },
    async sendMessage(req: Request, res:Response) {
        const {status, data} = await chatProxyService.sendMessage(getUserId(req), req.params.id as string, req.body)
        res.status(status).json(data)
    },
    async listMessages(req:Request, res:Response) {
        const {status, data}  = await chatProxyService.listMessages(getUserId(req), req.params.id as string);
        res.status(status).json(data)
    }
}