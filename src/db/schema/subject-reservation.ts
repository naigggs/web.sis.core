import { uuidv7 } from "uuidv7"
import { pgTable, text, timestamp } from "drizzle-orm/pg-core"

import { subjectReservationStatusEnum } from "../enums/course"
import { student } from "./student"
import { subject } from "./subject"

export const subjectReservation = pgTable("subject_reservations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => `${uuidv7()}`),

  status: subjectReservationStatusEnum("status").default("reserved").notNull(),
  reservedAt: timestamp("reserved_at").defaultNow().notNull(),

  // Foreign keys
  studentId: text("student_id")
    .notNull()
    .references(() => student.id),
  subjectId: text("subject_id")
    .notNull()
    .references(() => subject.id),
})
