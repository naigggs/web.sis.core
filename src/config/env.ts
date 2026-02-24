import { z } from "zod"

const envSchema = z.object({
  // Application Configuration
  PORT: z.coerce.number(),
  ENVIRONMENT: z.enum(["development", "production", "test"]),
  VERSION: z.string(),

  // Database Configuration
  DB_NAME: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_USER: z.string(),
  DB_PASS: z.string(),

  // JWT Configuration
  JWT_ACCESS_SECRET_KEY: z.string(),
  JWT_REFRESH_SECRET_KEY: z.string(),
  JWT_ACCESS_TOKEN_LIFETIME: z.coerce.number(),
  JWT_REFRESH_TOKEN_LIFETIME: z.coerce.number(),

  // CORS Configuration
  CORS_ALLOWED_ORIGINS: z
    .string()
    .transform((str) => str.split(",").map((s) => s.trim())),
  CORS_ALLOWED_METHODS: z
    .string()
    .transform((str) => str.split(",").map((s) => s.trim())),
  CORS_ALLOWED_HEADERS: z
    .string()
    .transform((str) => str.split(",").map((s) => s.trim())),
  CORS_EXPOSE_HEADERS: z
    .string()
    .default("")
    .transform((str) => (str ? str.split(",").map((s) => s.trim()) : [])),
  CORS_ALLOW_CREDENTIALS: z
    .string()
    .transform((str) => str.toLowerCase() === "true" || str === "1"),
})

export const env = envSchema.parse(process.env)
