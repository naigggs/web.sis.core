import type { Context } from "hono"

import { gradeService } from "./grade.service"
import {
  createGradeSchema,
  updateGradeSchema,
  listGradeSchema,
} from "./grade.schema"
import { createResponse } from "../../shared/utils/response/response"
import { HTTP_STATUS, resolveStatusCode } from "../../shared/utils/status-codes"

export class GradeController {
  async handleGetAll(c: Context) {
    try {
      const params = listGradeSchema.parse(c.req.query())
      const { grades, total } = await gradeService.getAll(params)

      const totalPages = Math.ceil(total / params.limit)

      const response = createResponse(
        true,
        "Grades retrieved successfully.",
        { grades },
        [],
        {
          page: params.page,
          limit: params.limit,
          totalItems: total,
          totalPages,
          hasNextPage: params.page < totalPages,
          hasPrevPage: params.page > 1,
        },
        c.req.header("x-request-id"),
      )
      return c.json(response)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Failed to retrieve grades.",
        null,
        [error.message],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response, resolveStatusCode(error))
    }
  }

  async handleUpsert(c: Context) {
    try {
      const body = await c.req.json()
      const validatedData = createGradeSchema.parse(body)
      const payload = c.get("user") as { sub: string }

      const grade = await gradeService.upsert(validatedData, payload.sub)

      const response = createResponse(
        true,
        "Grade saved successfully.",
        { grade },
        [],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response, HTTP_STATUS.CREATED)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Failed to save grade.",
        null,
        [error.message],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response, resolveStatusCode(error))
    }
  }

  async handleUpdateById(c: Context) {
    try {
      const { id } = c.req.param()
      const body = await c.req.json()
      const validatedData = updateGradeSchema.parse(body)
      const payload = c.get("user") as { sub: string }

      const grade = await gradeService.updateById(
        id,
        validatedData,
        payload.sub,
      )

      const response = createResponse(
        true,
        "Grade updated successfully.",
        { grade },
        [],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Failed to update grade.",
        null,
        [error.message],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response, resolveStatusCode(error))
    }
  }
}

export const gradeController = new GradeController()
