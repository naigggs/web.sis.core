import { subjectRepository } from "./subject.repository"
import type {
  CreateSubjectDTO,
  UpdateSubjectDTO,
  ListSubjectDTO,
} from "./subject.dto"

export class SubjectService {
  async getAll(params: ListSubjectDTO) {
    return await subjectRepository.getAll(params)
  }

  async getById(id: string) {
    const subject = await subjectRepository.getById(id)
    if (!subject) {
      throw new Error("Subject not found")
    }
    return subject
  }

  async create(data: CreateSubjectDTO) {
    const existingCode = await subjectRepository.getByCodeAndCourse(
      data.code,
      data.courseId,
    )
    if (existingCode) {
      throw new Error("Subject code already exists for this course")
    }

    const existingTitle = await subjectRepository.getByTitleAndCourse(
      data.title,
      data.courseId,
    )
    if (existingTitle) {
      throw new Error("Subject title already exists for this course")
    }

    return await subjectRepository.create(data)
  }

  async updateById(id: string, data: UpdateSubjectDTO) {
    const existing = await subjectRepository.getById(id)
    if (!existing) {
      throw new Error("Subject not found")
    }

    const effectiveCourseId = data.courseId ?? existing.courseId

    if (
      data.code &&
      (data.code !== existing.code || effectiveCourseId !== existing.courseId)
    ) {
      const codeTaken = await subjectRepository.getByCodeAndCourse(
        data.code,
        effectiveCourseId,
      )
      if (codeTaken && codeTaken.id !== id) {
        throw new Error("Subject code already exists for this course")
      }
    }

    if (
      data.title &&
      (data.title !== existing.title || effectiveCourseId !== existing.courseId)
    ) {
      const titleTaken = await subjectRepository.getByTitleAndCourse(
        data.title,
        effectiveCourseId,
      )
      if (titleTaken && titleTaken.id !== id) {
        throw new Error("Subject title already exists for this course")
      }
    }

    return await subjectRepository.updateById(id, data)
  }

  async deleteManyByIds(ids: string[]) {
    if (ids.length === 0) {
      throw new Error("No IDs provided")
    }
    return await subjectRepository.deleteManyByIds(ids)
  }

  async getPrerequisites(subjectId: string) {
    const existing = await subjectRepository.getById(subjectId)
    if (!existing) {
      throw new Error("Subject not found")
    }
    return await subjectRepository.getPrerequisites(subjectId)
  }

  /**
   * BFS from `startId` through existing prerequisite links.
   * Returns true if `targetId` is reachable — meaning adding
   * targetId → startId would create a cycle.
   */
  private async hasCircularDependency(
    startId: string,
    targetId: string,
  ): Promise<boolean> {
    const visited = new Set<string>()
    const queue: string[] = [startId]

    while (queue.length > 0) {
      const current = queue.shift()!
      if (current === targetId) return true
      if (visited.has(current)) continue
      visited.add(current)

      const prereqIds = await subjectRepository.getPrerequisiteIds(current)
      for (const id of prereqIds) {
        if (!visited.has(id)) queue.push(id)
      }
    }

    return false
  }

  async addPrerequisite(subjectId: string, prerequisiteSubjectId: string) {
    if (subjectId === prerequisiteSubjectId) {
      throw new Error("A subject cannot be its own prerequisite")
    }

    const [subjectExists, prereqExists] = await Promise.all([
      subjectRepository.getById(subjectId),
      subjectRepository.getById(prerequisiteSubjectId),
    ])

    if (!subjectExists) throw new Error("Subject not found")
    if (!prereqExists) throw new Error("Prerequisite subject not found")

    if (subjectExists.courseId !== prereqExists.courseId) {
      throw new Error("Prerequisite must belong to the same course")
    }

    // Circular dependency check: would adding prerequisiteSubjectId as a prereq
    // of subjectId create a cycle (e.g. A→B→A)?
    const isCyclic = await this.hasCircularDependency(
      prerequisiteSubjectId,
      subjectId,
    )
    if (isCyclic) {
      throw new Error(
        "Adding this prerequisite would create a circular dependency",
      )
    }

    const alreadyLinked = await subjectRepository.getPrerequisiteLink(
      subjectId,
      prerequisiteSubjectId,
    )
    if (alreadyLinked) {
      throw new Error("Prerequisite already added")
    }

    return await subjectRepository.addPrerequisite(
      subjectId,
      prerequisiteSubjectId,
    )
  }

  async removePrerequisite(subjectId: string, prerequisiteSubjectId: string) {
    const link = await subjectRepository.getPrerequisiteLink(
      subjectId,
      prerequisiteSubjectId,
    )
    if (!link) {
      throw new Error("Prerequisite not found")
    }
    return await subjectRepository.removePrerequisite(
      subjectId,
      prerequisiteSubjectId,
    )
  }
}

export const subjectService = new SubjectService()
