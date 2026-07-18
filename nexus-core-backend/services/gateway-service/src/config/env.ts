import 'dotenv/config';
import {z, createEnv } from '@nexus-core/common';

const envSchema = z.object({
    GATEWAY_PORT: z.coerce.number().int().min(0).max(65_535).default(4000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

type EnvType = z.infer<typeof envSchema>;
export const env: EnvType = createEnv(envSchema, {
    serviceName: "gateway-service"
});
export type Env = typeof env;
