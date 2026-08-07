import { prisma } from '../db/prisma.js';
import type { UserProfile } from '@/generated/prisma/client.js';

export const userRepository = {
  findById(id: string): Promise<UserProfile | null> {
    return prisma.userProfile.findUnique({
      where: { id },
    });
  },
  create(id: string, email: string): Promise<UserProfile> {
    return prisma.userProfile.create({ data: { id, email } });
  },
  update(
    id: string,
    data: Partial<Pick<UserProfile, 'displayName' | 'bio' | 'avatarUrl'>>,
  ): Promise<UserProfile> {
    return prisma.userProfile.update({
      where: { id },
      data,
    });
  },
};
