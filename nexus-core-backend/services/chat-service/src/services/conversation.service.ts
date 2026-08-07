import { conversationCache } from "@/cache/conversation.cache.js";
import { HttpError } from "@nexus-core/common";
import { conversationRepository } from "@/repositories/conversation.repository.js";

export const conversationService = {
    async create(participantIds: string[]) {
        if(participantIds.length < 2) {
            throw new HttpError(400, "A conversation needs at least 2 participants");
        }
        const conversation = await conversationRepository.create(participantIds);
        // dono participants ka cached list ab stale hai - invalidate karo
        await Promise.all(participantIds.map((id) => conversationCache.invalidate(id)))
        return conversation;
    }
}