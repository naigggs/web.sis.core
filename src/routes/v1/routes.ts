import { Hono } from "hono"
import { authRoutes } from "../../domain/auth/auth.routes"

const v1Router = new Hono()

v1Router.route("/auth", authRoutes)

export default v1Router
