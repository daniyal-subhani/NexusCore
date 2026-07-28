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
export const login = async (input: LoginInput): Promise<AuthTokens> =>{
  const user = await prisma.user.findUnique({
    where: {
      email: input.email
    }
  });
  if(!user){
    throw new HttpError(409, "Invalid Credientials.")
  }
  const isValidPassword = await verifyPassword(input.password, user.passwordHash);
}

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
