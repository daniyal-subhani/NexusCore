import { prisma } from '@/db/prisma.js';
import type { User } from '@prisma/client';

export const authRepository = {
  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },
  create(email: string, passwordHash: string): Promise<User> {
    return prisma.user.create({ data: { email, passwordHash } });
  },
  storeRefreshToken(token: string, userId: string, expiresAt: Date) {
    return prisma.refreshToken.create({ data: { token, userId, expiresAt } });
  },
  findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({ where: { token } });
  },
  revokeRefreshToken(token: string) {
    return prisma.refreshToken.update({ where: { token }, data: { revoked: true } });
  },
};
