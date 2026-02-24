import type { Context, Next } from "hono"
import { getCookie } from "hono/cookie"
import { verify } from "hono/jwt"

import { env } from "../../config/env"
import { createResponse } from "../utils/response/response"

export const authMiddleware = async (c: Context, next: Next) => {
    try {
        const accessToken = getCookie(c, "accessToken")

        if (!accessToken) {
            const response = createResponse(
                false,
                "Unauthorized. Access denied.",
                null,
                ["Token is required"],
                null,
                c.req.header("x-request-id"),
            )
            return c.json(response, 401)
        }

        const payload = await verify(accessToken, env.JWT_ACCESS_SECRET_KEY!)
        c.set("user", payload)

        await next()
    } catch (error) {
        const response = createResponse(
            false,
            "Unauthorized. Access denied.",
            null,
            ["Token is invalid or expired"],
            null,
            c.req.header("x-request-id"),
        )
        return c.json(response, 401)
    }
}

export const requireAuth = authMiddleware
