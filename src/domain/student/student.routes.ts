import { Hono } from "hono"

import { studentController } from "./student.controller"
import { authMiddleware } from "../../shared/middlewares/auth.middleware"
import { checkRole } from "../../shared/middlewares/role.middleware"

export const studentRoutes = new Hono()

studentRoutes.use("*", authMiddleware)

studentRoutes.get("/", checkRole(["admin", "staff"]), (c) =>
  studentController.handleGetAll(c),
)
studentRoutes.post("/", checkRole(["admin", "staff"]), (c) =>
  studentController.handleCreate(c),
)
studentRoutes.get("/:id", checkRole(["admin", "staff"]), (c) =>
  studentController.handleGetById(c),
)
studentRoutes.patch("/:id", checkRole(["admin", "staff"]), (c) =>
  studentController.handleUpdateById(c),
)
studentRoutes.delete("/:id", checkRole(["admin"]), (c) =>
  studentController.handleDeleteById(c),
)
