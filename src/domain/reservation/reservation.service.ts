import { reservationRepository } from "./reservation.repository"
import { studentRepository } from "../student/student.repository"
import { subjectRepository } from "../subject/subject.repository"

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

    const alreadyReserved = await reservationRepository.getByStudentAndSubject(
      studentId,
      subjectId,
    )
    if (alreadyReserved) throw new Error("Subject already reserved")

    // Check prerequisites
    const prerequisites =
      await reservationRepository.getPrerequisites(subjectId)

    if (prerequisites.length > 0) {
      const missingPrereqs: string[] = []

      for (const prereq of prerequisites) {
        const passingGrade = await reservationRepository.getPassingGrade(
          studentId,
          prereq.prerequisiteSubjectId,
        )

        if (!passingGrade || passingGrade.finalGrade === null) {
          missingPrereqs.push(prereq.prerequisiteSubjectId)
        }
      }

      if (missingPrereqs.length > 0) {
        throw new Error(
          `Prerequisites not satisfied. Missing grades for subject IDs: ${missingPrereqs.join(", ")}`,
        )
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
}

export const reservationService = new ReservationService()
