import pino from "pino";
import type { Logger, LoggerOptions } from "pino";

type CreateLoggerOptions = LoggerOptions & {
  name: string;
};

export const createLogger = (options: CreateLoggerOptions): Logger => {
  const { name, ...rest } = options;

  const transport =
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
          },
        }
      : undefined;

  return pino({
    name,
    level: process.env.LOG_LEVEL || "info",
    transport,
    
    // 1. Base Properties: Fuzool server specs ke bajaye clean metadata
    base: {
      env: process.env.NODE_ENV || "development",
    },

    // 2. Serializers: Error objects ko bad-numa hone ke bajaye saaf-suthra print karega
    serializers: {
      err: pino.stdSerializers.err, // Built-in error serializer
    },

    // 3. Redact: Galti se bhi logs mein passwords ya tokens leak nahi honge!
    redact: {
      paths: [
        "req.headers.authorization",
        "*.password",
        "*.token",
        "*.secret",
        "*.creditCard"
      ],
      censor: "[REDACTED_FOR_SECURITY]", // In keys ki jagah ye print hoga
    },

    ...rest,
  });
};