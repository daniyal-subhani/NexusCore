import pino, { type Logger, LoggerOptions } from 'pino';

type createLoggerOptions = LoggerOptions & {
  serviceName: string;
};

export const createLogger = (options: createLoggerOptions): Logger => {
  const { serviceName, ...rest } = options;

  const transport =
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
          },
        }
      : undefined;

      return pino({
        name: serviceName,
        level: process.env.LOG_LEVEL || "info",
        transport,
        ...rest
      })
};
