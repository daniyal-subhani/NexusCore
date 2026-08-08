import { createEnv, z } from '@nexus-core/common';

const envSchema = z.object({
  PORT: z.string().default('4002').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URL: z.url(),
  REDIS_URL: z.url(),
  RABBITMQ_URL: z.url(),
  JWT_ACCESS_SECRET: z.string(),
});

type EnvType = z.infer<typeof envSchema>;
export const env:EnvType = createEnv(envSchema, {serviceName: "chat-service"})
