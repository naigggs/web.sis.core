import { eq, ilike, or, and, inArray, SQL } from "drizzle-orm"

import { db } from "../../config/database"
import { course } from "../../db/schema/course"
import type {
  CreateCourseDTO,
  UpdateCourseDTO,
  ListCourseDTO,
} from "./course.dto"

export class CourseRepository {
  async getAll(params: ListCourseDTO) {
    const { page, limit, search } = params
    const offset = (page - 1) * limit

    const filters: SQL[] = []

    if (search) {
      filters.push(
        or(
          ilike(course.code, `%${search}%`),
          ilike(course.name, `%${search}%`),
        ) as SQL,
      )
    }

    const where = filters.length > 0 ? and(...filters) : undefined

    const [courses, total] = await Promise.all([
      db.query.course.findMany({ where, limit, offset }),
      db.$count(course, where),
    ])

    return { courses, total }
  }

  async getById(id: string) {
    return await db.query.course.findFirst({
      where: eq(course.id, id),
    })
  }

  async getByCode(code: string) {
    return await db.query.course.findFirst({
      where: eq(course.code, code),
    })
  }

  async create(data: CreateCourseDTO) {
    const [newCourse] = await db.insert(course).values(data).returning()
    return newCourse
  }

  async updateById(id: string, data: UpdateCourseDTO) {
    const [updated] = await db
      .update(course)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(course.id, id))
      .returning()
    return updated
  }

  async deleteManyByIds(ids: string[]) {
    return await db.delete(course).where(inArray(course.id, ids)).returning()
  }
}

export const courseRepository = new CourseRepository()
