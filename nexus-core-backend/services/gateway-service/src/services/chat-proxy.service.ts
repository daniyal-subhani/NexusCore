import axios from 'axios';
import { HttpError, USER_ID_HEADER } from '@nexus-core/common';
import { env } from '@/config/env.js';

const chatClient = axios.create({ baseURL: env.CHAT_SERVICE_URL, timeout: 5000 });

export const chatProxyService = {
  async createConversation(userId: string, body: unknown) {
    return forward('post', '/conversations', userId, body);
  },
  async listConversations(userId: string) {
    return forward('get', '/conversations/user/' + userId, userId);
  },
  async sendMessage(userId: string, conversationId: string, body: unknown) {
    return forward('post', `/conversations/${conversationId}/messages`, userId, body);
  },
  async listMessages(userId: string, conversationId: string) {
    return forward('get', `/conversations/${conversationId}/messages`, userId);
  },
};

async function forward(method: 'get' | 'post', path: string, userId: string, body?: unknown) {
  try {
    const response = await chatClient.request({
      method,
      url: path,
      data: body,
      headers: { [USER_ID_HEADER]: userId }, // ← verified identity, forwarded
    });
    return { status: response.status, data: response.data };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new HttpError(
        error.response.status,
        error.response.data?.message ?? 'Chat service error',
        error.response.data?.details,
      );
    }
    throw new HttpError(503, 'Chat service is currently unavailable');
  }
}
