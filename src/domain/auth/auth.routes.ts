import { Hono } from "hono"

import { authController } from "./auth.controller"
import { authMiddleware } from "../../shared/middlewares/auth.middleware"

export const authRoutes = new Hono()

authRoutes.post("/login", (c) => authController.handleLogin(c))
authRoutes.post("/logout", authMiddleware, (c) =>
  authController.handleLogout(c),
)
authRoutes.post("/refresh", (c) => authController.handleRefresh(c))
authRoutes.get("/me", authMiddleware, (c) => authController.handleMe(c))
