import { pgEnum } from "drizzle-orm/pg-core"

export const GRADE_REMARKS = ["PASSED", "FAILED"] as const

export const gradeRemarksEnum = pgEnum("grade_remarks", GRADE_REMARKS)
