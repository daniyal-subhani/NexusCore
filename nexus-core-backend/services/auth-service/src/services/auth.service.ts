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
