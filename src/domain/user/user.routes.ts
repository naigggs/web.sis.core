import { Hono } from "hono"

import { userController } from "./user.controller"
import { authMiddleware } from "../../shared/middlewares/auth.middleware"
import { checkRole } from "../../shared/middlewares/role.middleware"

export const userRoutes = new Hono()

userRoutes.use("*", authMiddleware)

userRoutes.post("/", checkRole(["admin", "staff"]), (c) =>
  userController.handleCreate(c),
)
userRoutes.get("/", checkRole(["admin", "staff"]), (c) =>
  userController.handleGetAll(c),
)
userRoutes.get("/:id", checkRole(["admin", "staff"]), (c) =>
  userController.handleGetById(c),
)
userRoutes.patch("/:id", checkRole(["admin", "staff"]), (c) =>
  userController.handleUpdateById(c),
)
userRoutes.delete("/:id/soft-delete", checkRole(["admin", "staff"]), (c) =>
  userController.handleSoftDeleteById(c),
)
userRoutes.delete("/:id/hard-delete", checkRole(["admin"]), (c) =>
  userController.handleHardDeleteById(c),
)
