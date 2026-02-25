import { pgEnum } from "drizzle-orm/pg-core"

export const SUBJECT_RESERVATION_STATUSES = ["RESERVED", "CANCELLED"] as const

export const subjectReservationStatusEnum = pgEnum(
  "subject_reservation_status",
  SUBJECT_RESERVATION_STATUSES,
)
