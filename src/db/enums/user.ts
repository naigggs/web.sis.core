import { pgEnum } from "drizzle-orm/pg-core"

export const USER_ROLES = ["student", "staff", "admin"] as const

export const userRoleEnum = pgEnum("user_role", USER_ROLES)
