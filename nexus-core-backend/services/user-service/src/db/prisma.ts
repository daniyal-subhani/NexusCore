import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { logger } from '../utils/logger';
import { env } from '../config/env';

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });
export const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info('Connected to user-db (Postgresql via pg adapter)');
  } catch (error) {
    logger.error({ error }, 'Failed to connect to user db');
    process.exit(1);
  }
};

export const disconnectDb = async () => {
  await prisma.$disconnect();
  logger.info('Disconnect from user-db');
};
