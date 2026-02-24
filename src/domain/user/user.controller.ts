import type { Context } from "hono"

import { userService } from "./user.service"
import { createUserSchema, updateUserSchema } from "./user.schema"
import { createResponse } from "../../shared/utils/response/response"
import { HTTP_STATUS, resolveStatusCode } from "../../shared/utils/status-codes"

export class UserController {
  async handleCreate(c: Context) {
    try {
      const body = await c.req.json()
      const validatedData = createUserSchema.parse(body)

      const newUser = await userService.create(validatedData)
      if (!newUser) {
        throw new Error("User creation failed")
      }

      const { password, ...userData } = newUser

      const response = createResponse(
        true,
        "User created successfully.",
        { user: userData },
        [],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response, HTTP_STATUS.CREATED)
    } catch (error: any) {
      const response = createResponse(
        false,
        "User creation failed.",
        null,
        [error.message],
        null,
        c.req.header("x-request-id"),
      )
      const status = resolveStatusCode(error)
      return c.json(response, status)
    }
  }

  async handleGetAll(c: Context) {
    try {
      const page = Number(c.req.query("page")) || 1
      const limit = Number(c.req.query("limit")) || 10

      const { users, total } = await userService.getAll({ page, limit })

      const totalPages = Math.ceil(total / limit)
      const hasNextPage = page < totalPages
      const hasPrevPage = page > 1

      const formattedUsers = users.map((user) => {
        const { password, ...userData } = user
        return userData
      })

      const pagination = {
        page,
        limit,
        totalItems: total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      }

      const response = createResponse(
        true,
        "Users retrieved successfully.",
        { users: formattedUsers },
        [],
        pagination,
        c.req.header("x-request-id"),
      )
      return c.json(response)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Failed to retrieve users.",
        null,
        [error.message],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response, HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }
  }

  async handleGetById(c: Context) {
    try {
      const id = c.req.param("id")
      const user = await userService.getById(id)

      if (!user) {
        const response = createResponse(
          false,
          "User not found.",
          null,
          ["User not found"],
          null,
          c.req.header("x-request-id"),
        )
        return c.json(response, 404)
      }

      const { password, ...userData } = user

      const response = createResponse(
        true,
        "User retrieved successfully.",
        { user: userData },
        [],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Failed to retrieve user.",
        null,
        [error.message],
        null,
        c.req.header("x-request-id"),
      )
      const status = resolveStatusCode(error)
      return c.json(response, status)
    }
  }

  async handleUpdateById(c: Context) {
    try {
      const id = c.req.param("id")
      const body = await c.req.json()
      const validatedData = updateUserSchema.parse(body)

      const user = await userService.updateById(id, validatedData)

      if (!user) {
        const response = createResponse(
          false,
          "User not found.",
          null,
          ["User not found"],
          null,
          c.req.header("x-request-id"),
        )
        return c.json(response, 404)
      }

      const { password, ...userData } = user

      const response = createResponse(
        true,
        "User updated successfully.",
        { user: userData },
        [],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Failed to update user.",
        null,
        [error.message],
        null,
        c.req.header("x-request-id"),
      )
      const status = resolveStatusCode(error)
      return c.json(response, status)
    }
  }

  async handleSoftDeleteById(c: Context) {
    try {
      const id = c.req.param("id")
      await userService.softDeleteById(id)

      const response = createResponse(
        true,
        "User deleted successfully.",
        null,
        [],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Failed to delete user.",
        null,
        [error.message],
        null,
        c.req.header("x-request-id"),
      )
      const status = resolveStatusCode(error)
      return c.json(response, status)
    }
  }

  async handleHardDeleteById(c: Context) {
    try {
      const id = c.req.param("id")
      await userService.hardDeleteById(id)

      const response = createResponse(
        true,
        "User permanently deleted.",
        null,
        [],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Failed to permanently delete user.",
        null,
        [error.message],
        null,
        c.req.header("x-request-id"),
      )
      const status = resolveStatusCode(error)
      return c.json(response, status)
    }
  }
}

export const userController = new UserController()
