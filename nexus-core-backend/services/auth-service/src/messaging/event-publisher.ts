import {
  publishEvent,
  USER_REGISTERED_ROUTING_KEY,
  type UserRegisteredEvent,
} from '@nexus-core/common';

export async function publishUserEvent(userId: string, email: string): Promise<void> {
  const event: UserRegisteredEvent = {
    userId,
    email,
    registeredAt: new Date().toISOString(),
  };
  await publishEvent(USER_REGISTERED_ROUTING_KEY, event);
}
