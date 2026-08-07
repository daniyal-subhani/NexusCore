import type { Request, Response } from 'express';
import { userProxyService } from '@/services/user-proxy.service.js';

export const userController = {
  async getProfile(req: Request, res: Response) {
    const { status, data } = await userProxyService.getProfile(req.params.id as string);
    res.status(status).json(data);
  },
  async updateProfile(req: Request, res: Response) {
    const { status, data } = await userProxyService.updateProfile(
      req.params.id as string,
      req.body,
    );
    res.status(status).json(data);
  },
};
