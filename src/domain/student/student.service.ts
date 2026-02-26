import { studentRepository } from "./student.repository"
import { subjectRepository } from "../subject/subject.repository"
import { gradeRepository } from "../grade/grade.repository"
import { reservationRepository } from "../reservation/reservation.repository"
import { userRepository } from "../user/user.repository"
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

    const newStudent = await studentRepository.create(data)

    // Auto-create linked user account (password = birthDate, fallback to studentNo)
    const rawPassword = data.birthDate ?? data.studentNo
    const hashedPassword = await Bun.password.hash(rawPassword)
    await userRepository.create({
      email: data.email ?? undefined,
      password: hashedPassword,
      role: "student",
      studentId: newStudent.id,
    })

    return newStudent
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
      userRepository.deleteByStudentIds(ids),
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
        .filter((g) => g.finalGrade !== null && g.remarks === "PASSED")
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
        .filter((g) => g.finalGrade !== null && g.remarks === "PASSED")
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

  // ── CSV helpers ────────────────────────────────────────────────────────────

  private escapeCsvField(value: string | null | undefined): string {
    const str = value ?? ""
    // Quote fields that contain commas, quotes, or newlines
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  private parseCsvLine(line: string): string[] {
    const fields: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === "," && !inQuotes) {
        fields.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }
    fields.push(current.trim())
    return fields
  }

  async exportToCsv(): Promise<string> {
    const students = await studentRepository.getAllForExport()

    const header = "studentNo,firstName,lastName,email,birthDate,courseId\n"
    const rows = students
      .map((s) => {
        const e = this.escapeCsvField.bind(this)
        return [
          e(s.studentNo),
          e(s.firstName),
          e(s.lastName),
          e(s.email),
          e(s.birthDate),
          e(s.courseId),
        ].join(",")
      })
      .join("\n")

    return header + rows
  }

  async importFromCsv(csvText: string) {
    const lines = csvText
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .filter((l) => l.trim().length > 0)

    if (lines.length < 2) {
      throw new Error("CSV must contain a header row and at least one data row")
    }

    // Validate header
    const expectedHeader =
      "studentNo,firstName,lastName,email,birthDate,courseId"
    const headerLine = lines[0].toLowerCase().replace(/\s/g, "")
    const expectedLower = expectedHeader.toLowerCase().replace(/\s/g, "")
    if (headerLine !== expectedLower) {
      throw new Error(`Invalid CSV header. Expected: ${expectedHeader}`)
    }

    const imported: string[] = []
    const failed: { row: number; studentNo: string; error: string }[] = []

    for (let i = 1; i < lines.length; i++) {
      const fields = this.parseCsvLine(lines[i])
      const [studentNo, firstName, lastName, email, birthDate, courseId] =
        fields
      const rowNum = i + 1

      if (!studentNo || !firstName || !lastName || !courseId) {
        failed.push({
          row: rowNum,
          studentNo: studentNo || "(empty)",
          error: "studentNo, firstName, lastName, and courseId are required",
        })
        continue
      }

      try {
        await this.create({
          studentNo,
          firstName,
          lastName,
          email: email || undefined,
          birthDate: birthDate || undefined,
          courseId,
        })
        imported.push(studentNo)
      } catch (err: any) {
        failed.push({ row: rowNum, studentNo, error: err.message })
      }
    }

    return { imported: imported.length, failed }
  }
}

export const studentService = new StudentService()
