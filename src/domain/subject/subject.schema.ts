import { z } from "zod"

const courseIdFilterSchema = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined

    const rawValues = Array.isArray(value) ? value : [value]
    const normalized = rawValues
      .flatMap((item) => item.split(","))
      .map((item) => item.trim())
      .filter((item) => item.length > 0)

    if (normalized.length === 0) return undefined
    return Array.from(new Set(normalized))
  })

export const createSubjectSchema = z.object({
  code: z.string().min(1),
  title: z.string().min(1),
  units: z.number().int().positive(),
  courseId: z.string().min(1),
})

export const updateSubjectSchema = z.object({
  code: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  units: z.number().int().positive().optional(),
  courseId: z.string().min(1).optional(),
})

export const listSubjectSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  search: z.string().optional(),
  courseId: courseIdFilterSchema,
})
