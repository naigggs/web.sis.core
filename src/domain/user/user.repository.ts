import { eq, inArray, ilike, or, and, SQL } from "drizzle-orm"

import { db } from "../../config/database"
import { user } from "../../db/schema/user"
import type { CreateUserParams, UpdateUserDTO, ListUserDTO } from "./user.dto"

export class UserRepository {
  async getByEmail(email: string) {
    return await db.query.user.findFirst({
      where: eq(user.email, email),
    })
  }

  async getById(id: string) {
    return await db.query.user.findFirst({
      where: eq(user.id, id),
    })
  }

  async getAll(params: ListUserDTO) {
    const { page, limit, search, role } = params
    const offset = (page - 1) * limit

    const filters: SQL[] = []

    if (search) {
      filters.push(
        or(
          ilike(user.email, `%${search}%`),
          ilike(user.id, `%${search}%`),
          ilike(user.studentId, `%${search}%`),
        ) as SQL,
      )
    }

    if (role) {
      filters.push(eq(user.role, role))
    }

    const where = filters.length > 0 ? and(...filters) : undefined

    const [users, total] = await Promise.all([
      db.query.user.findMany({
        where,
        limit,
        offset,
      }),
      db.$count(user, where),
    ])

    return { users, total }
  }

  async create(data: CreateUserParams) {
    const [newUser] = await db
      .insert(user)
      .values({
        email: data.email ?? null,
        password: data.password,
        role: data.role ?? "student",
        studentId: data.studentId ?? null,
      })
      .returning()

    return newUser
  }

  async updateById(id: string, data: UpdateUserDTO) {
    const [updated] = await db
      .update(user)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(user.id, id))
      .returning()

    return updated
  }

  async softDeleteById(id: string) {
    const [updated] = await db
      .update(user)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(user.id, id))
      .returning()

    return updated
  }

  async hardDeleteById(id: string) {
    return await db.delete(user).where(eq(user.id, id)).returning()
  }

  async deleteByStudentIds(studentIds: string[]) {
    if (studentIds.length === 0) return []
    return await db
      .delete(user)
      .where(inArray(user.studentId, studentIds))
      .returning()
  }
}

export const userRepository = new UserRepository()
