import { conversationRepository } from '@/repositories/conversation.repository.js';
import { messageRepository } from '@/repositories/message.repository.js';
import { HttpError } from '@nexus-core/common';

export const messageService = {
  async send(conversationId: string, senderId: string, content: string) {
    const conversation = await conversationRepository.findById(conversationId);
    if (!conversation) throw new HttpError(404, 'Conversation not found');
    if (!conversation.participantIds.includes(senderId)) {
      throw new HttpError(403, 'You are not a participant in this conversation');
    }
    return messageRepository.create(conversationId, senderId, content);
  },
  async list(conversationId: string) {
    return messageRepository.findByConversation(conversationId);
  },
};
