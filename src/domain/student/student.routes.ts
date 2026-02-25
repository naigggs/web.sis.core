import { Hono } from "hono"

import { studentController } from "./student.controller"
import { reservationController } from "../reservation/reservation.controller"
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
studentRoutes.delete("/", checkRole(["admin"]), (c) =>
  studentController.handleDeleteMany(c),
)

// Reservations
studentRoutes.get("/:id/reservations", checkRole(["admin", "staff"]), (c) =>
  reservationController.handleGetByStudent(c),
)
studentRoutes.post("/:id/reservations", checkRole(["admin", "staff"]), (c) =>
  reservationController.handleReserve(c),
)
studentRoutes.delete(
  "/:id/reservations/:reservationId",
  checkRole(["admin", "staff"]),
  (c) => reservationController.handleCancel(c),
)

// Eligible subjects
studentRoutes.get(
  "/:id/eligible-subjects",
  checkRole(["admin", "staff"]),
  (c) => studentController.handleGetEligibleSubjects(c),
)
