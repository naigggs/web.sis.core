import { z } from "zod"

import { loginSchema } from "./auth.schema"

export type LoginDTO = z.infer<typeof loginSchema>
