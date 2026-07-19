import express, { type Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(
    cors(
      // { origin: '*',credentials: true,}
  ),
  );
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'gateway-service' });
  });

  return app;
};
