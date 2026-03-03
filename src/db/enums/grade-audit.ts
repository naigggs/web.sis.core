import { pgEnum } from "drizzle-orm/pg-core"

export const GRADE_AUDIT_ACTIONS = ["CREATED", "UPDATED"] as const

export const gradeAuditActionEnum = pgEnum(
  "grade_audit_action",
  GRADE_AUDIT_ACTIONS,
)
