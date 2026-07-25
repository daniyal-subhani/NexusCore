import bcrypt from 'bcrypt';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { env } from '@/config/env.js';

const ACCESS_SECRET: Secret = env.JWT_ACCESS_SECRET;
const REFRESH_SECRET: Secret = env.JWT_REFRESH_SECRET;

const ACCESS_OPTIONS: SignOptions = {
  expiresIn: env.JWT_ACCESS_EXPIRY as SignOptions['expiresIn'],
};

const REFRESH_OPTIONS: SignOptions = {
  expiresIn: env.JWT_REFRESH_EXPIRY as SignOptions['expiresIn'],
};

//  PASSWORD UTILS -------

export const encryptPassword = async (password: string): Promise<string> => {
  const saltRounds = Number(env.BCRYPT_SALT_ROUNDS) || 12;
  return bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

//  JWT TYPES & UTILS

export interface AccessTokenPayload {
  sub: string; // userId
  email: string;
}
export interface RefreshTokenPayload {
  sub: string; // userId
  tokenId: string;
}

export const signAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, ACCESS_SECRET, ACCESS_OPTIONS);
};

export const signRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload, REFRESH_SECRET, REFRESH_OPTIONS);
};
// Token verifications throw errors on invalid/expired tokens. Catch them in your middleware/controller layer or handle specifically.
export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
};
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
};
