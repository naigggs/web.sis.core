import { z } from "zod"

export const createStudentSchema = z.object({
  studentNo: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  birthDate: z.string().optional(),
  courseId: z.string().min(1),
})

export const updateStudentSchema = z.object({
  studentNo: z.string().min(1).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  birthDate: z.string().optional(),
  courseId: z.string().min(1).optional(),
})

export const listStudentSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  search: z.string().optional(),
  courseId: z.string().optional(),
})
