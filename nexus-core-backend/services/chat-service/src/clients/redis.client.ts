import { env } from "@/config/env.js";
import { logger } from "@/utils/logger.js";
import Redis from "ioredis";


export const redis = new Redis(env.REDIS_URL);

redis.on('connect', ()=> logger.info("Connected to Redis"));
redis.on('error', (err) => logger.error({err}, "Redis connection error")
)