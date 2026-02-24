import { eq, and, SQL } from "drizzle-orm"

import { db } from "../../config/database"
import { grade } from "../../db/schema/grade"
import type { CreateGradeDTO, UpdateGradeDTO, ListGradeDTO } from "./grade.dto"

export class GradeRepository {
  async getAll(params: ListGradeDTO) {
    const { page, limit, courseId, subjectId, studentId } = params
    const offset = (page - 1) * limit

    const filters: SQL[] = []
    if (courseId) filters.push(eq(grade.courseId, courseId))
    if (subjectId) filters.push(eq(grade.subjectId, subjectId))
    if (studentId) filters.push(eq(grade.studentId, studentId))

    const where = filters.length > 0 ? and(...filters) : undefined

    const [grades, total] = await Promise.all([
      db.query.grade.findMany({
        where,
        limit,
        offset,
        with: { student: true, subject: true, course: true },
      }),
      db.$count(grade, where),
    ])

    return { grades, total }
  }

  async getById(id: string) {
    return await db.query.grade.findFirst({
      where: eq(grade.id, id),
      with: { student: true, subject: true, course: true },
    })
  }

  async getByComposite(studentId: string, subjectId: string, courseId: string) {
    return await db.query.grade.findFirst({
      where: and(
        eq(grade.studentId, studentId),
        eq(grade.subjectId, subjectId),
        eq(grade.courseId, courseId),
      ),
    })
  }

  async upsert(
    data: CreateGradeDTO & {
      encodedByUserId: string
      finalGrade?: number
      remarks?: string
    },
  ) {
    const { studentId, subjectId, courseId, encodedByUserId, ...values } = data

    const numericValues = {
      prelim: values.prelim !== undefined ? String(values.prelim) : undefined,
      midterm:
        values.midterm !== undefined ? String(values.midterm) : undefined,
      finals: values.finals !== undefined ? String(values.finals) : undefined,
      finalGrade:
        values.finalGrade !== undefined ? String(values.finalGrade) : undefined,
      remarks: values.remarks,
    }

    const [result] = await db
      .insert(grade)
      .values({
        studentId,
        subjectId,
        courseId,
        encodedByUserId,
        ...numericValues,
      })
      .onConflictDoUpdate({
        target: [grade.studentId, grade.subjectId, grade.courseId],
        set: { ...numericValues, encodedByUserId, updatedAt: new Date() },
      })
      .returning()
    return result
  }

  async updateById(
    id: string,
    data: UpdateGradeDTO & {
      encodedByUserId: string
      finalGrade?: number
      remarks?: string
    },
  ) {
    const { encodedByUserId, ...values } = data

    const numericValues = {
      prelim: values.prelim !== undefined ? String(values.prelim) : undefined,
      midterm:
        values.midterm !== undefined ? String(values.midterm) : undefined,
      finals: values.finals !== undefined ? String(values.finals) : undefined,
      finalGrade:
        values.finalGrade !== undefined ? String(values.finalGrade) : undefined,
      remarks: values.remarks,
    }

    const [updated] = await db
      .update(grade)
      .set({ ...numericValues, encodedByUserId, updatedAt: new Date() })
      .where(eq(grade.id, id))
      .returning()
    return updated
  }

  async getAllByStudent(studentId: string) {
    return await db.query.grade.findMany({
      where: eq(grade.studentId, studentId),
      with: { subject: true, course: true },
    })
  }
}

export const gradeRepository = new GradeRepository()
