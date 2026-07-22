import React, { useMemo, useCallback, useState, useEffect, useRef } from "react"
import type { Task, TaskPriority } from "../../types"
import { TaskStatus } from "../../types"
import { TextInput, Button, Select } from "../../components/ui"
import Column from "./Column"
import styles from './BoardView.module.css'

// Static arrays extracted outside component to avoid recreation on every render
const COLUMNS: TaskStatus[] = [TaskStatus.BACKLOG, TaskStatus.IN_PROGRESS, TaskStatus.DONE]
const PRIORITIES: TaskPriority[] = ['High', 'Medium', 'Low']
const STATUSES: TaskStatus[] = [TaskStatus.BACKLOG, TaskStatus.IN_PROGRESS, TaskStatus.DONE]
const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Created (Newest)' },
  { value: 'updatedAt', label: 'Updated (Newest)' },
  { value: 'priority', label: 'Priority' },
]

interface BoardViewProps {
  filteredTasks: Task[]
  filters: any
  sortBy: string
  setFilter: (filter: any) => void
  setSortBy: (sort: any) => void
  onTaskClick: (task: Task) => void
  onTaskDelete: (task: Task) => void
  onTaskDrop: (task: Task, newStatus: TaskStatus) => void
}

export default React.memo(function BoardView({
  filteredTasks,
  filters,
  sortBy,
  setFilter,
  setSortBy,
  onTaskClick,
  onTaskDelete,
  onTaskDrop
}: BoardViewProps) {
  // Memoize per-column task arrays to avoid filtering on every render
  const tasksByColumn = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      [TaskStatus.BACKLOG]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.DONE]: [],
    }
    for (const task of filteredTasks) {
      map[task.status].push(task)
    }
    return map
  }, [filteredTasks])

  // Memoize handlers that wrap setFilter
  const togglePriorityFilter = useCallback((priority: TaskPriority) => {
    const current = filters.priority
    const newPriorities = current.includes(priority)
      ? current.filter((p: TaskPriority) => p !== priority)
      : [...current, priority]
    setFilter({ priority: newPriorities })
  }, [setFilter, filters.priority])

  const toggleStatusFilter = useCallback((status: TaskStatus) => {
    const current = filters.status
    const newStatuses = current.includes(status)
      ? current.filter((s: TaskStatus) => s !== status)
      : [...current, status]
    setFilter({ status: newStatuses })
  }, [setFilter, filters.status])

  // Debounced search - local state updates immediately (responsive typing),
  // but the actual filter only fires after 300ms of inactivity
  const [searchInput, setSearchInput] = useState(filters.search)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setFilter({ search: value })
    }, 300)
  }, [setFilter])

  // Sync local input if filters.search is cleared externally (e.g. "Clear Filters")
  useEffect(() => {
    if (filters.search === '' && searchInput !== '') {
      setSearchInput('')
    }
  }, [filters.search])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleSortChange = useCallback((newSort: string) => {
    setSortBy(newSort as any)
  }, [setSortBy])

  const handleClearFilters = useCallback(() => {
    setFilter({ status: [], priority: [], search: '' })
  }, [setFilter])

  // Check if there are any tasks at all
  const hasTasks = filteredTasks.length > 0
  
  // Check if filters are active
  const hasActiveFilters = 
    filters.status.length > 0 || 
    filters.priority.length > 0 || 
    filters.search.trim() !== ''

  return (
    <div className={styles.boardContainer}>
      {/* Filter & Sort Toolbar */}
      <div className={styles.toolbar}>
        {/* Search Input */}
        <TextInput
          placeholder="Search tasks..."
          value={searchInput}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />

        {/* Priority Filter Buttons */}
        <div className={styles.priorityFilters}>
          {PRIORITIES.map(priority => (
            <Button
              key={priority}
              variant={filters.priority.includes(priority) ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => togglePriorityFilter(priority)}
            >
              {priority}
            </Button>
          ))}
        </div>

        {/* Status Filter Buttons */}
        <div className={styles.statusFilters}>
          {STATUSES.map(status => (
            <Button
              key={status}
              variant={filters.status.includes(status) ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => toggleStatusFilter(status)}
            >
              {status}
            </Button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <Select
          value={sortBy}
          onChange={handleSortChange}
          options={SORT_OPTIONS}
          className={styles.sortSelect}
        />

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Empty State - No Tasks at All */}
      {!hasTasks && !hasActiveFilters && (
        <div className={styles.boardEmptyState}>
          <div className={styles.emptyStateIcon}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <h2 className={styles.emptyStateTitle}>No tasks yet</h2>
          <p className={styles.emptyStateDescription}>
            Get started by creating your first task. Click the "+ New Task" button to begin.
          </p>
        </div>
      )}

      {/* Empty State - Filters Hide All Tasks */}
      {!hasTasks && hasActiveFilters && (
        <div className={styles.boardEmptyState}>
          <div className={styles.emptyStateIcon}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h2 className={styles.emptyStateTitle}>No tasks match your filters</h2>
          <p className={styles.emptyStateDescription}>
            Try adjusting your filters or search to find tasks.
          </p>
          <Button variant="secondary" onClick={handleClearFilters} size="sm">
            Clear Filters
          </Button>
        </div>
      )}

      {/* Board Columns - Only show if there are tasks */}
      {hasTasks && (
        <div className={styles.columnsWrapper}>
        {COLUMNS.map(status => (
            <Column
              key={status}
              status={status}
              tasks={tasksByColumn[status]}
              onTaskClick={onTaskClick}
              onTaskDelete={onTaskDelete}
              onTaskDrop={onTaskDrop}
            />
        ))}
        </div>
      )}
    </div>
  )
})
