import { api } from './client'
import { loginResponseSchema, userResponseSchema } from './schemas'
import type { LoginResponse, User } from './types'

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await api.post<unknown>('/auth/login', { email, password })
  return loginResponseSchema.parse(res.data)
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}

export async function fetchMe(): Promise<User> {
  const res = await api.get<unknown>('/api/me')
  return userResponseSchema.parse(res.data).user
}
