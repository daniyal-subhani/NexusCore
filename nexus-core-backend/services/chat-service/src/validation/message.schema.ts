import { z } from '@nexus-core/common';

export const sendMessageSchema = {
  body: z.object({
    content: z.string().min(1).max(2000),
  }),
};
