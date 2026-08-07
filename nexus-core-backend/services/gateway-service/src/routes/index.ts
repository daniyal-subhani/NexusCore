import type { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { userRouter } from "./user.routes.js";

export const registerRoutes = (app: Router) => {
    // health check endpoint for docker.k8s
    app.get('/health', (_req, res) => {

        res.status(200).json({status: 'ok', service: 'gateway-service'})
    })
    app.use('/auth', authRouter)
    app.use("/users", userRouter)
}
