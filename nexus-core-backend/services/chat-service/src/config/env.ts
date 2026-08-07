import { createEnv, z } from '@nexus-core/common';

const envSchema = z.object({
  PORT: z.string().default('4002').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URL: z.url(),
  REDIS_URL: z.url(),
  RABBITMQ_URL: z.url(),
});

type EnvType = z.infer<typeof envSchema>;
export const env:EnvType = createEnv(envSchema, {serviceName: "chat-service"})
