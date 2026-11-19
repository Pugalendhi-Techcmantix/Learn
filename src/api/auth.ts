import { api } from './client'
import type { LoginResponse, User } from './types'

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/login', { email, password })
  return res.data
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}

export async function fetchMe(): Promise<User> {
  const res = await api.get<{ user: User }>('/api/me')
  return res.data.user
}
