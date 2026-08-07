export interface Conversation {
    _id: string;
    participantIds: string[];
    createdAt: Date;
}

export interface Message {
    _id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: Date;
}
