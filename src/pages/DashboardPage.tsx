import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Input, Pagination, Segmented, Table } from 'antd'
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { describeError } from '../api/errors'
import { fetchProducts } from '../api/products'
import type { Product } from '../api/types'
import { usePagination } from '../hooks/usePagination'

const priceFormat = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })

// One muted colour per category, shown as a small dot.
const CATEGORY_COLORS: Record<string, string> = {
  Books: '#b45309',
  Games: '#7c3aed',
  Music: '#be185d',
  Tools: '#0f766e',
  Toys: '#2563eb',
}

const ALL = 'All'
const PAGE_SIZE = 10

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>(ALL)

  // Bump reloadKey to fetch again (Refresh / Try again buttons).
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetchProducts(controller.signal)
      .then((items) => setProducts(items))
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setError(describeError(err))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [reloadKey])

  function reload() {
    setLoading(true)
    setError(null)
    setReloadKey((key) => key + 1)
  }

  const categories = useMemo(() => [ALL, ...new Set(products.map((p) => p.category))], [products])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter(
      (p) =>
        (category === ALL || p.category === category) &&
        (!q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)),
    )
  }, [products, search, category])

  // Going back to page 1 whenever the filters change, and staying inside the valid pages.
  const pagination = usePagination({
    total: visible.length,
    pageSize: PAGE_SIZE,
    resetKey: `${category}|${search.trim().toLowerCase()}`,
  })
  const pageItems = pagination.slice(visible)

  return (
    <section className="overflow-hidden rounded-2xl border border-[#e5e8ec] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0f3] p-4 sm:px-5">
        <Segmented
          options={categories}
          value={category}
          onChange={(value) => setCategory(value)}
          className="max-w-full overflow-x-auto [scrollbar-width:none]"
        />
        <div className="flex w-full gap-2 sm:w-auto">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-0 flex-1 sm:w-60! sm:flex-none"
            aria-label="Search products"
          />
          <Button icon={<ReloadOutlined />} onClick={reload} loading={loading} aria-label="Refresh products" />
        </div>
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          title="Could not load products"
          description={error}
          action={<Button size="small" onClick={reload}>Try again</Button>}
          className="m-4!"
        />
      )}

      <Table<Product>
        rowKey="id"
        loading={loading}
        dataSource={pageItems}
        scroll={{ x: 480 }}
        pagination={false}
        locale={{ emptyText: search || category !== ALL ? 'No products match your filters.' : 'No products yet.' }}
        columns={[
          {
            title: 'ID',
            dataIndex: 'id',
            width: 90,
            render: (id: number) => <span className="text-neutral-500">#{id}</span>,
          },
          {
            title: 'Name',
            dataIndex: 'name',
            render: (name: string) => <span className="font-medium">{name}</span>,
          },
          {
            title: 'Category',
            dataIndex: 'category',
            render: (name: string) => (
              <span className="inline-flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ background: CATEGORY_COLORS[name] ?? '#8b95a1' }}
                  aria-hidden="true"
                />
                {name}
              </span>
            ),
          },
          {
            title: 'Price',
            dataIndex: 'price',
            align: 'right',
            render: (price: string) => priceFormat.format(Number(price)),
          },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0f3] px-4 py-3 sm:px-5">
        <p className="m-0 text-sm text-neutral-600 tabular" aria-live="polite">
          {pagination.total === 0
            ? 'No products'
            : `Showing ${pagination.from}–${pagination.to} of ${pagination.total}`}
        </p>
        <Pagination
          current={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onChange={pagination.setPage}
          showSizeChanger={false}
          hideOnSinglePage
        />
      </div>
    </section>
  )
}
