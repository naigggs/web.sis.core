import { reservationRepository } from "./reservation.repository"
import { studentRepository } from "../student/student.repository"
import { subjectRepository } from "../subject/subject.repository"
import type { ReservationStatus } from "./reservation.repository"

export class ReservationService {
  async getByStudent(studentId: string) {
    const student = await studentRepository.getById(studentId)
    if (!student) throw new Error("Student not found")
    return await reservationRepository.getByStudent(studentId)
  }

  async reserve(studentId: string, subjectId: string) {
    const [student, subject] = await Promise.all([
      studentRepository.getById(studentId),
      subjectRepository.getById(subjectId),
    ])

    if (!student) throw new Error("Student not found")
    if (!subject) throw new Error("Subject not found")

    // Validation 1: subject must belong to the student's enrolled course
    if (subject.courseId !== student.courseId) {
      throw new Error(
        "Subject does not belong to the student's enrolled course",
      )
    }

    const alreadyReserved = await reservationRepository.getByStudentAndSubject(
      studentId,
      subjectId,
    )
    if (alreadyReserved) throw new Error("Subject already reserved")

    // Validation 3: slot limit
    const activeCount =
      await reservationRepository.countActiveBySubject(subjectId)
    if (activeCount >= subject.slotLimit) {
      throw new Error(
        `Subject is full. Maximum of ${subject.slotLimit} reservations allowed.`,
      )
    }

    // Validation 2: prerequisite enforcement
    // A prerequisite is satisfied when the student has a grade row for it where
    // finalGrade >= 75 OR remarks = 'PASSED' (case-insensitive).
    const prerequisites =
      await reservationRepository.getPrerequisites(subjectId)

    if (prerequisites.length > 0) {
      const missingPrereqs: string[] = []

      for (const prereq of prerequisites) {
        const gradeRow = await reservationRepository.getPassingGrade(
          studentId,
          prereq.prerequisiteSubjectId,
        )

        const passed =
          gradeRow &&
          (Number(gradeRow.finalGrade) >= 75 ||
            gradeRow.remarks?.toLowerCase() === "passed")

        if (!passed) {
          missingPrereqs.push(prereq.prerequisiteSubject.code)
        }
      }

      if (missingPrereqs.length > 0) {
        throw new Error(`Missing prerequisites: [${missingPrereqs.join(", ")}]`)
      }
    }

    return await reservationRepository.create(studentId, subjectId)
  }

  async cancel(studentId: string, reservationId: string) {
    const student = await studentRepository.getById(studentId)
    if (!student) throw new Error("Student not found")

    const reservation = await reservationRepository.getById(reservationId)
    if (!reservation) throw new Error("Reservation not found")
    if (reservation.studentId !== studentId) {
      throw new Error("Reservation does not belong to this student")
    }

    return await reservationRepository.deleteById(reservationId)
  }

  async updateStatus(
    reservationId: string,
    status: Extract<ReservationStatus, "APPROVED" | "DENIED">,
  ) {
    const reservation = await reservationRepository.getById(reservationId)
    if (!reservation) throw new Error("Reservation not found")
    if (reservation.status === "CANCELLED") {
      throw new Error("Cannot update a cancelled reservation")
    }
    if (reservation.status === status) {
      throw new Error(`Reservation is already ${status}`)
    }
    return await reservationRepository.updateStatus(reservationId, status)
  }
}

export const reservationService = new ReservationService()
