import { z } from "zod"

import {
  createUserSchema,
  updateUserSchema,
  listUserSchema,
} from "./user.schema"

export type CreateUserDTO = z.infer<typeof createUserSchema>
export type UpdateUserDTO = z.infer<typeof updateUserSchema>
export type ListUserDTO = z.infer<typeof listUserSchema>

// Params passed to the repository after validation & password hashing
export type CreateUserParams = Omit<
  CreateUserDTO,
  "confirmPassword" | "email"
> & {
  email?: string
  password: string
  studentId?: string | null
}
