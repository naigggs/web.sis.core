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
studentRoutes.get("/export", checkRole(["admin", "staff"]), (c) =>
  studentController.handleExport(c),
)
studentRoutes.post("/import", checkRole(["admin", "staff"]), (c) =>
  studentController.handleImport(c),
)

// ── Student "me" routes (must be before /:id) ─────────────────────────────
studentRoutes.get("/me", checkRole(["student"]), (c) =>
  studentController.handleGetMe(c),
)
studentRoutes.get("/me/reservations", checkRole(["student"]), (c) =>
  reservationController.handleMeGetReservations(c),
)
studentRoutes.post("/me/reservations", checkRole(["student"]), (c) =>
  reservationController.handleMeReserve(c),
)
studentRoutes.delete(
  "/me/reservations/:reservationId",
  checkRole(["student"]),
  (c) => reservationController.handleMeCancel(c),
)
studentRoutes.get("/me/eligible-subjects", checkRole(["student"]), (c) =>
  studentController.handleGetMeEligibleSubjects(c),
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
studentRoutes.patch(
  "/:id/reservations/:reservationId",
  checkRole(["admin", "staff"]),
  (c) => reservationController.handleUpdateStatus(c),
)

// Eligible subjects
studentRoutes.get(
  "/:id/eligible-subjects",
  checkRole(["admin", "staff"]),
  (c) => studentController.handleGetEligibleSubjects(c),
)
