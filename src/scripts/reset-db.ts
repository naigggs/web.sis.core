/**
 * Reset script — drops all DB objects and clears all migration files.
 * Run with: bun run db:reset
 * ⚠️  NEVER run against a production database.
 */

import postgres from "postgres"
import { rmSync, readdirSync } from "fs"
import { join } from "path"
import { env } from "../config/env"

const MIGRATIONS_DIR = join(process.cwd(), "src/db/migrations")

const sql = postgres({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASS,
  database: env.DB_NAME,
  ssl: env.ENVIRONMENT === "production" ? "require" : false,
})

async function resetDatabase() {
  console.log("⚠️  Resetting database...\n")

  // ── 1. Drop everything in the public schema ──────────────────────────────
  await sql`DROP SCHEMA public CASCADE`
  await sql`CREATE SCHEMA public`
  await sql`GRANT ALL ON SCHEMA public TO public`
  console.log("✅ Database schema dropped and recreated.")

  // ── 2. Clear the drizzle migration tracking schema (if it exists) ────────
  try {
    await sql`DROP SCHEMA IF EXISTS drizzle CASCADE`
    console.log("✅ Drizzle migration history cleared.")
  } catch {
    // ignore if it doesn't exist
  }

  await sql.end()
}

function clearMigrationFiles() {
  // Delete every .sql file and the entire meta/ folder
  const entries = readdirSync(MIGRATIONS_DIR, { withFileTypes: true })

  let cleared = 0
  for (const entry of entries) {
    const fullPath = join(MIGRATIONS_DIR, entry.name)

    if (entry.isDirectory() && entry.name === "meta") {
      rmSync(fullPath, { recursive: true, force: true })
      cleared++
    } else if (entry.isFile() && entry.name.endsWith(".sql")) {
      rmSync(fullPath, { force: true })
      cleared++
    }
  }

  console.log(
    `✅ ${cleared} migration file(s)/folder(s) removed from ${MIGRATIONS_DIR}`,
  )
}

async function main() {
  try {
    await resetDatabase()
    clearMigrationFiles()
    console.log(
      "\n🎉 Reset complete. Run `bun run db:generate` then `bun run db:migrate` to start fresh.\n",
    )
    process.exit(0)
  } catch (error) {
    console.error("\n❌ Reset failed:", error)
    process.exit(1)
  }
}

main()
