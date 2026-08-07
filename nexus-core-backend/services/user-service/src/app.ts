import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { userRouter } from '@/routes/user.routes.js';
import { errorHandler } from '@/middleware/error-handler.js';

export function createApp(): Express {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.get('/health', (_req, res) => res.status(200).json({ status: 'ok', service: 'user-service' }));
  app.use('/users', userRouter);
  app.use(errorHandler);
  return app;
}