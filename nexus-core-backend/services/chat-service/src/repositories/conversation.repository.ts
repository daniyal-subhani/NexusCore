import { getDb } from "@/clients/mongo.clients.js";
import { randomUUID } from "crypto";
import type { Conversation } from "@/types/conversations.js";

export const conversationRepository = {
    async create(participantIds: string[]):Promise<Conversation> {
        const conversation: Conversation = {_id:randomUUID(), participantIds, createdAt: new Date()};
        await getDb().collection<Conversation>("conversations").insertOne(conversation)
        return conversation;
    },
    async findByPartifipant(userId: string): Promise<Conversation[]> {
        return getDb().collection<Conversation>("conversations").find({participantIds: userId}).toArray();
    },
    async findById(id: string): Promise<Conversation | null> {
        return getDb().collection<Conversation>("conversations").findOne({_id: id})
    }
}