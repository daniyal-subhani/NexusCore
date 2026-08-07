import { getDb } from '@/clients/mongo.clients.js';
import { randomUUID } from 'crypto';
import type { Message } from '@/types/conversations.js';

export const messageRepository = {
  async create(conversationId: string, senderId: string, content: string): Promise<Message> {
    const message: Message = {
      _id: randomUUID(),
      conversationId,
      senderId,
      content,
      createdAt: new Date(),
    };
    await getDb().collection<Message>('messages').insertOne(message);
    return message;
  },
  async findByConversation(conversationId: string, limit = 50): Promise<Message[]> {
    return getDb()
      .collection<Message>('messages')
      .find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  },
};
