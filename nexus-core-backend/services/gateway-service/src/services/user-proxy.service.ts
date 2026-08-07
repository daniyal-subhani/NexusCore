import { env } from '@/config/env.js';
import { HttpError } from '@nexus-core/common';
import axios from 'axios';

const userClient = axios.create({ baseURL: env.USER_SERVICE_URL, timeout: 5000 });

export const userProxyService = {
  async getProfile(id: string) {
    return forward('get', `/users/${id}`);
  },
  async updateProfile(id: string, body: unknown) {
    return forward('patch', `/users/${id}`, body);
  },
};

async function forward(method: 'get' | 'patch', path: string, body?: unknown) {
  try {
    const response = await userClient.request({ method, url: path, data: body });
    return { status: response.status, data: response.data };
  } catch (error: AxiosError) {
    if (axios.isAxiosError(error) && error.response) {
      throw new HttpError(
        error.response.status,
        error.response.data?.message ?? 'User service error',
        error.response.data?.details,
      );
    }
    throw new HttpError(503, 'User service is currently unavailable');
  }
}
