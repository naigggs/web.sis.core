import { z } from "zod"

const gradeValue = z.coerce.number().min(0).max(100).optional()

export const createGradeSchema = z.object({
  studentId: z.string().min(1),
  subjectId: z.string().min(1),
  courseId: z.string().min(1),
  prelim: gradeValue,
  midterm: gradeValue,
  finals: gradeValue,
})

export const updateGradeSchema = z.object({
  prelim: gradeValue,
  midterm: gradeValue,
  finals: gradeValue,
})

export const listGradeSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  courseId: z.string().optional(),
  subjectId: z.string().optional(),
  studentId: z.string().optional(),
})
