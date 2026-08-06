// config/env.ts
import 'dotenv/config';
import { z, createEnv } from '@nexus-core/common';

const envSchema = z.object({
  PORT: z.string().default('4001').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  RABBITMQ_URL: z.string().url(),
});

export const env = createEnv(envSchema);