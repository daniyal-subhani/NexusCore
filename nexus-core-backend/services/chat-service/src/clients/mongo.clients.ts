import { MongoClient, type Db } from 'mongodb';

import { env } from '../config/env.js';
import { logger } from '@/utils/logger.js';

const client = new MongoClient(env.MONGO_URL);
let db: Db;

export async function connectMongo(): Promise<void> {
  await client.connect();
  db = client.db(); // database string ke ander hi database naam specify hai
  await db.collection('conversations').createIndex({ participantsIds: 1 });
  await db.collection('messages').createIndex({ conversationId: 1, createdAt: -1 });
  logger.info('Connected to chat-db (MongoDB)');
}

export function getDb(): Db {
  if (!db) throw new Error('Mongo not connect - call connectMongo first');
  return db;
}

export async function disconnectMongo(): Promise<void> {
    await client.close();
    logger.info("Disconnected from chat-db")
}