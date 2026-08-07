import { z } from '@nexus-core/common';

export const createConversationSchema = {
  body: z.object({
    participantIds: z.array(z.string()).min(2),
  }),
};
