import { api } from './client'
import type { Product } from './types'
import { productsResponseSchema } from './schemas'

export async function fetchProducts(signal?: AbortSignal): Promise<Product[]> {
  const res = await api.get<unknown>('/api/products', signal ? { signal } : undefined)
  return productsResponseSchema.parse(res.data).products
}
