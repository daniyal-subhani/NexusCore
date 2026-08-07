import { userRepository } from '@/repositories/user.repository.js';
import { logger } from '@/utils/logger.js';
import { HttpError } from '@nexus-core/common';

export const userService = {
  async getProfile(id: string) {
    const profile = await userRepository.findById(id);
    if (!profile) throw new HttpError(404, 'Profile not found');
    return profile;
  },
  async updateProfile(
    id: string,
    data: { displayName?: string; bio?: string; avatarUrl?: string },
  ) {
    return userRepository.update(id, data);
  },
  // event consumer isay call karega, HTTP route se nahi
  async createProfileFromEvent(id: string, email: string) {
    const existing = await userRepository.findById(id);
    if (existing) {
      logger.warn({ userId: id }, 'Profile already exists, skipping duplicate creation');
      return; // idempotency
    }
    await userRepository.create(id, email);
    logger.info({ userId: id }, 'user profile created from event');
  },
};
