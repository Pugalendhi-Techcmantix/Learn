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

// Shape of a paginated list. Used by usePagination() today, and by a server that
// returns one page at a time (e.g. GET /api/products?page=2&pageSize=10) later.
export type PageMeta = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type Paginated<T> = {
  items: T[]
  meta: PageMeta
}
