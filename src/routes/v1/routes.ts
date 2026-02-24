import { Hono } from "hono"
import { authRoutes } from "../../domain/auth/auth.routes"
import { studentRoutes } from "../../domain/student/student.routes"

const v1Router = new Hono()

v1Router.route("/auth", authRoutes)
v1Router.route("/students", studentRoutes)

export default v1Router
