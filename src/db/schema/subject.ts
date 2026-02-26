import { uuidv7 } from "uuidv7"
import { pgTable, text, timestamp, integer, unique } from "drizzle-orm/pg-core"

import { course } from "./course"

export const subject = pgTable(
  "subjects",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => `${uuidv7()}`),

    code: text("code").notNull(),
    title: text("title").notNull(),
    units: integer("units").notNull(),
    slotLimit: integer("slot_limit").default(10).notNull(),

    // Foreign keys
    courseId: text("course_id")
      .notNull()
      .references(() => course.id),

    // Audit fields
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    unique("subjects_course_id_code_unique").on(t.courseId, t.code),
    unique("subjects_course_id_title_unique").on(t.courseId, t.title),
  ],
)
