import { sign, verify } from "hono/jwt"

import { env } from "../../config/env"
import type { LoginDTO } from "./auth.dto"
import { userRepository } from "../user/user.repository"

export class AuthService {
  async login(data: LoginDTO) {
    const user = await userRepository.getByEmail(data.email)
    if (!user) {
      throw new Error("Invalid credentials")
    }

    if (!user.password) {
      throw new Error("Invalid credentials")
    }

    const isMatch = await Bun.password.verify(data.password, user.password)
    if (!isMatch) {
      throw new Error("Invalid credentials")
    }

    const accessPayload = {
      sub: user.id,
      role: user.role,
      studentId: user.studentId ?? undefined,
      type: "access",
      exp: Math.floor(Date.now() / 1000) + env.JWT_ACCESS_TOKEN_LIFETIME,
    }
    const accessToken = await sign(
      accessPayload,
      env.JWT_ACCESS_SECRET_KEY,
      "HS256",
    )

    const refreshPayload = {
      sub: user.id,
      type: "refresh",
      exp: Math.floor(Date.now() / 1000) + env.JWT_REFRESH_TOKEN_LIFETIME,
    }
    const refreshToken = await sign(
      refreshPayload,
      env.JWT_REFRESH_SECRET_KEY,
      "HS256",
    )

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    }
  }

  async refreshToken(token: string) {
    try {
      const payload = await verify(token, env.JWT_REFRESH_SECRET_KEY, "HS256")
      if (payload.type !== "refresh") {
        throw new Error("Invalid token type")
      }
      const userId = payload.sub as string
      const user = await userRepository.getById(userId)

      if (!user) {
        throw new Error("User not found")
      }

      const accessPayload = {
        sub: user.id,
        role: user.role,
        type: "access",
        exp: Math.floor(Date.now() / 1000) + env.JWT_ACCESS_TOKEN_LIFETIME,
      }
      const accessToken = await sign(
        accessPayload,
        env.JWT_ACCESS_SECRET_KEY,
        "HS256",
      )

      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      }
    } catch (error) {
      throw new Error("Invalid refresh token")
    }
  }
}

export const authService = new AuthService()
