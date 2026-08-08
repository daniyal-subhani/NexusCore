import { Server, type Socket } from 'socket.io';
import type { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { logger } from '@/utils/logger.js';
import { env } from '@/config/env.js';

let io: Server;

interface AccessTokenPayload {
  sub: string;
  email: string;
}

export function initSocket(httpServer: HttpServer): void {
  io = new Server(httpServer, { cors: { origin: '*' } }); // dev only - CORS hardening Phase 1 mein

  // handshake-level auth middleware - HTTP requireAuth jaisa hi concept, socket ke liye
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) return next(new Error('Authentication token missing'));
    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
      socket.data.userId = payload.sub;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });
  io.on('connection', (socket) => {
    logger.info({ userId: socket.data.userId }, 'Socket connected');

    socket.on('conversation:join', (conversationId: string) => {
      socket.join(conversationId); // Socket.io "room" - ek conversation ke saare participants isi room mein
    });
    socket.on('disconnect', () => {
      logger.info({ userId: socket.data.userId }, 'Socket disconnected');
    });
  });
}

export function getInfo(): Server {
  if (!io) throw new Error('Socket.io not initialized - call initSocket first');
  return io;
}
