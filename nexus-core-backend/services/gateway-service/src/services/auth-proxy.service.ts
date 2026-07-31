import axios, { type AxiosInstance, AxiosError } from 'axios';
import { HttpError } from '@nexus-core/common';
import { env } from '@/config/env.js';
import http from 'http';
import https from 'https';

// production type definitions
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserData {
  id: string;
  email: string;
  createdAt: string;
}

// fixed recursive interface issue from original code
export interface AuthResponse {
  tokens: AuthTokens;
  user: UserData;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RefreshPayload {
  refreshToken: string;
}

export interface RevokePayload {
  userId: string;
}

// production http client with connection pooling & keep-alive
const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 100 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 100 });

const client: AxiosInstance = axios.create({
  baseURL: env.AUTH_SERVICE_URL,
  timeout: 5000, //5s strict timeout
  httpAgent,
  httpsAgent,
  headers: {
    'Content-Type': 'application/json',
    'X-Internal-Token': env.AUTH_SERVICE_URL,
  },
});
// 3. centralized error normalizer
const extractErrorMessage = (status: number, data: unknown): string => {
  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as Record<string, unknown>).message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }
  return status >= 500
    ? 'Authentication service is temporarily unavailable'
    : 'An error occurred while processing the request';
};
const handleAxiosError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    // service responded with 4xx/5xx status
    if (error.response) {
      const { status, data } = error.response;
      throw new HttpError(status, extractErrorMessage(status, data));
    }

    // timeout error (ECONNABORTED)
    if (error.code === 'ECONNABORTED') {
      throw new HttpError(504, 'Authentication service request timed out');
    }

    // network error / auth service down / dns failure
    throw new HttpError(503, 'Authentication service is unreachable');
  }
  // fallback for non-axios unetxpected errors
  throw new HttpError(500, 'Internal server error during authentication proxy');
};

// 4 clean service layer
export const authProxyService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const { data } = await client.post<AuthResponse>('/auth/register', payload);
      return data;
    } catch (error) {
      return handleAxiosError(error);
    }
  },
  async login(payload: LoginPayload): Promise<AuthTokens> {
    try {
      const { data } = await client.post<AuthTokens>('/auth/login', payload);
      return data;
    } catch (error) {
      return handleAxiosError(error);
    }
  },
  async refresh(payload: RefreshPayload): Promise<AuthTokens> {
    try {
      const { data } = await client.post<AuthResponse>('/auth/refresh', payload);
      return data;
    } catch (error) {
      return handleAxiosError(error);
    }
  },
  async revoke(payload: RevokePayload): Promise<void> {
    try {
      await client.post<void>('/auth/revoke', payload);
    } catch (error) {
      return handleAxiosError(error);
    }
  },
};
