import { z } from "zod"

import {
  createStudentSchema,
  updateStudentSchema,
  listStudentSchema,
} from "./student.schema"

export type CreateStudentDTO = z.infer<typeof createStudentSchema>
export type UpdateStudentDTO = z.infer<typeof updateStudentSchema>
export type ListStudentDTO = z.infer<typeof listStudentSchema>
