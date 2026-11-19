export type Role = 'USER' | 'ADMIN'

export type User = {
  id: number
  email: string
  name: string
  role: Role
}

export type Product = {
  id: number
  name: string
  category: string
  price: string // the API sends decimals as strings, e.g. "7.50"
  createdAt: string
}

export type LoginResponse = {
  accessToken: string
  expiresIn: number
  user: User
}
