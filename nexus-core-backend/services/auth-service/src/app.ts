import express, {type Application} from "express";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middleware/error-handler.js";
import { registerRoutes } from "./routes/index.js";
import { env } from "./config/env.js";
import {createInternalAuthMiddleware} from "@nexus-core/common";

export const createApp = ():Application => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(createInternalAuthMiddleware(env.INTERNAL_API_TOKEN, {
    examptPaths: ["/health"]
  }))
  registerRoutes(app);

  app.use((_req, res) => {
    res.status(404).json({
      message: 'NOT FOUND'
    })
  })
  app.use(errorHandler);
  return app;
}