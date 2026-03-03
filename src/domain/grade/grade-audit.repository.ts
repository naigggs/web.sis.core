import { desc, eq } from "drizzle-orm"

import { db } from "../../config/database"
import { gradeAuditLog } from "../../db/schema/grade-audit-log"

type CreateGradeAuditLogInput = {
  gradeId: string
  action: "CREATED" | "UPDATED"
  prelim?: string | null
  midterm?: string | null
  finals?: string | null
  finalGrade?: string | null
  remarks?: "PASSED" | "FAILED" | null
  performedByUserId: string
}

export class GradeAuditRepository {
  async create(data: CreateGradeAuditLogInput) {
    const [log] = await db.insert(gradeAuditLog).values(data).returning()
    return log
  }

  async getByGradeId(gradeId: string) {
    return await db.query.gradeAuditLog.findMany({
      where: eq(gradeAuditLog.gradeId, gradeId),
      orderBy: [desc(gradeAuditLog.createdAt)],
      with: {
        performedBy: {
          columns: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    })
  }
}

export const gradeAuditRepository = new GradeAuditRepository()
