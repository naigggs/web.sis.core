import type { Context } from "hono"
import { setCookie, deleteCookie, getCookie } from "hono/cookie"

import { env } from "../../config/env"
import { authService } from "./auth.service"
import { loginSchema } from "./auth.schema"
import { createResponse } from "../../shared/utils/response/response"
import { resolveStatusCode } from "../../shared/utils/status-codes"
import { userRepository } from "../user/user.repository"

export class AuthController {
  async handleLogin(c: Context) {
    try {
      const body = await c.req.json()
      const validatedData = loginSchema.parse(body)
      const result = await authService.login(validatedData)

      const isProduction = env.ENVIRONMENT === "production"

      setCookie(c, "accessToken", result.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Lax",
        maxAge: env.JWT_ACCESS_TOKEN_LIFETIME,
        path: "/",
      })

      setCookie(c, "refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Lax",
        maxAge: env.JWT_REFRESH_TOKEN_LIFETIME,
        path: "/",
      })

      const response = createResponse(
        true,
        "Login successful.",
        { user: result.user },
        [],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Login failed.",
        null,
        [error.message],
        null,
        c.req.header("x-request-id"),
      )
      const status = resolveStatusCode(error)
      return c.json(response, status)
    }
  }

  async handleLogout(c: Context) {
    deleteCookie(c, "accessToken")
    deleteCookie(c, "refreshToken")

    const response = createResponse(
      true,
      "Logout successful.",
      null,
      [],
      null,
      c.req.header("x-request-id"),
    )
    return c.json(response)
  }

  async handleRefresh(c: Context) {
    try {
      const refreshToken = getCookie(c, "refreshToken")
      if (!refreshToken) {
        const response = createResponse(
          false,
          "Refresh token not found.",
          null,
          ["Refresh token is missing"],
          null,
          c.req.header("x-request-id"),
        )
        return c.json(response, 401)
      }

      const result = await authService.refreshToken(refreshToken)

      const isProduction = env.ENVIRONMENT === "production"

      setCookie(c, "accessToken", result.accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "None" : "Lax",
        maxAge: env.JWT_ACCESS_TOKEN_LIFETIME,
        path: "/",
      })

      const response = createResponse(
        true,
        "Token refreshed successfully.",
        { user: result.user },
        [],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Token refresh failed.",
        null,
        [error.message],
        null,
        c.req.header("x-request-id"),
      )
      const status = resolveStatusCode(error)
      return c.json(response, status)
    }
  }
  async handleMe(c: Context) {
    try {
      const payload = c.get("user") as { sub: string }
      const user = await userRepository.getById(payload.sub)

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

      const response = createResponse(
        true,
        "User retrieved successfully.",
        { user },
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
}

export const authController = new AuthController()
