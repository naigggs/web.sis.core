import { gradeRepository } from "./grade.repository"
import { studentRepository } from "../student/student.repository"
import { subjectRepository } from "../subject/subject.repository"
import { courseRepository } from "../course/course.repository"
import { reservationRepository } from "../reservation/reservation.repository"
import { gradeAuditRepository } from "./grade-audit.repository"
import type {
  CreateGradeDTO,
  UpdateGradeDTO,
  ListGradeDTO,
  GradeHistoryDTO,
} from "./grade.dto"

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

  async getHistory(params: GradeHistoryDTO) {
    const existing = await gradeRepository.getByComposite(
      params.studentId,
      params.subjectId,
      params.courseId,
    )
    if (!existing) throw new Error("Grade not found")

    return await gradeAuditRepository.getByGradeId(existing.id)
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

    const existing = await gradeRepository.getByComposite(
      data.studentId,
      data.subjectId,
      data.courseId,
    )

    const computed = computeGrade(data.prelim, data.midterm, data.finals)
    const saved = await gradeRepository.upsert({
      ...data,
      encodedByUserId,
      finalGrade: computed?.finalGrade,
      remarks: computed?.remarks,
    })

    await gradeAuditRepository.create({
      gradeId: saved.id,
      action: existing ? "UPDATED" : "CREATED",
      prelim: saved.prelim,
      midterm: saved.midterm,
      finals: saved.finals,
      finalGrade: saved.finalGrade,
      remarks: saved.remarks,
      performedByUserId: encodedByUserId,
    })

    return saved
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
    const updated = await gradeRepository.updateById(id, {
      ...data,
      encodedByUserId,
      finalGrade: computed?.finalGrade,
      remarks: computed?.remarks,
    })

    await gradeAuditRepository.create({
      gradeId: updated.id,
      action: "UPDATED",
      prelim: updated.prelim,
      midterm: updated.midterm,
      finals: updated.finals,
      finalGrade: updated.finalGrade,
      remarks: updated.remarks,
      performedByUserId: encodedByUserId,
    })

    return updated
  }
}

export const gradeService = new GradeService()
