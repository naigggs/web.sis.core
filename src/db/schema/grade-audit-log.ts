import { uuidv7 } from "uuidv7"
import { pgTable, text, timestamp, numeric } from "drizzle-orm/pg-core"

import { grade } from "./grade"
import { user } from "./user"
import { gradeRemarksEnum } from "../enums/grade"
import { gradeAuditActionEnum } from "../enums/grade-audit"

export const gradeAuditLog = pgTable("grade_audit_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => `${uuidv7()}`),

  gradeId: text("grade_id")
    .notNull()
    .references(() => grade.id, { onDelete: "cascade" }),

  action: gradeAuditActionEnum("action").notNull(),

  prelim: numeric("prelim", { precision: 5, scale: 2 }),
  midterm: numeric("midterm", { precision: 5, scale: 2 }),
  finals: numeric("finals", { precision: 5, scale: 2 }),
  finalGrade: numeric("final_grade", { precision: 5, scale: 2 }),
  remarks: gradeRemarksEnum("remarks"),

  performedByUserId: text("performed_by_user_id")
    .notNull()
    .references(() => user.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),
})
