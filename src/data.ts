export type Product = {
  id: number
  name: string
  price: number
  category: string
}

const categories = ['Books', 'Games', 'Music', 'Tools', 'Toys']

export const products: Product[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  price: Math.round(Math.random() * 10000) / 100,
  category: categories[i % categories.length],
}))
