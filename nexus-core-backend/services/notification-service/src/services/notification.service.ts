import { notificationRepository } from '@/repositories/notification.repository.js';
import { logger } from '@/utils/logger.js';

export const notificationService = {
  async createWelcome(userId: string, email: string) {
    await notificationRepository.create(
      userId,
      'Welcome',
      'Welcome to NexusCore!',
      `Hi ${email}, thanks for signing up.`,
    );
    logger.info({ userId }, 'Welcome notification created');
  },
  async createNewMessage(recipientId: string, senderId: string, contentPreview: string) {
    await notificationRepository.create(
      recipientId,
      'NEW_MESSAGE',
      'New message',
      `You have a new message: "${contentPreview}"`,
    );
    logger.info({ recipientId, senderId }, 'New-message notification created');
  },
  async listForUser(userId: string) {
    return notificationRepository.findForUser(userId);
  },
};
