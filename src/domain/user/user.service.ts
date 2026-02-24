import { userRepository } from "./user.repository"
import type { CreateUserDTO, UpdateUserDTO } from "./user.dto"

export class UserService {
  async create(data: CreateUserDTO) {
    const existingUser = await userRepository.getByEmail(data.email)
    if (existingUser) {
      throw new Error("User with this email already exists")
    }

    const hashedPassword = await Bun.password.hash(data.password)

    return await userRepository.create({
      email: data.email,
      role: data.role,
      password: hashedPassword,
    })
  }

  async getAll(params: { page: number; limit: number }) {
    return await userRepository.getAll(params)
  }

  async getById(id: string) {
    return await userRepository.getById(id)
  }

  async updateById(id: string, data: UpdateUserDTO) {
    const existing = await userRepository.getById(id)
    if (!existing) {
      throw new Error("User not found")
    }

    if (data.email && data.email !== existing.email) {
      const emailTaken = await userRepository.getByEmail(data.email)
      if (emailTaken) {
        throw new Error("Email already in use")
      }
    }

    let password = data.password
    if (password) {
      password = await Bun.password.hash(password)
    }

    return await userRepository.updateById(id, {
      ...data,
      password,
    })
  }

  async softDeleteById(id: string) {
    const existing = await userRepository.getById(id)
    if (!existing) {
      throw new Error("User not found")
    }

    return await userRepository.softDeleteById(id)
  }

  async hardDeleteById(id: string) {
    const existing = await userRepository.getById(id)
    if (!existing) {
      throw new Error("User not found")
    }

    return await userRepository.hardDeleteById(id)
  }
}

export const userService = new UserService()
