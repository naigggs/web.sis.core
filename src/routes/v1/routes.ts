import { Hono } from "hono"
import { authRoutes } from "../../domain/auth/auth.routes"
import { studentRoutes } from "../../domain/student/student.routes"
import { courseRoutes } from "../../domain/course/course.routes"
import { subjectRoutes } from "../../domain/subject/subject.routes"
import { gradeRoutes } from "../../domain/grade/grade.routes"

const v1Router = new Hono()

v1Router.route("/auth", authRoutes)
v1Router.route("/students", studentRoutes)
v1Router.route("/courses", courseRoutes)
v1Router.route("/subjects", subjectRoutes)
v1Router.route("/grades", gradeRoutes)

export default v1Router
