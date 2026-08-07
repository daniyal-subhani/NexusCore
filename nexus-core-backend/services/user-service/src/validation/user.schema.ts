import { z } from '@nexus-core/common';

export const updateProfileSchema = {
  body: z.object({
    displayName: z.string().min(1).max(50).optional(),
    bio: z.string().max(280).optional(),
    avatarUrl: z.string().url().optional(),
  }),
};