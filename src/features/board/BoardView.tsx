import type { Task, TaskPriority } from "../../types"
import { TaskStatus } from "../../types"
import { TextInput, Button, Select } from "../../components/ui"
import Column from "./Column"
import styles from './BoardView.module.css'

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

export default function BoardView({
  filteredTasks,
  filters,
  sortBy,
  setFilter,
  setSortBy,
  onTaskClick,
  onTaskDelete,
  onTaskDrop
}: BoardViewProps) {
  console.log('[BoardView] Rendering BoardView')
  console.log('[BoardView] Received filteredTasks:', filteredTasks)

  const columns: TaskStatus[] = [
    TaskStatus.BACKLOG,
    TaskStatus.IN_PROGRESS,
    TaskStatus.DONE,
  ]

  // Priority filter buttons
  const priorities: TaskPriority[] = ['High', 'Medium', 'Low']

  // Status filter values
  const statuses: TaskStatus[] = [
    TaskStatus.BACKLOG,
    TaskStatus.IN_PROGRESS,
    TaskStatus.DONE,
  ]

  // Handle priority filter toggle
  const togglePriorityFilter = (priority: TaskPriority) => {
    const newPriorities = filters.priority.includes(priority)
      ? filters.priority.filter((p: TaskPriority) => p !== priority)
      : [...filters.priority, priority]
    setFilter({ priority: newPriorities })
  }

  // Handle status filter toggle
  const toggleStatusFilter = (status: TaskStatus) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter((s: TaskStatus) => s !== status)
      : [...filters.status, status]
    setFilter({ status: newStatuses })
  }

  // Handle search
  const handleSearch = (searchText: string) => {
    console.log('[BoardView] handleSearch() called with:', searchText)
    setFilter({ search: searchText })
  }

  // Handle sort change
  const handleSortChange = (newSort: string) => {
    console.log('[BoardView] handleSortChange() called with:', newSort)
    setSortBy(newSort as any)
  }

  // Clear all filters
  const handleClearFilters = () => {
    console.log('[BoardView] handleClearFilters() called')
    setFilter({ status: [], priority: [], search: '' })
  }

  return (
    <div className={styles.boardContainer}>
      {/* Filter & Sort Toolbar */}
      <div className={styles.toolbar}>
        {/* Search Input */}
        <TextInput
          placeholder="Search tasks..."
          value={filters.search}
          onChange={handleSearch}
          className={styles.searchInput}
        />

        {/* Priority Filter Buttons */}
        <div className={styles.priorityFilters}>
          {priorities.map(priority => (
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
          {statuses.map(status => (
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
          options={[
            { value: 'createdAt', label: 'Created (Newest)' },
            { value: 'updatedAt', label: 'Updated (Newest)' },
            { value: 'priority', label: 'Priority' },
          ]}
          className={styles.sortSelect}
        />

        {/* Clear Filters Button */}
        {(filters.status.length > 0 || filters.priority.length > 0 || filters.search) && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Board Columns */}
      <div className={styles.columnsWrapper}>
        {columns.map(status => {
          const tasksForStatus = filteredTasks.filter(task => task.status === status)
          console.log(`[BoardView] Column ${status}: ${tasksForStatus.length} tasks`)
          return (
            <Column
              key={status}
              status={status}
              tasks={tasksForStatus}
              onTaskClick={onTaskClick}
              onTaskDelete={onTaskDelete}
              onTaskDrop={onTaskDrop}
            />
          )
        })}
      </div>
    </div>
  )
}
