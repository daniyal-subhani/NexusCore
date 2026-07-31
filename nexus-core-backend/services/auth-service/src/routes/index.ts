import {Router} from "express"
import { authRouter } from "./auth.routes.js";


export const registerRoutes = (app: Router) => {
    app.get("/health", (_req, res)=> {
        res.status(200).json({
            status: 'ok', service: 'auth-service'
        })
    })
    app.use("/auth", authRouter)
}