import { connectRabbitMQ, disconnectRabbitMQ } from '@nexus-core/common';
import { createApp } from './app.js';
import { connectMongo, disconnectMongo } from './clients/mongo.clients.js';
import { redis } from './clients/redis.client.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

async function main() {
  await connectMongo();
  await connectRabbitMQ(env.RABBITMQ_URL, logger);
  // RabbitMQ consumer for user.registered NAHI hai yahan - chat-service ko user-cache

  const app = createApp();
  const server = app.listen(env.PORT, () =>
    logger.info(`chat-service listening on port ${env.PORT}`),
  );
  function shutdown(signal: string) {
    logger.info(`${signal} received, shutting down gracefully`);
    server.close(async () => {
      await disconnectMongo();
      await disconnectRabbitMQ();
      redis.disconnect();
      process.exit(0);
    });
  }
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  logger.error(err, 'Failed to start chat-service');
  process.exit(1);
});
