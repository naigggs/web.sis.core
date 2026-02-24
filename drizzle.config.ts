import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/db/schema",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.DB_HOST!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASS!,
    database: process.env.DB_NAME!,
    port: Number(process.env.DB_PORT ?? 5432),
    ssl: process.env.ENVIRONMENT === "production" ? "require" : false,
  },
})
