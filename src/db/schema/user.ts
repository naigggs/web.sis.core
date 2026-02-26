import { uuidv7 } from "uuidv7"
import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core"

import { userRoleEnum } from "../enums/user"
import { student } from "./student"

export const user = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => `${uuidv7()}`),

  // User information
  email: text("email").unique(),
  password: text("password"),
  role: userRoleEnum("role").default("student").notNull(),

  // Linked student account (populated for student-role users)
  studentId: text("student_id").references(() => student.id, {
    onDelete: "set null",
  }),

  // Flags
  isActive: boolean("isActive").default(true),
  isBlocked: boolean("isBlocked").default(false),
  isSuspended: boolean("isSuspended").default(false),

  // Audit fields
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
})
