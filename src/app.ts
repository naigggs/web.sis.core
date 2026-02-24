import { Hono } from "hono"
import { logger } from "hono/logger"

import v1Router from "./routes/v1/routes"

import { corsConfig } from "./config/cors"

const app = new Hono()

app.use("*", corsConfig)
app.use("*", logger())

app.route("/api/v1", v1Router)

export default app
