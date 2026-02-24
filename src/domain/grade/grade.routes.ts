import { Hono } from "hono"

import { gradeController } from "./grade.controller"
import { authMiddleware } from "../../shared/middlewares/auth.middleware"
import { checkRole } from "../../shared/middlewares/role.middleware"

export const gradeRoutes = new Hono()

gradeRoutes.use("*", authMiddleware)

gradeRoutes.get("/", checkRole(["admin", "staff"]), (c) =>
  gradeController.handleGetAll(c),
)
gradeRoutes.post("/", checkRole(["admin", "staff"]), (c) =>
  gradeController.handleUpsert(c),
)
gradeRoutes.patch("/:id", checkRole(["admin", "staff"]), (c) =>
  gradeController.handleUpdateById(c),
)
