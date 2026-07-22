/**
 * UI behavior test: filtering and sorting.
 *
 * We test the useTasks hook's filtering and sorting logic directly
 * (using renderHook) since it drives the board's displayed content.
 * This validates:
 *   1. Priority filter (multi-select) hides non-matching tasks
 *   2. Text search filters by title and description
 *   3. Status filter (multi-select) shows only selected statuses
 *   4. Sorting by Priority reorders tasks High → Medium → Low
 *   5. Sorting by updatedAt shows newest-updated first
 *
 * We seed tasks via addTask and then manipulate filters via setFilter/setSortBy,
 * exactly as the BoardView toolbar would.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTasks } from '../../hooks/useTasks'
import type { Task } from '../../types'

// Small builder so each fixture only spells out what makes it distinct.
const makeTask = (overrides: Partial<Task> & Pick<Task, 'id' | 'title'>): Task => ({
  description: '',
  status: 'Backlog',
  priority: 'Medium',
  assignee: '',
  tags: [],
  createdAt: 0,
  updatedAt: 0,
  dueDate: 0,
  ...overrides,
})

const taskHigh = makeTask({
  id: 'a',
  title: 'Fix login bug',
  description: 'Critical auth issue',
  priority: 'High',
  status: 'Backlog',
  createdAt: 1_000,
  updatedAt: 5_000,
})

const taskLow = makeTask({
  id: 'b',
  title: 'Update docs',
  description: 'Add API documentation',
  priority: 'Low',
  status: 'In Progress',
  createdAt: 2_000,
  updatedAt: 3_000,
})

const taskMedium = makeTask({
  id: 'c',
  title: 'Refactor code',
  description: 'Clean up utils module',
  priority: 'Medium',
  status: 'Done',
  createdAt: 3_000,
  updatedAt: 1_000,
})

function seedTasks(result: { current: ReturnType<typeof useTasks> }) {
  act(() => {
    result.current.addTask(taskHigh)
    result.current.addTask(taskLow)
    result.current.addTask(taskMedium)
  })
}

describe('BoardView: filtering and sorting', () => {
  it('shows all seeded tasks initially, sorted by createdAt desc (default)', () => {
    const { result } = renderHook(() => useTasks())
    seedTasks(result)

    // Default sort is createdAt descending → C (3000), B (2000), A (1000)
    const titles = result.current.filteredTasks.map(t => t.title)
    expect(titles).toEqual(['Refactor code', 'Update docs', 'Fix login bug'])
  })

  it('filters to just the High-priority task when priority filter is set', () => {
    const { result } = renderHook(() => useTasks())
    seedTasks(result)

    act(() => {
      result.current.setFilter({ priority: ['High'] })
    })

    const titles = result.current.filteredTasks.map(t => t.title)
    expect(titles).toEqual(['Fix login bug'])
  })

  it('supports multi-select priority filter (High + Low)', () => {
    const { result } = renderHook(() => useTasks())
    seedTasks(result)

    act(() => {
      result.current.setFilter({ priority: ['High', 'Low'] })
    })

    const titles = result.current.filteredTasks.map(t => t.title)
    expect(titles).toEqual(['Update docs', 'Fix login bug'])
  })

  it('filters by text search across title and description', () => {
    const { result } = renderHook(() => useTasks())
    seedTasks(result)

    act(() => {
      result.current.setFilter({ search: 'docs' })
    })

    const titles = result.current.filteredTasks.map(t => t.title)
    expect(titles).toEqual(['Update docs'])

    // Also matches description
    act(() => {
      result.current.setFilter({ search: 'auth' })
    })

    const titles2 = result.current.filteredTasks.map(t => t.title)
    expect(titles2).toEqual(['Fix login bug'])
  })

  it('filters by status (multi-select)', () => {
    const { result } = renderHook(() => useTasks())
    seedTasks(result)

    act(() => {
      result.current.setFilter({ status: ['Backlog', 'Done'] })
    })

    const titles = result.current.filteredTasks.map(t => t.title)
    expect(titles).toEqual(['Refactor code', 'Fix login bug'])
  })

  it('reorders tasks High → Medium → Low when sorted by priority', () => {
    const { result } = renderHook(() => useTasks())
    seedTasks(result)

    act(() => {
      result.current.setSortBy('priority')
    })

    const titles = result.current.filteredTasks.map(t => t.title)
    expect(titles).toEqual([
      'Fix login bug',   // High
      'Refactor code',   // Medium
      'Update docs',     // Low
    ])
  })

  it('sorts by updatedAt descending (newest update first)', () => {
    const { result } = renderHook(() => useTasks())
    seedTasks(result)

    act(() => {
      result.current.setSortBy('updatedAt')
    })

    const titles = result.current.filteredTasks.map(t => t.title)
    // updatedAt: A=5000, B=3000, C=1000
    expect(titles).toEqual([
      'Fix login bug',   // updatedAt 5000
      'Update docs',     // updatedAt 3000
      'Refactor code',   // updatedAt 1000
    ])
  })

  it('combines priority filter + text search', () => {
    const { result } = renderHook(() => useTasks())
    seedTasks(result)

    act(() => {
      result.current.setFilter({ priority: ['High', 'Medium'], search: 'code' })
    })

    // Only 'Refactor code' matches both Medium priority AND 'code' search
    const titles = result.current.filteredTasks.map(t => t.title)
    expect(titles).toEqual(['Refactor code'])
  })

  it('returns empty array when filters match nothing', () => {
    const { result } = renderHook(() => useTasks())
    seedTasks(result)

    act(() => {
      result.current.setFilter({ search: 'nonexistent xyz' })
    })

    expect(result.current.filteredTasks).toHaveLength(0)
  })

  it('clearing filters restores all tasks', () => {
    const { result } = renderHook(() => useTasks())
    seedTasks(result)

    // Apply filter
    act(() => {
      result.current.setFilter({ priority: ['High'] })
    })
    expect(result.current.filteredTasks).toHaveLength(1)

    // Clear filters
    act(() => {
      result.current.setFilter({ status: [], priority: [], search: '' })
    })
    expect(result.current.filteredTasks).toHaveLength(3)
  })
})
