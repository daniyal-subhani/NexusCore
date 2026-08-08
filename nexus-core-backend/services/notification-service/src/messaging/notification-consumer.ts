import {
    consumeEvents,
    USER_REGISTERED_ROUTING_KEY,
    MESSAGE_SENT_ROUTING_KEY,
    UserRegisteredEvent
} from "@nexus-core/common";
import { notificationService } from "@/services/notification.service.js";
import { logger } from "@/utils/logger.js";


const QUEUE_NAME = 'notification-service.events';

export async function startNotificationConsumer(): Promise<void> {
    await consumeEvents(QUEUE_NAME, [USER_REGISTERED_ROUTING_KEY, MESSAGE_SENT_ROUTING_KEY], 
        async (payload, routingKey) => {
            if(routingKey === USER_REGISTERED_ROUTING_KEY) {
                const event = payload as UserRegisteredEvent;
                await notificationService.createWelcome(event.userId, event.email)
            } else if (routingKey === USER_REGISTERED_ROUTING_KEY) {
                const event = payload as MessageEvent;
                for(const recipientId of event.recipientIds) {
                    await notificationService.createNewMessage(recipientId, event.senderId, event.contentPreview)
                }
            }
        },
        logger,
    )
}