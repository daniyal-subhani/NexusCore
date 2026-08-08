export const MESSAGE_SENT_ROUTING_KEY = 'message.sent';

export interface MessageSentEvent {
    messageId: string;
    conversationId: string;
    senderId: string;
    recipientIds: string[]; // sender ko chhodkar baaki participants - jinhe notify kerna hai
    contentPreview: string; // poora content nahi - sirf pehle 100 chars, notification ke liye kafi
    sentAt: string;
}