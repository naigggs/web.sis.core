import { courseRepository } from "./course.repository"
import type {
  CreateCourseDTO,
  UpdateCourseDTO,
  ListCourseDTO,
  AddSubjectsToCourseDTO,
} from "./course.dto"

export class CourseService {
  async getAll(params: ListCourseDTO) {
    return await courseRepository.getAll(params)
  }

  async getById(id: string) {
    const course = await courseRepository.getById(id)
    if (!course) {
      throw new Error("Course not found")
    }
    return course
  }

  async create(data: CreateCourseDTO) {
    const existing = await courseRepository.getByCode(data.code)
    if (existing) {
      throw new Error("Course code already exists")
    }
    return await courseRepository.create(data)
  }

  async updateById(id: string, data: UpdateCourseDTO) {
    const existing = await courseRepository.getById(id)
    if (!existing) {
      throw new Error("Course not found")
    }

    if (data.code && data.code !== existing.code) {
      const codeTaken = await courseRepository.getByCode(data.code)
      if (codeTaken) {
        throw new Error("Course code already exists")
      }
    }

    return await courseRepository.updateById(id, data)
  }

  async deleteManyByIds(ids: string[]) {
    if (ids.length === 0) {
      throw new Error("No IDs provided")
    }
    return await courseRepository.deleteManyByIds(ids)
  }

  async addSubjects(id: string, data: AddSubjectsToCourseDTO) {
    const existing = await courseRepository.getById(id)
    if (!existing) {
      throw new Error("Course not found")
    }
    return await courseRepository.addSubjects(id, data.subjects)
  }
}

export const courseService = new CourseService()
