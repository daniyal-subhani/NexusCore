import {createApp} from "@/app";
import {env} from "@/config/env.js"
import {logger } from "@utils/logger";
import {connectDB, disconnectDB } from "@/db/prisma";

async function main() {
    await connectDB();

    const app = createApp();
    const server = app.listen(env.PORT, () => {
        logger.info(`auth-service listening on port ${env.PORT} (${env.NODE_ENV})`);
    });
    function shutdown(signal: string) {
        logger.info(`${signal} received, shutting down gracefully`);
        server.close(async () => {
            await disconnectDB();
            logger.info("Server closed, DB disconnected");
            process.exit(0);
        })
    }
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", ()=> shutdown("SIGINT"));
}

main().catch((err) => {
    logger.error(err, "Failed to start auth-service");
    process.exit(1);
})