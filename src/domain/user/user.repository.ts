import { eq } from "drizzle-orm"

import { db } from "../../config/database"
import { user } from "../../db/schema/user"
import type { CreateUserParams, UpdateUserDTO } from "./user.dto"

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

  async getAll(params: { page: number; limit: number }) {
    const { page, limit } = params
    const offset = (page - 1) * limit

    const [users, total] = await Promise.all([
      db.query.user.findMany({
        limit,
        offset,
      }),
      db.$count(user),
    ])

    return { users, total }
  }

  async create(data: CreateUserParams) {
    const [newUser] = await db
      .insert(user)
      .values({
        email: data.email,
        password: data.password,
        role: data.role ?? "student",
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
}

export const userRepository = new UserRepository()
