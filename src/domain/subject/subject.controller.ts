import type { Context } from "hono"

import { subjectService } from "./subject.service"
import {
  createSubjectSchema,
  updateSubjectSchema,
  listSubjectSchema,
} from "./subject.schema"
import { createResponse } from "../../shared/utils/response/response"
import { HTTP_STATUS, resolveStatusCode } from "../../shared/utils/status-codes"

export class SubjectController {
  async handleGetAll(c: Context) {
    try {
      const params = listSubjectSchema.parse(c.req.query())
      const { subjects, total } = await subjectService.getAll(params)

      const totalPages = Math.ceil(total / params.limit)

      const response = createResponse(
        true,
        "Subjects retrieved successfully.",
        { subjects },
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
        "Failed to retrieve subjects.",
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
      const validatedData = createSubjectSchema.parse(body)
      const subject = await subjectService.create(validatedData)

      const response = createResponse(
        true,
        "Subject created successfully.",
        { subject },
        [],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response, HTTP_STATUS.CREATED)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Subject creation failed.",
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
      const validatedData = updateSubjectSchema.parse(body)
      const subject = await subjectService.updateById(id, validatedData)

      const response = createResponse(
        true,
        "Subject updated successfully.",
        { subject },
        [],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Subject update failed.",
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
      const deleted = await subjectService.deleteManyByIds(ids)

      const response = createResponse(
        true,
        `${deleted.length} subject(s) deleted successfully.`,
        { deleted },
        [],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Subject deletion failed.",
        null,
        [error.message],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response, resolveStatusCode(error))
    }
  }

  async handleGetPrerequisites(c: Context) {
    try {
      const { id } = c.req.param()
      const prerequisites = await subjectService.getPrerequisites(id)

      const response = createResponse(
        true,
        "Prerequisites retrieved successfully.",
        { prerequisites },
        [],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Failed to retrieve prerequisites.",
        null,
        [error.message],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response, resolveStatusCode(error))
    }
  }

  async handleAddPrerequisite(c: Context) {
    try {
      const { id } = c.req.param()
      const body = await c.req.json()
      const { prerequisiteSubjectId } = body

      if (!prerequisiteSubjectId) {
        return c.json(
          createResponse(
            false,
            "prerequisiteSubjectId is required.",
            null,
            ["prerequisiteSubjectId is required"],
            null,
            c.req.header("x-request-id"),
          ),
          HTTP_STATUS.BAD_REQUEST,
        )
      }

      const prerequisite = await subjectService.addPrerequisite(
        id,
        prerequisiteSubjectId,
      )

      const response = createResponse(
        true,
        "Prerequisite added successfully.",
        { prerequisite },
        [],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response, HTTP_STATUS.CREATED)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Failed to add prerequisite.",
        null,
        [error.message],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response, resolveStatusCode(error))
    }
  }

  async handleRemovePrerequisite(c: Context) {
    try {
      const { id, prerequisiteSubjectId } = c.req.param()
      await subjectService.removePrerequisite(id, prerequisiteSubjectId)

      const response = createResponse(
        true,
        "Prerequisite removed successfully.",
        null,
        [],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Failed to remove prerequisite.",
        null,
        [error.message],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response, resolveStatusCode(error))
    }
  }

  async handleGetApprovedStudents(c: Context) {
    try {
      const { id } = c.req.param()
      const students = await subjectService.getApprovedStudents(id)

      return c.json(
        createResponse(
          true,
          "Approved students retrieved successfully.",
          { students },
          [],
          null,
          c.req.header("x-request-id"),
        ),
      )
    } catch (error: any) {
      return c.json(
        createResponse(
          false,
          "Failed to retrieve approved students.",
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

export const subjectController = new SubjectController()
