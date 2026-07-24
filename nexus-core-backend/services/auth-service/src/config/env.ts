import "dotenv";
import {z, createEnv } from "@nexus-core/common";

const envSchema = z.object({
    PORT: z.string().default('4003').transform(Number),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    JWT_ACCESS_SECRET: z.string().min(16),
    JWT_REFRESH_SECRET: z.string().min(16),
    JWT_ACCESS_EXPIRY: z.string().default("15m"),
    JWT_REFRESH_EXPIRY: z.string().default("7d")
})
type EnvType = z.infer<typeof envSchema>;
export const env: EnvType = createEnv(envSchema, {serviceName: "auth-service"});
export type Env = typeof env;