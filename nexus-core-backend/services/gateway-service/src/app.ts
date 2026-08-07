import express, { type Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';

import { errorHandler } from './middleware/error-handler.js';
import { registerRoutes } from './routes/index.js';


export const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(
    cors(
      // { origin: '*',credentials: true,}
  ),
  );
  app.use(express.json());

 registerRoutes(app)

 // App Route Registration
  registerRoutes(app);
  

  // 404 Catch-All Handler
  app.use((_req, res) => {
    res.status(404).json({
      status: 'error',
      message: 'Resource not found',
    });
  });

  // global error handler middleware
  app.use(errorHandler)

  return app;
};
