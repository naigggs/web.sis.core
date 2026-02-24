import { pgEnum } from "drizzle-orm/pg-core"

export const SUBJECT_RESERVATION_STATUSES = ["reserved", "cancelled"] as const

export const subjectReservationStatusEnum = pgEnum(
  "subject_reservation_status",
  SUBJECT_RESERVATION_STATUSES,
)
