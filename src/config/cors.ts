import { cors } from "hono/cors"

import { env } from "./env"

export const corsConfig = cors({
    origin: env.CORS_ALLOWED_ORIGINS,
    allowMethods: env.CORS_ALLOWED_METHODS,
    allowHeaders: env.CORS_ALLOWED_HEADERS,
    exposeHeaders: env.CORS_EXPOSE_HEADERS,
    maxAge: 600,
    credentials: env.CORS_ALLOW_CREDENTIALS,
})
