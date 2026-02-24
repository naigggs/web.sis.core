import { Hono } from "hono"

import { subjectController } from "./subject.controller"
import { authMiddleware } from "../../shared/middlewares/auth.middleware"
import { checkRole } from "../../shared/middlewares/role.middleware"

export const subjectRoutes = new Hono()

subjectRoutes.use("*", authMiddleware)

subjectRoutes.get("/", checkRole(["admin", "staff"]), (c) =>
  subjectController.handleGetAll(c),
)
subjectRoutes.post("/", checkRole(["admin"]), (c) =>
  subjectController.handleCreate(c),
)
subjectRoutes.patch("/:id", checkRole(["admin"]), (c) =>
  subjectController.handleUpdateById(c),
)
subjectRoutes.delete("/:id", checkRole(["admin"]), (c) =>
  subjectController.handleDeleteById(c),
)

subjectRoutes.get("/:id/prerequisites", checkRole(["admin", "staff"]), (c) =>
  subjectController.handleGetPrerequisites(c),
)
subjectRoutes.post("/:id/prerequisites", checkRole(["admin"]), (c) =>
  subjectController.handleAddPrerequisite(c),
)
subjectRoutes.delete(
  "/:id/prerequisites/:prerequisiteSubjectId",
  checkRole(["admin"]),
  (c) => subjectController.handleRemovePrerequisite(c),
)
