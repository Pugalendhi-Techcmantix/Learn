import { useCallback, useState } from 'react'
import type { PageMeta } from '../api/types'
import { DEFAULT_PAGE_SIZE, getPageWindow, type PageWindow } from '../lib/pagination'

export type UsePaginationOptions = {
  /** Total number of items (after any filtering). */
  total: number
  /** Items per page. Invalid values fall back to 10. */
  pageSize?: number
  /** First page to show. Default 1. */
  initialPage?: number
  /**
   * When this value changes the hook goes back to page 1, for example a search text or a
   * filter. Pass a primitive (string or number); it is compared with Object.is.
   */
  resetKey?: string | number | boolean | null
}

export type UsePaginationResult = PageMeta &
  Pick<PageWindow, 'from' | 'to' | 'offset'> & {
    hasPrev: boolean
    hasNext: boolean
    setPage: (page: number) => void
    next: () => void
    prev: () => void
    first: () => void
    last: () => void
    /** The items of the current page, for lists you hold fully in memory. */
    slice: <T>(items: readonly T[]) => T[]
  }

export function usePagination({
  total,
  pageSize = DEFAULT_PAGE_SIZE,
  initialPage = 1,
  resetKey = null,
}: UsePaginationOptions): UsePaginationResult {
  const [requestedPage, setRequestedPage] = useState(initialPage)
  const [lastResetKey, setLastResetKey] = useState(resetKey)

  // The page you see is always valid: it is worked out on every render from the total and the
  // page size, so a shrinking list can never leave you on a page that no longer exists.
  const window = getPageWindow(total, pageSize, requestedPage)

  // Adjust state while rendering (React's documented pattern), instead of in an effect,
  // so there is no extra render with a wrong page on screen.
  if (resetKey !== lastResetKey) {
    setLastResetKey(resetKey)
    setRequestedPage(1)
  } else if (requestedPage !== window.page) {
    // The list shrank: remember the clamped page, so the list growing again does not jump back.
    setRequestedPage(window.page)
  }

  const { page, totalPages } = window

  const setPage = useCallback((value: number) => setRequestedPage(value), [])
  const next = useCallback(() => setRequestedPage(page + 1), [page])
  const prev = useCallback(() => setRequestedPage(page - 1), [page])
  const first = useCallback(() => setRequestedPage(1), [])
  const last = useCallback(() => setRequestedPage(totalPages), [totalPages])

  const { pageSize: size, offset } = window
  const slice = useCallback(
    <T,>(items: readonly T[]): T[] => items.slice(offset, offset + size),
    [offset, size],
  )

  return {
    page,
    pageSize: size,
    total: window.total,
    totalPages,
    from: window.from,
    to: window.to,
    offset,
    hasPrev: page > 1,
    hasNext: page < totalPages,
    setPage,
    next,
    prev,
    first,
    last,
    slice,
  }
}
