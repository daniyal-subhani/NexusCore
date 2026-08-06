import { createServer } from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { disconnectDB, prisma } from './db/prisma.js';
import { connectRabbitMQ, disconnectRabbitMQ } from '@nexus-core/common';

const main = async (): Promise<void> => {
  try {
    // 1. DB connection check
    await prisma.$connect();
    logger.info('Database connection established successfully (Prisma)');

    // 2. Initialise Message Broker (RabbitMQ / Kafka)
    await connectRabbitMQ(env.RABBITMQ_URL, logger);

    // 3. create & listen express App
    const app = createApp();
    const server = createServer(app);

    const port = env.AUTH_SERVICE_PORT || 3000;
    server.listen(port, () => {
      logger.info({ port }, `Auth service is running on port ${port}`);
    });

    // 4. graceful shutdown handler
    let isShuttingDown = false;
    const shutdown = (signal: string) => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      logger.info({ signal }, `Received ${signal}. Starting graceful shutdown...`);

      // 10s Hard-timeout safety net (stuck connections forcing container kill)
      const forceKillTimer = setTimeout(() => {
        logger.error('Forced shutdown due to timeout while closing connections');
        process.exit(1);
      }, 10000);
      // force-kill timer unref so it won't hold the event loop alive
      forceKillTimer.unref();

      server.close((err) => {
        if (err) {
          logger.error({ err }, 'Error closing HTTP server');
        } else {
          logger.info('HTTP server stopped accepting new connections');
        }
        // step B: Disconnect DB & Messaginf Queues
        Promise.all([prisma.$disconnect(), disconnectRabbitMQ, disconnectDB])
          .then(() => {
            logger.info('Database and Publisher resources cleaned up successfully');
            process.exit(0);
          })
          .catch((error: unknown) => {
            logger.error({ error }, 'Error during resource cleanup phase');
            process.exit(1);
          });
      });
    };
    // signal listeners (Docker / Kubernates Termination Signals)
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    // global unhandled exception safety net
    process.on('uncaughtException', (error: Error) => {
      logger.fatal({ error }, 'Uncaught Exception thrown');
      shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason: unknown) => {
      logger.fatal({ reason }, 'Unhandled Promise Rejection');
      shutdown('unhandledRejection');
    });
  } catch (error) {
    logger.fatal({ error }, 'Failed to start Auth Service');
    process.exit(1);
  }
};

void main();
