import { uuidv7 } from "uuidv7"
import { pgTable, text, timestamp, date } from "drizzle-orm/pg-core"

import { course } from "./course"

export const student = pgTable("students", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => `${uuidv7()}`),

  studentNo: text("student_no").unique().notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").unique(),
  birthDate: date("birth_date"),

  // Foreign keys
  courseId: text("course_id")
    .notNull()
    .references(() => course.id),

  // Audit fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
