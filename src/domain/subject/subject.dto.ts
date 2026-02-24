import { z } from "zod"

import {
  createSubjectSchema,
  updateSubjectSchema,
  listSubjectSchema,
} from "./subject.schema"

export type CreateSubjectDTO = z.infer<typeof createSubjectSchema>
export type UpdateSubjectDTO = z.infer<typeof updateSubjectSchema>
export type ListSubjectDTO = z.infer<typeof listSubjectSchema>
