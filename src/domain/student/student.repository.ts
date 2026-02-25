import { eq, ilike, or, and, inArray, SQL } from "drizzle-orm"

import { db } from "../../config/database"
import { student } from "../../db/schema/student"
import type {
  CreateStudentDTO,
  UpdateStudentDTO,
  ListStudentDTO,
} from "./student.dto"

export class StudentRepository {
  async getAll(params: ListStudentDTO) {
    const { page, limit, search, courseId } = params
    const offset = (page - 1) * limit

    const filters: SQL[] = []

    if (search) {
      filters.push(
        or(
          ilike(student.firstName, `%${search}%`),
          ilike(student.lastName, `%${search}%`),
          ilike(student.studentNo, `%${search}%`),
          ilike(student.email, `%${search}%`),
        ) as SQL,
      )
    }

    if (courseId) {
      filters.push(eq(student.courseId, courseId))
    }

    const where = filters.length > 0 ? and(...filters) : undefined

    const [students, total] = await Promise.all([
      db.query.student.findMany({
        where,
        limit,
        offset,
        with: { course: true },
      }),
      db.$count(student, where),
    ])

    return { students, total }
  }

  async getById(id: string) {
    return await db.query.student.findFirst({
      where: eq(student.id, id),
      with: { course: true },
    })
  }

  async getByStudentNo(studentNo: string) {
    return await db.query.student.findFirst({
      where: eq(student.studentNo, studentNo),
    })
  }

  async getByEmail(email: string) {
    return await db.query.student.findFirst({
      where: eq(student.email, email),
    })
  }

  async create(data: CreateStudentDTO) {
    const [newStudent] = await db.insert(student).values(data).returning()
    return newStudent
  }

  async updateById(id: string, data: UpdateStudentDTO) {
    const [updated] = await db
      .update(student)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(student.id, id))
      .returning()
    return updated
  }

  async deleteManyByIds(ids: string[]) {
    return await db.delete(student).where(inArray(student.id, ids)).returning()
  }
}

export const studentRepository = new StudentRepository()
