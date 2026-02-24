import type { Context, Next } from "hono"

import { createResponse } from "../utils/response/response"

export const checkRole = (allowedRoles: string[]) => {
    return async (c: Context, next: Next) => {
        const user = c.get("user")

        if (!user || !user.role || !allowedRoles.includes(user.role)) {
            const response = createResponse(
                false,
                "Forbidden. Insufficient permissions.",
                null,
                ["You do not have permission to access this resource"],
                null,
                c.req.header("x-request-id"),
            )
            return c.json(response, 403)
        }

        await next()
    }
}
