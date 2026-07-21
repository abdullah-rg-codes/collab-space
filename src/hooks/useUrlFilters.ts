import { useEffect, useCallback } from 'react'
import type { TaskPriority, TaskStatus } from '../types'

interface UrlFilterState {
  priority: TaskPriority[]
  status: TaskStatus[]
  search: string
  sort: 'createdAt' | 'updatedAt' | 'priority'
}

/**
 * Custom hook to synchronize filters and sort with URL query parameters
 * Allows filters to be shareable via URL and restorable on refresh
 *
 * URL format: ?status=Backlog,InProgress&priority=High,Medium&search=bug&sort=updatedAt
 */
export function useUrlFilters(
  onFilterChange: (filters: { status?: TaskStatus[]; priority?: TaskPriority[]; search?: string }) => void,
  onSortChange: (sort: 'createdAt' | 'updatedAt' | 'priority') => void
) {
  // Parse URL parameters and return current filter state
  const getFiltersFromUrl = useCallback((): UrlFilterState => {
    const params = new URLSearchParams(window.location.search)

    // Parse status filter
    const statusParam = params.get('status')
    const status: TaskStatus[] = statusParam
      ? (statusParam.split(',') as TaskStatus[]).filter(s => ['Backlog', 'In Progress', 'Done'].includes(s))
      : []

    // Parse priority filter
    const priorityParam = params.get('priority')
    const priority: TaskPriority[] = priorityParam
      ? (priorityParam.split(',') as TaskPriority[]).filter(p => ['Low', 'Medium', 'High'].includes(p))
      : []

    // Parse search filter
    const search = params.get('search') || ''

    // Parse sort
    const sort = (params.get('sort') || 'createdAt') as 'createdAt' | 'updatedAt' | 'priority'

    return { status, priority, search, sort }
  }, [])

  // Update URL with current filter state
  const updateUrlWithFilters = useCallback(
    (status: TaskStatus[], priority: TaskPriority[], search: string, sort: 'createdAt' | 'updatedAt' | 'priority') => {
      const params = new URLSearchParams()

      // Add status filter to URL if present
      if (status.length > 0) {
        params.set('status', status.join(','))
      }

      // Add priority filter to URL if present
      if (priority.length > 0) {
        params.set('priority', priority.join(','))
      }

      // Add search to URL if present
      if (search) {
        params.set('search', search)
      }

      // Add sort to URL if not default
      if (sort !== 'createdAt') {
        params.set('sort', sort)
      }

      // Build new URL string
      const queryString = params.toString()
      let newUrl = window.location.pathname

      if (queryString) {
        newUrl = `${window.location.pathname}?${queryString}`
      }

      // Update URL without causing page reload
      window.history.replaceState(null, '', newUrl)
    },
    []
  )

  // Initialize filters from URL on component mount
  useEffect(() => {
    const { status, priority, search, sort } = getFiltersFromUrl()

    // Apply filters from URL
    if (status.length > 0 || priority.length > 0 || search) {
      onFilterChange({ status, priority, search })
    }

    // Apply sort from URL
    if (sort !== 'createdAt') {
      onSortChange(sort)
    }
  }, [getFiltersFromUrl, onFilterChange, onSortChange])

  return {
    getFiltersFromUrl,
    updateUrlWithFilters,
  }
}
