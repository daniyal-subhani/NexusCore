import { createApp } from '@/app.js';
import { env } from '@/config/env.js';
import { logger } from '@/utils/logger.js';
import { connectDb, disconnectDb } from '@/db/prisma.js';
import { connectRabbitMQ, disconnectRabbitMQ } from '@nexus-core/common';
import { startUserEventsConsumer } from '@/messaging/user-events-consumer.js';

async function main() {
  await connectDb();
  await connectRabbitMQ(env.RABBITMQ_URL, logger);
  await startUserEventsConsumer();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`user-service listening on port ${env.PORT} (${env.NODE_ENV})`);
  });

  function shutdown(signal: string) {
    logger.info(`${signal} received, shutting down gracefully`);
    server.close(async () => {
      await disconnectDb();
      await disconnectRabbitMQ();
      process.exit(0);
    });
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  logger.error(err, 'Failed to start user-service');
  process.exit(1);
});