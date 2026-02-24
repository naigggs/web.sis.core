import { z } from "zod"

import {
  createGradeSchema,
  updateGradeSchema,
  listGradeSchema,
} from "./grade.schema"

export type CreateGradeDTO = z.infer<typeof createGradeSchema>
export type UpdateGradeDTO = z.infer<typeof updateGradeSchema>
export type ListGradeDTO = z.infer<typeof listGradeSchema>
