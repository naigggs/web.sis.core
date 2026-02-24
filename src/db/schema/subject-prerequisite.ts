import { uuidv7 } from "uuidv7"
import { pgTable, text, timestamp } from "drizzle-orm/pg-core"

import { subject } from "./subject"

export const subjectPrerequisite = pgTable("subject_prerequisites", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => `${uuidv7()}`),

  // Foreign keys
  subjectId: text("subject_id")
    .notNull()
    .references(() => subject.id),
  prerequisiteSubjectId: text("prerequisite_subject_id")
    .notNull()
    .references(() => subject.id),

  // Audit fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
