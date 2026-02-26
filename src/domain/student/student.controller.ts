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

  async handleDeleteMany(c: Context) {
    try {
      const body = await c.req.json()
      const { ids } = body as { ids: string[] }
      if (!Array.isArray(ids) || ids.length === 0) {
        throw Object.assign(new Error("ids must be a non-empty array"), {
          status: 400,
        })
      }
      const deleted = await studentService.deleteManyByIds(ids)

      const response = createResponse(
        true,
        `${deleted.length} student(s) deleted successfully.`,
        { deleted },
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

  async handleExport(c: Context) {
    try {
      const csv = await studentService.exportToCsv()
      c.header("Content-Type", "text/csv; charset=utf-8")
      c.header("Content-Disposition", 'attachment; filename="students.csv"')
      return c.body(csv)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Export failed.",
        null,
        [error.message],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response, resolveStatusCode(error))
    }
  }

  async handleImport(c: Context) {
    try {
      const formData = await c.req.formData()
      const file = formData.get("file")

      if (!file || typeof file === "string") {
        throw Object.assign(
          new Error(
            "No CSV file provided. Send a multipart field named 'file'.",
          ),
          { status: 400 },
        )
      }

      const csvText = await (file as File).text()
      const result = await studentService.importFromCsv(csvText)

      const response = createResponse(
        true,
        `Import complete: ${result.imported} imported, ${result.failed.length} failed.`,
        result,
        [],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Import failed.",
        null,
        [error.message],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response, resolveStatusCode(error))
    }
  }

  // ── Student "me" handlers ─────────────────────────────────────────────────

  async handleGetMe(c: Context) {
    try {
      const user = c.get("user") as { studentId?: string }
      if (!user.studentId) {
        return c.json(
          createResponse(
            false,
            "No student profile linked to this account.",
            null,
            [],
            null,
            c.req.header("x-request-id"),
          ),
          HTTP_STATUS.BAD_REQUEST,
        )
      }
      const student = await studentService.getDetailedById(user.studentId)
      return c.json(
        createResponse(
          true,
          "Student profile retrieved successfully.",
          { student },
          [],
          null,
          c.req.header("x-request-id"),
        ),
      )
    } catch (error: any) {
      return c.json(
        createResponse(
          false,
          "Failed to retrieve student profile.",
          null,
          [error.message],
          null,
          c.req.header("x-request-id"),
        ),
        resolveStatusCode(error),
      )
    }
  }

  async handleGetMeEligibleSubjects(c: Context) {
    try {
      const user = c.get("user") as { studentId?: string }
      if (!user.studentId) {
        return c.json(
          createResponse(
            false,
            "No student profile linked to this account.",
            null,
            [],
            null,
            c.req.header("x-request-id"),
          ),
          HTTP_STATUS.BAD_REQUEST,
        )
      }
      const subjects = await studentService.getEligibleSubjects(user.studentId)
      return c.json(
        createResponse(
          true,
          "Eligible subjects retrieved successfully.",
          { subjects },
          [],
          null,
          c.req.header("x-request-id"),
        ),
      )
    } catch (error: any) {
      return c.json(
        createResponse(
          false,
          "Failed to retrieve eligible subjects.",
          null,
          [error.message],
          null,
          c.req.header("x-request-id"),
        ),
        resolveStatusCode(error),
      )
    }
  }
}

export const studentController = new StudentController()
