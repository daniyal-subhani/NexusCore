import express, {type Express } from "express";
import helmet from 'helmet';
import cors from "cors"
import { conversationRouter } from "./routes/conversation.routes.js";
import { errorHandler } from "./middleware/error-handler.js";


export function createApp(): Express {
    const app = express();
    app.use(helmet());
    app.use(cors());
    app.use(express.json())
    app.get('/conversations', conversationRouter);
    app.use(errorHandler)
    return app;
}