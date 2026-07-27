import { RefreshTokenPayload } from './../utils/token';
import { prisma } from '@/db/prisma.js';
import { logger } from '@/utils/logger.js';
import { HttpError } from '@nexus-core/common';
import {
  encryptPassword,
  signAccessToken,
  signRefreshToken,
  verifyPassword,
  verifyAccessToken,
  verifyRefreshToken,
} from '@/utils/token.js';
import { RegisterInput, LoginInput } from '@/validation/auth.schema.js';
import { AuthResponse, AuthTokens, AuthUserPayload } from '@/types/auth.types.js';

const REFRESH_TOKEN_TTL_DAYS = 30;

// Register a new user:
export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  // check if email exist??
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });
  if (existingUser) {
    throw new HttpError(409, 'User with this email already exists');
  }
  // encrypt password
  const passwordHash = await encryptPassword(input.password);
  // Interactive Prisma Transaction (User + Refresh Token entry)
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: input.email,
        passwordHash,
      },
    });
    const addRefreshTokenRecord = await createRefreshTokenInDB(user.id, tx);
    return { user, addRefreshTokenRecord };
  });
  const User = result?.user;
  const refreshTokenRecord = result?.refreshTokenRecord;
  // generate JWT tokens
  const accessToken = signAccessToken({ sub: user.id, email: user.email });
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

export const login = async (input: LoginInput): Promise<AuthTokens> => {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email
    }
  });
  if(!user) {
    throw new HttpError(401, "Invalid credentials");
  }

  // verify password
  const isValidPassword = await verifyPassword(input.password, user.passwordHash)
  if(!isValidPassword) {
    throw new HttpError(401, "Invalid Credientials")
  }
  // create refresh token record & sign JWTs
  const refreshTokenRecord = await createRefreshTokenInDB(user.id);
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email
  });
  const refreshToken = signRefreshToken({
    sub: user.id,
    tokenId: refreshTokenRecord.tokenId
  });
  return {
    accessToken,
    refreshToken
  }
};

// rotate refresh token & issue a new access token
export const refreshTokens = async (token: string): Promise<AuthTokens> => {
  // verify refresh token jwt signature
  const payload = verifyRefreshToken(token);
  //  find matching record in DB
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: {
      tokenId: payload.tokenId
    }
  });
  if(!tokenRecord || tokenRecord.userId !== payload.sub) {
    throw new HttpError(401, "Invalid refresh token")
  }
  //  check token expiry
  if(tokenRecord.expiresAt.getTime() < Date.now()) {
    await prisma.refreshToken.delete({
      where: {
        id: tokenRecord.id
      }
    });
    throw new HttpError(401, "Refresh token has expired")
  }
  //  Find associated User
  const user = await prisma.user.findUnique({
    where: {id: payload.sub}
  });
  if(!user) {
    logger.warn({userId: payload.sub}, "User missing for valid refresh token")
    throw new HttpError(401, "Invalid refresh token");
  }
  // token rotation: purana DB record delete karke naya create karo
  await prisma.refreshToken.delete({where: {id: tokenRecord.id} });
  const newTokenRecord = await createRefreshTokenInDB(user.id);

  return {
    accessToken: signAccessToken({sub: user.id, email: user.email}),
    refreshToken: signRefreshToken({sub: user.id, tokenId: newTokenRecord.tokenId}),
  }
};

// revoke all active sessions/refresh tokens for a user (logout all devices)
export const revokeRefreshToken = async(userId: string): Promise<void> => {
  await prisma.refreshToken.deleteMany({
    where: {userId}
  })
}

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

type PrismaTransactionClient = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$transaction' | '$on' | '$use' | '$extends'
>;
