import { z } from "zod"

import { USER_ROLES } from "../../db/enums/user"

export const createUserSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    role: z.enum(USER_ROLES).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: z.enum(USER_ROLES).optional(),
  isActive: z.boolean().optional(),
  isBlocked: z.boolean().optional(),
  isSuspended: z.boolean().optional(),
})
