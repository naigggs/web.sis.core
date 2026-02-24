import { eq, and } from "drizzle-orm"

import { db } from "../../config/database"
import { subjectReservation } from "../../db/schema/subject-reservation"
import { subjectPrerequisite } from "../../db/schema/subject-prerequisite"
import { grade } from "../../db/schema/grade"

export class ReservationRepository {
  async getByStudent(studentId: string) {
    return await db.query.subjectReservation.findMany({
      where: eq(subjectReservation.studentId, studentId),
      with: { subject: true },
    })
  }

  async getById(reservationId: string) {
    return await db.query.subjectReservation.findFirst({
      where: eq(subjectReservation.id, reservationId),
      with: { subject: true },
    })
  }

  async getByStudentAndSubject(studentId: string, subjectId: string) {
    return await db.query.subjectReservation.findFirst({
      where: and(
        eq(subjectReservation.studentId, studentId),
        eq(subjectReservation.subjectId, subjectId),
      ),
    })
  }

  async getPrerequisites(subjectId: string) {
    return await db.query.subjectPrerequisite.findMany({
      where: eq(subjectPrerequisite.subjectId, subjectId),
    })
  }

  async getPassingGrade(studentId: string, subjectId: string) {
    return await db.query.grade.findFirst({
      where: and(
        eq(grade.studentId, studentId),
        eq(grade.subjectId, subjectId),
      ),
    })
  }

  async create(studentId: string, subjectId: string) {
    const [reservation] = await db
      .insert(subjectReservation)
      .values({ studentId, subjectId })
      .returning()
    return reservation
  }

  async deleteById(reservationId: string) {
    return await db
      .delete(subjectReservation)
      .where(eq(subjectReservation.id, reservationId))
      .returning()
  }
}

export const reservationRepository = new ReservationRepository()
