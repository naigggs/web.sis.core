import { z } from "zod"

import { createUserSchema, updateUserSchema } from "./user.schema"

export type CreateUserDTO = z.infer<typeof createUserSchema>
export type UpdateUserDTO = z.infer<typeof updateUserSchema>

// Params passed to the repository after validation & password hashing
export type CreateUserParams = Omit<CreateUserDTO, "confirmPassword"> & {
  password: string
}
