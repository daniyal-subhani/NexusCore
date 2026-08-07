import type { Request, Response } from 'express';
import { userService } from '@/services/user.service.js';

export const userController = {
  async getProfile(req: Request, res: Response) {
    const profile = await userService.getProfile(req.params.id as string);
    res.status(200).json(profile);
  },
  async updateProfile(req: Request, res: Response) {
    const profile = await userService.updateProfile(req.params.id as string, req.body);
    res.status(200).json(profile);
  },
};