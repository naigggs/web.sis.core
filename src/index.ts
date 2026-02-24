import app from "./app"
import { env } from "./config/env"

console.log(`Server is running on port ${env.PORT}`)

export default {
  port: env.PORT,
  fetch: app.fetch,
  idleTimeout: 60,
}
