// services/gateway-service/src/validation/chat.schema.ts
import { z } from '@nexus-core/common';

export const createConversationSchema = {
  body: z.object({ participantIds: z.array(z.string()).min(2) }),
};

export const sendMessageSchema = {
  body: z.object({ content: z.string().min(1).max(2000) }),
};