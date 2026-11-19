// Pure pagination maths: no React, so it is easy to test and reuse (also on the server side).

export const DEFAULT_PAGE_SIZE = 10

export type PageWindow = {
  page: number // current page, always inside 1..totalPages
  pageSize: number
  total: number
  totalPages: number // at least 1, even when there are no items
  from: number // 1-based index of the first item on this page (0 when empty)
  to: number // 1-based index of the last item on this page (0 when empty)
  offset: number // items to skip, e.g. for SQL OFFSET or Array.slice
}

// Garbage in, safe numbers out. NaN, Infinity, negatives and decimals never reach the maths.
export function sanitizeTotal(total: number): number {
  return Number.isFinite(total) && total > 0 ? Math.floor(total) : 0
}

export function sanitizePageSize(pageSize: number): number {
  return Number.isInteger(pageSize) && pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE
}

export function clampPage(page: number, totalPages: number): number {
  if (!Number.isFinite(page)) return 1
  return Math.min(Math.max(Math.floor(page), 1), totalPages)
}

export function getPageWindow(total: number, pageSize: number, requestedPage: number): PageWindow {
  const safeTotal = sanitizeTotal(total)
  const safeSize = sanitizePageSize(pageSize)
  const totalPages = Math.max(1, Math.ceil(safeTotal / safeSize))
  const page = clampPage(requestedPage, totalPages)
  const offset = (page - 1) * safeSize

  return {
    page,
    pageSize: safeSize,
    total: safeTotal,
    totalPages,
    from: safeTotal === 0 ? 0 : offset + 1,
    to: Math.min(offset + safeSize, safeTotal),
    offset,
  }
}
