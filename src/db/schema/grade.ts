import { uuidv7 } from "uuidv7"
import { pgTable, text, timestamp, numeric } from "drizzle-orm/pg-core"

import { student } from "./student"
import { subject } from "./subject"
import { course } from "./course"
import { user } from "./user"

export const grade = pgTable("grades", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => `${uuidv7()}`),

  // Grade values
  prelim: numeric("prelim", { precision: 5, scale: 2 }),
  midterm: numeric("midterm", { precision: 5, scale: 2 }),
  finals: numeric("finals", { precision: 5, scale: 2 }),
  finalGrade: numeric("final_grade", { precision: 5, scale: 2 }),
  remarks: text("remarks"),

  // Foreign keys
  studentId: text("student_id")
    .notNull()
    .references(() => student.id),
  subjectId: text("subject_id")
    .notNull()
    .references(() => subject.id),
  courseId: text("course_id")
    .notNull()
    .references(() => course.id),
  encodedByUserId: text("encoded_by_user_id")
    .notNull()
    .references(() => user.id),

  // Audit fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
