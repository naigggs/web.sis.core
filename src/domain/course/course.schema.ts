import { z } from "zod"

export const createCourseSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
})

export const updateCourseSchema = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
})

export const listCourseSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  search: z.string().optional(),
})

export const addSubjectsToCourseSchema = z.object({
  subjects: z
    .array(
      z.object({
        code: z.string().min(1),
        title: z.string().min(1),
        units: z.number().int().positive(),
        slotLimit: z.number().int().positive().optional(),
      }),
    )
    .min(1, "At least one subject is required"),
})
