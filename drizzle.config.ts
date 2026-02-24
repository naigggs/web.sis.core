import { defineConfig } from "drizzle-kit"
import { env } from "./src/config/env"

export default defineConfig({
  schema: "./src/db/schema",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB_NAME,
    port: env.DB_PORT,
    ssl: env.ENVIRONMENT === "production" ? "require" : false,
  },
})
