import type { Product } from '../data'
import { useTheme } from '../theme/useTheme'

// Fake "heavy" work so slow renders are easy to see in the Profiler.
function buildLabel(p: Product) {
  let n = 0
  for (let i = 0; i < 5000; i++) n += Math.sqrt(i)
  return `${p.name} (${p.category})` + (n < 0 ? '!' : '')
}

export default function ProductNameCell({ product }: { product: Product }) {
  const { theme } = useTheme()
  const label = buildLabel(product)

  return <span className={theme === 'dark' ? 'text-sky-600' : 'text-black'}>{label}</span>
}
