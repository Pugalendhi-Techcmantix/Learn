import { api } from './client'
import type { Product } from './types'

export async function fetchProducts(signal?: AbortSignal): Promise<Product[]> {
  const res = await api.get<{ products: Product[] }>('/api/products', signal ? { signal } : undefined)
  return res.data.products
}
