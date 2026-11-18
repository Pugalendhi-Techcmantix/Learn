import { Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { Product } from '../data'
import ProductNameCell from './ProductNameCell'

type Props = {
  items: Product[]
  selectedId: number | null
  onSelect: (id: number) => void
  options: { showPrice: boolean }
}

// Fix #1: only render 10 rows per page instead of all of them.
const PAGINATION = { pageSize: 10, showSizeChanger: false }

export default function ProductList({ items, selectedId, onSelect, options }: Props) {
  // Intentionally NOT memoized: a new columns array on every render.
  const columns: ColumnsType<Product> = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    {
      title: 'Name',
      key: 'name',
      render: (_, p) => <ProductNameCell product={p} />,
    },
    { title: 'Category', dataIndex: 'category' },
    ...(options.showPrice
      ? [
          {
            title: 'Price',
            dataIndex: 'price',
            render: (price: number) => <Tag color="blue">₹{price}</Tag>,
          },
        ]
      : []),
  ]

  return (
    <Table<Product>
      rowKey="id"
      size="small"
      columns={columns}
      dataSource={items}
      pagination={PAGINATION}
      onRow={(p) => ({
        onClick: () => onSelect(p.id),
        className: p.id === selectedId ? 'bg-amber-200 cursor-pointer' : 'cursor-pointer',
      })}
    />
  )
}
