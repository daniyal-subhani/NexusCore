import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger.js';
import { env } from '@/config/env.js';

// 1. Declare Global Type for Node.js process to prevent multiple instances during HMR/Dev
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 2. Reuse existing client OR instantiate a new one with optimal logging
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'stdout', level: 'error' },
            { emit: 'stdout', level: 'warn' },
          ]
        : ['error'],
  });
// 3. Bind logger in Development mode to see exact SQL queries
if (env.NODE_ENV === 'development') {
  globalForPrisma.prisma = prisma(
    // Custom log format for query debugging
    prisma as any,
  ).$on?.('query', (e: { query: string; duration: number }) => {
    logger.debug({ query: e.query, duration: `${e.duration}ms` });
  });
}
// 4. Connect helper with Error Handling
export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('Connected to Auth Database (MYSQL)');
  } catch (error) {
    logger.error({ error }, 'Failed to connect to Auth Database');
    process.exit(1); // Exit process if DB connection fails on startup
  }
};

// 5. Graceful Disconnect Helper
export const disconnectDB = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('Disconnected from Auth Database');
  } catch (error) {
    logger.error({ error }, 'Error disconnecting Auth Database');
  }
};
