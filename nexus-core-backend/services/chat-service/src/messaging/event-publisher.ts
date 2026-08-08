import { publishEvent, MESSAGE_SENT_ROUTING_KEY, type MessageSentEvent } from '@nexus-core/common';
import type { Message } from '@/types/conversation.js';

export async function publishMessageSent(
  message: Message,
  allParticipantIds: string[],
): Promise<void> {
  const event: MessageSentEvent = {
    messageId: message._id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    receipentIds: allParticipantIds.filter((id) => id !== message.senderId),
    contentPreview: message.content.slice(0, 100),
    sentAt: message.createdAt.toISOString(),
  };
  await publishEvent(MESSAGE_SENT_ROUTING_KEY, event);
}
