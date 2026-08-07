import { consumeEvents, USER_REGISTERED_ROUTING_KEY, type UserRegisteredEvent } from '@nexus-core/common';
import { userService } from '@/services/user.service.js';
import { logger } from '@/utils/logger.js';

const QUEUE_NAME = 'user-service.user-events';

export async function startUserEventsConsumer(): Promise<void> {
  await consumeEvents(
    QUEUE_NAME,
    [USER_REGISTERED_ROUTING_KEY],
    async (payload) => {
      const event = payload as UserRegisteredEvent;
      await userService.createProfileFromEvent(event.userId, event.email);
    },
    logger,
  );
}