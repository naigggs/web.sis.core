import { gradeRepository } from "./grade.repository"
import { studentRepository } from "../student/student.repository"
import { subjectRepository } from "../subject/subject.repository"
import { courseRepository } from "../course/course.repository"
import { reservationRepository } from "../reservation/reservation.repository"
import type { CreateGradeDTO, UpdateGradeDTO, ListGradeDTO } from "./grade.dto"

function computeGrade(
  prelim?: number,
  midterm?: number,
  finals?: number,
): { finalGrade: number; remarks: "PASSED" | "FAILED" } | undefined {
  if (prelim === undefined || midterm === undefined || finals === undefined) {
    return undefined
  }
  const finalGrade =
    Math.round((prelim * 0.3 + midterm * 0.3 + finals * 0.4) * 100) / 100
  const remarks = finalGrade >= 75 ? "PASSED" : "FAILED"
  return { finalGrade, remarks }
}

export class GradeService {
  async getAll(params: ListGradeDTO) {
    return await gradeRepository.getAll(params)
  }

  async upsert(data: CreateGradeDTO, encodedByUserId: string) {
    const [student, subject, course] = await Promise.all([
      studentRepository.getById(data.studentId),
      subjectRepository.getById(data.subjectId),
      courseRepository.getById(data.courseId),
    ])

    if (!student) throw new Error("Student not found")
    if (!subject) throw new Error("Subject not found")
    if (!course) throw new Error("Course not found")

    // Reservation must be APPROVED before grading
    const reservation = await reservationRepository.getByStudentAndSubject(
      data.studentId,
      data.subjectId,
    )
    if (!reservation || reservation.status !== "APPROVED") {
      throw new Error(
        "Student does not have an approved reservation for this subject",
      )
    }

    const computed = computeGrade(data.prelim, data.midterm, data.finals)
    return await gradeRepository.upsert({
      ...data,
      encodedByUserId,
      finalGrade: computed?.finalGrade,
      remarks: computed?.remarks,
    })
  }

  async updateById(id: string, data: UpdateGradeDTO, encodedByUserId: string) {
    const existing = await gradeRepository.getById(id)
    if (!existing) throw new Error("Grade not found")

    // Merge incoming values with current stored values for the computation
    const prelim =
      data.prelim ??
      (existing.prelim !== null ? Number(existing.prelim) : undefined)
    const midterm =
      data.midterm ??
      (existing.midterm !== null ? Number(existing.midterm) : undefined)
    const finals =
      data.finals ??
      (existing.finals !== null ? Number(existing.finals) : undefined)

    const computed = computeGrade(prelim, midterm, finals)
    return await gradeRepository.updateById(id, {
      ...data,
      encodedByUserId,
      finalGrade: computed?.finalGrade,
      remarks: computed?.remarks,
    })
  }
}

export const gradeService = new GradeService()
