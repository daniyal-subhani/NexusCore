import { prisma } from "@/db/prisma.js";
import type {NotificationType} from "../../generated/prisma/client.js";

export const notificationRepository = {
    create(userId: string, type: NotificationType, title: string,
        body: string
    ) {
        return prisma.notification.create({data: {userId, type, title, body}})
    },
    findForUser(userId: string) {
        return prisma.notification.findMany({where: {userId}, orderBy: {createdAt: 'desc'}})
    }
}