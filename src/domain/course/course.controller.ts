import type { Context } from "hono"

import { courseService } from "./course.service"
import {
  createCourseSchema,
  updateCourseSchema,
  listCourseSchema,
} from "./course.schema"
import { createResponse } from "../../shared/utils/response/response"
import { HTTP_STATUS, resolveStatusCode } from "../../shared/utils/status-codes"

export class CourseController {
  async handleGetAll(c: Context) {
    try {
      const params = listCourseSchema.parse(c.req.query())
      const { courses, total } = await courseService.getAll(params)

      const totalPages = Math.ceil(total / params.limit)

      const response = createResponse(
        true,
        "Courses retrieved successfully.",
        { courses },
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
        "Failed to retrieve courses.",
        null,
        [error.message],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response, resolveStatusCode(error))
    }
  }

  async handleCreate(c: Context) {
    try {
      const body = await c.req.json()
      const validatedData = createCourseSchema.parse(body)
      const course = await courseService.create(validatedData)

      const response = createResponse(
        true,
        "Course created successfully.",
        { course },
        [],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response, HTTP_STATUS.CREATED)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Course creation failed.",
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
      const validatedData = updateCourseSchema.parse(body)
      const course = await courseService.updateById(id, validatedData)

      const response = createResponse(
        true,
        "Course updated successfully.",
        { course },
        [],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Course update failed.",
        null,
        [error.message],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response, resolveStatusCode(error))
    }
  }

  async handleDeleteMany(c: Context) {
    try {
      const body = await c.req.json()
      const { ids } = body as { ids: string[] }
      if (!Array.isArray(ids) || ids.length === 0) {
        throw Object.assign(new Error("ids must be a non-empty array"), {
          status: 400,
        })
      }
      const deleted = await courseService.deleteManyByIds(ids)

      const response = createResponse(
        true,
        `${deleted.length} course(s) deleted successfully.`,
        { deleted },
        [],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Course deletion failed.",
        null,
        [error.message],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response, resolveStatusCode(error))
    }
  }
}

export const courseController = new CourseController()
