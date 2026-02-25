import { studentRepository } from "./student.repository"
import { subjectRepository } from "../subject/subject.repository"
import { gradeRepository } from "../grade/grade.repository"
import { reservationRepository } from "../reservation/reservation.repository"
import type {
  CreateStudentDTO,
  UpdateStudentDTO,
  ListStudentDTO,
} from "./student.dto"

export class StudentService {
  async getAll(params: ListStudentDTO) {
    return await studentRepository.getAll(params)
  }

  async getById(id: string) {
    const student = await studentRepository.getById(id)
    if (!student) {
      throw new Error("Student not found")
    }
    return student
  }

  async create(data: CreateStudentDTO) {
    const existingNo = await studentRepository.getByStudentNo(data.studentNo)
    if (existingNo) {
      throw new Error("Student number already exists")
    }

    if (data.email) {
      const existingEmail = await studentRepository.getByEmail(data.email)
      if (existingEmail) {
        throw new Error("Email already in use")
      }
    }

    return await studentRepository.create(data)
  }

  async updateById(id: string, data: UpdateStudentDTO) {
    const existing = await studentRepository.getById(id)
    if (!existing) {
      throw new Error("Student not found")
    }

    if (data.studentNo && data.studentNo !== existing.studentNo) {
      const taken = await studentRepository.getByStudentNo(data.studentNo)
      if (taken) {
        throw new Error("Student number already exists")
      }
    }

    if (data.email && data.email !== existing.email) {
      const emailTaken = await studentRepository.getByEmail(data.email)
      if (emailTaken) {
        throw new Error("Email already in use")
      }
    }

    return await studentRepository.updateById(id, data)
  }

  async deleteManyByIds(ids: string[]) {
    if (ids.length === 0) {
      throw new Error("No IDs provided")
    }
    // Delete child rows first to satisfy FK constraints
    await Promise.all([
      gradeRepository.deleteByStudentIds(ids),
      reservationRepository.deleteByStudentIds(ids),
    ])
    return await studentRepository.deleteManyByIds(ids)
  }

  async getDetailedById(id: string) {
    const studentRecord = await studentRepository.getById(id)
    if (!studentRecord) throw new Error("Student not found")

    const [subjects, studentGrades, reservations] = await Promise.all([
      subjectRepository.getByCourseWithPrerequisites(studentRecord.courseId),
      gradeRepository.getAllByStudent(id),
      reservationRepository.getByStudent(id),
    ])

    const gradeMap = new Map(
      studentGrades
        .filter((g) => g.finalGrade !== null)
        .map((g) => [g.subjectId, g]),
    )
    const reservedSubjectIds = new Set(reservations.map((r) => r.subjectId))

    const subjectStatus = subjects.map((subj) => {
      const missingPrerequisites = subj.prerequisites
        .filter((p) => !gradeMap.has(p.prerequisiteSubjectId))
        .map((p) => p.prerequisiteSubject)

      return {
        id: subj.id,
        code: subj.code,
        title: subj.title,
        units: subj.units,
        eligible: missingPrerequisites.length === 0,
        alreadyReserved: reservedSubjectIds.has(subj.id),
        missingPrerequisites,
      }
    })

    return {
      ...studentRecord,
      grades: studentGrades,
      reservations,
      subjectStatus,
    }
  }

  async getEligibleSubjects(studentId: string) {
    const student = await studentRepository.getById(studentId)
    if (!student) throw new Error("Student not found")

    const [subjects, studentGrades, reservations] = await Promise.all([
      subjectRepository.getByCourseWithPrerequisites(student.courseId),
      gradeRepository.getAllByStudent(studentId),
      reservationRepository.getByStudent(studentId),
    ])

    const gradeMap = new Map(
      studentGrades
        .filter((g) => g.finalGrade !== null)
        .map((g) => [g.subjectId, g]),
    )
    const reservedSubjectIds = new Set(reservations.map((r) => r.subjectId))

    return subjects.map((subj) => {
      const missingPrerequisites = subj.prerequisites
        .filter((p) => !gradeMap.has(p.prerequisiteSubjectId))
        .map((p) => p.prerequisiteSubject)

      return {
        ...subj,
        prerequisites: undefined,
        eligible: missingPrerequisites.length === 0,
        alreadyReserved: reservedSubjectIds.has(subj.id),
        missingPrerequisites,
      }
    })
  }
}

export const studentService = new StudentService()
