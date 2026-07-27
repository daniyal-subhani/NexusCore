import {prisma} from "@/db/prisma.js";
import { Prisma } from '@prisma/client';
import { logger } from '@/utils/logger.js';
import { HttpError } from '@nexus-core/common';
import { encryptPassword, signAccessToken, 
  signRefreshToken,
  verifyPassword,
  verifyRefreshToken 
 } from '@/utils/logger.js';
import {
  LoginInput,
  RegisterInput
} from "@/validation/auth.schema.js";
import {
  AuthResponse,
  AuthTokens,
  AuthUserPayload
} from "@/types/auth.types.js";
import crypto from "crypto";

const REFRESH_TOKEN_TTL_DAYS = 30;
type PrismaTransactionClient = prisma.TransactionClient

// register a new user
export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  // chk if email already
  // exists
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email
    }
  })
  if(existingUser) {
    throw new HttpError(409, "User with this email already exists.")
  }

  const hashPassword = await encryptPassword(input.password);

  const createUser_Token = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: input.email,
        passwordHash: hashPassword
      },
    });
    const refreshTokenRecord = await createRefreshTokenInDB(createUser_Token.id, tx)

    return {};
  });
// token generation & DTO mapping
const accessToken = await signAccessToken({
  sub: user.id,
  email: user.email
})
const refreshToken = signRefreshToken({
  sub: 
})
}


// helper to persist refresh tokens to DB. supports transactional clients (`tx).
const createRefreshTokenInDB = async (
  userId: string,
  txClient?: PrismaTransactionClient
) => {
  const db = txClient || prisma;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);
  const tokenId = crypto.randomUUID();

  return await db.refreshToken.create({
    data: {
      userId,
      tokenId,
      expiresAt
    }
  })
};