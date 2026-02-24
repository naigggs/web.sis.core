import { z } from "zod"

import {
  createCourseSchema,
  updateCourseSchema,
  listCourseSchema,
} from "./course.schema"

export type CreateCourseDTO = z.infer<typeof createCourseSchema>
export type UpdateCourseDTO = z.infer<typeof updateCourseSchema>
export type ListCourseDTO = z.infer<typeof listCourseSchema>
