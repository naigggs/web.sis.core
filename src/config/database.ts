import { drizzle } from "drizzle-orm/postgres-js"
import * as postgres from "postgres"

import { env } from "./env"

const connectionString = `postgres://${env.DB_USER}:${env.DB_PASS}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}${
  env.ENVIRONMENT === "production" ? "?ssl=require" : ""
}`

import * as schema from "../db/schema/_index"

const client = postgres(connectionString, { prepare: false })
export const db = drizzle(client, { schema })
