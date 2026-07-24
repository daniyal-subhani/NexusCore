import type {Request, Response} from "express";
import { authService } from "@/services/auth.service";

export const authController = {
    async register(req: Request, res:Response) {
        const tokens = await authService.register(req.body);
        res.status(201).json(tokens)
    },
    async login(req:Request, res:Response) {
        const tokens = await authService.login(req.body);
        res.status(200).json(tokens)
    },
    async refresh(req:Request, res:Response) {
        const {refreshToken}= req.body;
        const tokens = await authService.refresh(refreshToken);
        res.status(200).json(tokens)
    }
}