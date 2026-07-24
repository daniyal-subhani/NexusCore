import bcrypt from 'bcrypt';
import { HttpError } from '@nexus-core/common';
import { authRepository } from '@repositories/auth.repository.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/utils/token';
import type { RegisterInput, LoginInput } from '@/validation/auth.schema';

const SALT_ROUNDS = 12;

export const authService = {
  async register(input: RegisterInput) {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) {
      throw new HttpError(409, 'An account with this email already exists');
    }
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await authRepository.create(input.email, passwordHash);

    return issueTokenPair(user.id, user.email);
  },
  async login(input: LoginInput) {
    const user = await authRepository.findByEmail(input.email);
    if(!user) {
        throw new HttpError(401, "Invalid email or password")
    }
    const isValid = await bcrypt.compare(input.password, user.passwordHash)
    if(!isValid) {
        throw new HttpError(401, "Invalid email or password")
    }
    return issueTokenPair(user.id, user.email)
  },
  async refresh(refreshToken: string){
    let payload;
    try {
        payload = verifyRefreshToken(refreshToken)
    } catch  {
        throw new HttpError(401, "Invalid or expired refresh token")
    }
    const stored = await authRepository.findRefreshToken(refreshToken);
    if(!stored || stored.revoked || stored.expiresAt < new Date()) {
        throw new HttpError(401, "Refresh token is no longer valid")
    }
    // rotate: revoke the old one, issue a brand new pair
    await authRepository.revokeRefreshToken(refreshToken);
    return issueTokenPair(payload.sub, payload.email)
  }
};


const issueTokenPair = async (userId: string, email:string) => {
  const accessToken = signAccessToken({sub: userId, email});
  const refreshToken = signRefreshToken({sub: userId, email})

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7)
  await authRepository.storeRefreshToken(refreshToken, userId, expiresAt)

  return {accessToken, refreshToken}
}
