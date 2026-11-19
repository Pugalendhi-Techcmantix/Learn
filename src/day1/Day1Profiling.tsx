import { useState } from 'react'
import { products } from '../data'
import Header from '../components/Header'
import SearchBox from '../components/SearchBox'
import ProductList from '../components/ProductList'
import { ThemeProvider } from '../theme/ThemeProvider'

// The theme provider (with its ticking clock) only wraps this lab,
// so the rest of the app doesn't re-render every second.
export default function Day1Profiling() {
  return (
    <ThemeProvider>
      <Lab />
    </ThemeProvider>
  )
}

function Lab() {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div>
      <Header />
      <SearchBox value={search} onChange={setSearch} />
      <p className="mb-2 text-sm text-gray-600">
        Showing {filtered.length} products · Selected: {selectedId ?? 'none'}
      </p>
      <ProductList
        items={filtered}
        selectedId={selectedId}
        onSelect={(id) => setSelectedId(id)}
        options={{ showPrice: true }}
      />
    </div>
  )
}
