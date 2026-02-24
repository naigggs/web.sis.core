import { studentRepository } from "./student.repository"
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

  async deleteById(id: string) {
    const existing = await studentRepository.getById(id)
    if (!existing) {
      throw new Error("Student not found")
    }

    return await studentRepository.deleteById(id)
  }
}

export const studentService = new StudentService()
