import type {} from 'prisma';
import { prisma } from '@/db/prisma.js';
import { Prisma } from '@prisma/client';
import { logger } from '@/utils/logger.js';
import { HttpError } from '@nexus-core/common';
import {
  encryptPassword,
  signAccessToken,
  signRefreshToken,
  verifyPassword,
  verifyRefreshToken,
} from '@/utils/logger.js';
import { LoginInput, RegisterInput } from '@/validation/auth.schema.js';
import { AuthResponse, AuthTokens, AuthUserPayload } from '@/types/auth.types.js';
import crypto from 'crypto';

const REFRESH_TOKEN_TTL_DAYS = 30;
type PrismaTransactionClient = Prisma.TransactionClient;

// Register a new user
export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  // chk if email already
  // exists
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });
  if (existingUser) {
    throw new HttpError(409, 'User with this email already exists.');
  }

  const hashPassword = await encryptPassword(input.password);
  //  Atomic Database Writes (User + Refresh Token)
  const { user, refreshTokenRecord } = await prisma.$transaction(
    async (tx: PrismaTransactionClient) => {
      const createdUser = await tx.user.create({
        data: {
          email: input.email,
          passwordHash: hashPassword,
        },
      });
      // created user ki id pass ki  helper function ko
      const createdTokenRecord = await createRefreshTokenInDB(createdUser.id, tx);
      // transaction se dono records bahar return ker diye
      return {
        user: createdUser,
        refreshTokenRecord: createdTokenRecord,
      };
    },
  );

  // token generation & DTO mapping
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
  });

  const refreshToken = signRefreshToken({
    sub: user.id,
    tokenId: refreshTokenRecord.tokenId,
  });

  const userData: AuthUserPayload = {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  };

  return {
    accessToken,
    refreshToken,
    user: userData,
  };
};

// Login existing user
export const login = async (input: LoginInput): Promise<AuthTokens> => {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });
  if (!user) {
    throw new HttpError(401, 'Invalid Credientials.');
  }
  const isValidPassword = await verifyPassword(input.password, user.passwordHash);
  if (!isValidPassword) {
    throw new HttpError(401, 'Invalid Credientials.');
  }

  const refreshTokenRecord = await createRefreshTokenInDB(user.id);
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
  });
  const refreshToken = signRefreshToken({
    sub: user.id,
    tokenId: refreshTokenRecord.id,
  });

  return {
    accessToken,
    refreshToken,
  };
};

// rotate refresh token & issue a new Access Token
export const refreshToken = async (token: string): Promise<AuthTokens> => {
  const payload = verifyRefreshToken(token);

  const tokenRecord = await prisma.refreshToken.findUnique({
    where: {
      tokenId: payload.tokenId,
    },
  });
  if (!tokenRecord || tokenRecord.userId !== payload.sub) {
    throw new HttpError(401, 'Invalid refresh token.');
  }
  if (tokenRecord.expiresAt.getTime() < Date.now()) {
    throw new HttpError(401, 'Refresh token has expired.');
  }

  const user = await prisma.user.findUnique({
    where: {
      id: payload.sub,
    },
  });
  if (!user) {
    logger.warn({ userId: payload.sub }, 'User missing for valid refresh token session');
    throw new HttpError(401, 'Invalid refresh token.');
  }
  // token rotation: old token delete karo aur naya generate karo
  await prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
  const newTokenRecord = await createRefreshTokenInDB(user.id);

  return {
    accessToken: signAccessToken({ sub: user.id, email: user.email }),
    refreshToken: signRefreshToken({ sub: user.id, tokenId: newTokenRecord.tokenId }),
  };
};

// revoke all active sessions for a user (logout all devices)
export const revokeRefreshToken = async (userId: string): Promise<void> => {
  await prisma.refreshToken.deleteMany({
    where: {
      userId,
    },
  });
};

// helper to persist refresh tokens to DB. supports transactional clients (`tx).
const createRefreshTokenInDB = async (userId: string, txClient?: PrismaTransactionClient) => {
  const db = txClient || prisma;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);
  const tokenId = crypto.randomUUID();

  return await db.refreshToken.create({
    data: {
      userId,
      tokenId,
      expiresAt,
    },
  });
};
