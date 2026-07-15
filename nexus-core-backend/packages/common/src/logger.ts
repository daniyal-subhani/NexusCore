import pino, { type Logger } from 'pino';

export const createLogger = (serviceName: string): Logger => {
  const isDev = process.env.NODE_ENV !== 'production';

  return pino({
    name: serviceName,
    level: isDev ? 'debug' : 'info',
    transport: isDev ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
  });
};
