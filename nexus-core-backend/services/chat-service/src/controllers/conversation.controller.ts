import type { Request, Response } from 'express';
import { conversationService } from '@/services/conversation.service.js';
import { messageService } from '@/services/message.service.js';
import { HttpError, USER_ID_HEADER } from '@nexus-core/common';


function getUserId(req:Request):string {
  const userId = req.headers[USER_ID_HEADER];
  if(!userId || typeof userId !== 'string') {
    throw new HttpError(401, 'Missing authenticated user context')
  }
  return userId;
}


export const conversationController = {
  async create(req: Request, res: Response) {
    const conversation = await conversationService.create(req.body.participantIds);
    res.status(201).json(conversation);
  },
  async listForUser(req: Request, res: Response) {
    const conversations = await conversationService.listForUser(req.params.userId as string);
    res.status(201).json(conversations);
  },
  async sendMessage(req: Request, res:Response) {
    const { content} = req.body; 
    const senderId = getUserId(req); // ab header se, spoof-proof
    const message = await messageService.send(req.params.id as string , senderId, content);
    res.status(201).json(message);
  },
  async listMessages(req: Request, res: Response) {
    const messages = await messageService.list(req.params.id as string);
    res.status(200).json(messages);
  },
};
