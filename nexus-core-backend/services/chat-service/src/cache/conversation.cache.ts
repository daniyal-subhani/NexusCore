import {redis} from "@/clients/redis.client.js";
import type { Conversation } from "@/types/conversations.js";

const TTL_SECONDS = 60; // short TTL - conversations list changes when new convos are created

export const conversationCache = {
    async get(userId: string):Promise <Conversation[] | null> {
        const cached = await redis.get(`user:${userId}:conversations`);
        return cached ? JSON.parse(cached) : null;
    },
    async set(userId: string, conversations: Conversation[]):Promise<void> {
        await redis.set(`user:${userId}:conversations`, JSON.stringify(conversations), "EX", TTL_SECONDS);
    },
    async invalidate(userId: string):Promise<void> {
        await redis.del(`user:${userId}:conversations`);
    }
}