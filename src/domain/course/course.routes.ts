import { Hono } from "hono"

import { courseController } from "./course.controller"
import { authMiddleware } from "../../shared/middlewares/auth.middleware"
import { checkRole } from "../../shared/middlewares/role.middleware"

export const courseRoutes = new Hono()

courseRoutes.use("*", authMiddleware)

courseRoutes.get("/", checkRole(["admin", "staff"]), (c) =>
  courseController.handleGetAll(c),
)
courseRoutes.post("/", checkRole(["admin"]), (c) =>
  courseController.handleCreate(c),
)
courseRoutes.patch("/:id", checkRole(["admin"]), (c) =>
  courseController.handleUpdateById(c),
)
courseRoutes.delete("/:id", checkRole(["admin"]), (c) =>
  courseController.handleDeleteById(c),
)
