import { eq, ilike, or, and, SQL } from "drizzle-orm"

import { db } from "../../config/database"
import { subject } from "../../db/schema/subject"
import { subjectPrerequisite } from "../../db/schema/subject-prerequisite"
import type {
  CreateSubjectDTO,
  UpdateSubjectDTO,
  ListSubjectDTO,
} from "./subject.dto"

export class SubjectRepository {
  async getAll(params: ListSubjectDTO) {
    const { page, limit, search, courseId } = params
    const offset = (page - 1) * limit

    const filters: SQL[] = []

    if (search) {
      filters.push(
        or(
          ilike(subject.code, `%${search}%`),
          ilike(subject.title, `%${search}%`),
        ) as SQL,
      )
    }

    if (courseId) {
      filters.push(eq(subject.courseId, courseId))
    }

    const where = filters.length > 0 ? and(...filters) : undefined

    const [subjects, total] = await Promise.all([
      db.query.subject.findMany({
        where,
        limit,
        offset,
        with: { course: true },
      }),
      db.$count(subject, where),
    ])

    return { subjects, total }
  }

  async getById(id: string) {
    return await db.query.subject.findFirst({
      where: eq(subject.id, id),
      with: { course: true },
    })
  }

  async getByCodeAndCourse(code: string, courseId: string) {
    return await db.query.subject.findFirst({
      where: and(eq(subject.code, code), eq(subject.courseId, courseId)),
    })
  }

  async getByTitleAndCourse(title: string, courseId: string) {
    return await db.query.subject.findFirst({
      where: and(eq(subject.title, title), eq(subject.courseId, courseId)),
    })
  }

  async create(data: CreateSubjectDTO) {
    const [newSubject] = await db.insert(subject).values(data).returning()
    return newSubject
  }

  async updateById(id: string, data: UpdateSubjectDTO) {
    const [updated] = await db
      .update(subject)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subject.id, id))
      .returning()
    return updated
  }

  async deleteById(id: string) {
    return await db.delete(subject).where(eq(subject.id, id)).returning()
  }

  async getPrerequisites(subjectId: string) {
    return await db.query.subjectPrerequisite.findMany({
      where: eq(subjectPrerequisite.subjectId, subjectId),
      with: { prerequisiteSubject: true },
    })
  }

  async getPrerequisiteLink(subjectId: string, prerequisiteSubjectId: string) {
    return await db.query.subjectPrerequisite.findFirst({
      where: and(
        eq(subjectPrerequisite.subjectId, subjectId),
        eq(subjectPrerequisite.prerequisiteSubjectId, prerequisiteSubjectId),
      ),
    })
  }

  async addPrerequisite(subjectId: string, prerequisiteSubjectId: string) {
    const [newPrerequisite] = await db
      .insert(subjectPrerequisite)
      .values({ subjectId, prerequisiteSubjectId })
      .returning()
    return newPrerequisite
  }

  async removePrerequisite(subjectId: string, prerequisiteSubjectId: string) {
    return await db
      .delete(subjectPrerequisite)
      .where(
        and(
          eq(subjectPrerequisite.subjectId, subjectId),
          eq(subjectPrerequisite.prerequisiteSubjectId, prerequisiteSubjectId),
        ),
      )
      .returning()
  }

  async getByCourseWithPrerequisites(courseId: string) {
    return await db.query.subject.findMany({
      where: eq(subject.courseId, courseId),
      with: {
        prerequisites: {
          with: { prerequisiteSubject: true },
        },
      },
    })
  }
}

export const subjectRepository = new SubjectRepository()
