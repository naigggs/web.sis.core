import { gradeRepository } from "./grade.repository"
import { studentRepository } from "../student/student.repository"
import { subjectRepository } from "../subject/subject.repository"
import { courseRepository } from "../course/course.repository"
import type { CreateGradeDTO, UpdateGradeDTO, ListGradeDTO } from "./grade.dto"

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

    return await gradeRepository.upsert({ ...data, encodedByUserId })
  }

  async updateById(id: string, data: UpdateGradeDTO, encodedByUserId: string) {
    const existing = await gradeRepository.getById(id)
    if (!existing) throw new Error("Grade not found")

    return await gradeRepository.updateById(id, { ...data, encodedByUserId })
  }
}

export const gradeService = new GradeService()
