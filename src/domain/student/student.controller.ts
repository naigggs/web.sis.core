import type { Context } from "hono"

import { studentService } from "./student.service"
import {
  createStudentSchema,
  updateStudentSchema,
  listStudentSchema,
} from "./student.schema"
import { createResponse } from "../../shared/utils/response/response"
import { HTTP_STATUS, resolveStatusCode } from "../../shared/utils/status-codes"

export class StudentController {
  async handleGetAll(c: Context) {
    try {
      const query = c.req.query()
      const params = listStudentSchema.parse(query)
      const { students, total } = await studentService.getAll(params)

      const totalPages = Math.ceil(total / params.limit)

      const response = createResponse(
        true,
        "Students retrieved successfully.",
        { students },
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
        "Failed to retrieve students.",
        null,
        [error.message],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response, resolveStatusCode(error))
    }
  }

  async handleGetById(c: Context) {
    try {
      const { id } = c.req.param()
      const student = await studentService.getDetailedById(id)

      const response = createResponse(
        true,
        "Student retrieved successfully.",
        { student },
        [],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Failed to retrieve student.",
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
      const validatedData = createStudentSchema.parse(body)
      const student = await studentService.create(validatedData)

      const response = createResponse(
        true,
        "Student created successfully.",
        { student },
        [],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response, HTTP_STATUS.CREATED)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Student creation failed.",
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
      const validatedData = updateStudentSchema.parse(body)
      const student = await studentService.updateById(id, validatedData)

      const response = createResponse(
        true,
        "Student updated successfully.",
        { student },
        [],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Student update failed.",
        null,
        [error.message],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response, resolveStatusCode(error))
    }
  }

  async handleDeleteById(c: Context) {
    try {
      const { id } = c.req.param()
      await studentService.deleteById(id)

      const response = createResponse(
        true,
        "Student deleted successfully.",
        null,
        [],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Student deletion failed.",
        null,
        [error.message],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response, resolveStatusCode(error))
    }
  }

  async handleGetEligibleSubjects(c: Context) {
    try {
      const { id } = c.req.param()
      const subjects = await studentService.getEligibleSubjects(id)

      const response = createResponse(
        true,
        "Eligible subjects retrieved successfully.",
        { subjects },
        [],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Failed to retrieve eligible subjects.",
        null,
        [error.message],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response, resolveStatusCode(error))
    }
  }
}

export const studentController = new StudentController()
