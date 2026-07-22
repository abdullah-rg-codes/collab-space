/**
 * UI behavior test: filtering and sorting on the board.
 *
 * We seed three tasks into localStorage before App mounts, then drive the
 * toolbar controls exactly as a user would. This validates:
 *   1. Priority filter (multi-select toggle) hides non-matching tasks
 *   2. Text search filters by title (and would filter by description too)
 *   3. Sorting by Priority reorders cards High → Medium → Low
 *
 * All three fixture tasks share the same Backlog status so DOM order within
 * the Backlog column directly reflects the sort order — that lets us assert
 * ordering by reading `getAllByRole('heading', { level: 3 })`.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App'
import { saveTasks } from '../../lib/storage'
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

// Fixtures. createdAt values are distinct so we can predict the default
// sort order (createdAt desc → newest first).
const taskHigh = makeTask({
  id: 'a',
  title: 'Fix login bug',
  priority: 'High',
  createdAt: 1_000,
  updatedAt: 1_000,
})
const taskLow = makeTask({
  id: 'b',
  title: 'Update docs',
  priority: 'Low',
  createdAt: 2_000,
  updatedAt: 2_000,
})
const taskMedium = makeTask({
  id: 'c',
  title: 'Refactor code',
  priority: 'Medium',
  createdAt: 3_000,
  updatedAt: 3_000,
})

// TaskCard renders the task title as an <h3>. Reading those in DOM order
// gives us the visible list of tasks on the board.
function visibleTaskTitles(): string[] {
  return screen
    .getAllByRole('heading', { level: 3 })
    .map(h => h.textContent ?? '')
}

describe('BoardView: filtering and sorting', () => {
  beforeEach(() => {
    // Global setup clears localStorage first; then we seed with a known state.
    saveTasks([taskHigh, taskLow, taskMedium])
  })

  it('renders all seeded tasks initially, sorted by createdAt desc (default)', () => {
    render(<App />)

    // Default sort is `createdAt` descending → C (3000), B (2000), A (1000)
    expect(visibleTaskTitles()).toEqual([
      'Refactor code',
      'Update docs',
      'Fix login bug',
    ])
  })

  it('filters to just the High-priority task when the High button is toggled on', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'High' }))

    expect(visibleTaskTitles()).toEqual(['Fix login bug'])

    // Toggling the same button off restores the full list
    await user.click(screen.getByRole('button', { name: 'High' }))
    expect(visibleTaskTitles()).toHaveLength(3)
  })

  it('filters by text search across title and description', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText(/search tasks/i), 'docs')

    expect(visibleTaskTitles()).toEqual(['Update docs'])
  })

  it('reorders cards High → Medium → Low when Sort by Priority is chosen', async () => {
    const user = userEvent.setup()
    render(<App />)

    // The BoardView toolbar has exactly one <select> (the sort dropdown).
    // Priority <Select> inside TaskForm only mounts when the modal is open,
    // so this query is unambiguous here.
    await user.selectOptions(screen.getByRole('combobox'), 'priority')

    expect(visibleTaskTitles()).toEqual([
      'Fix login bug', // High
      'Refactor code', // Medium
      'Update docs', // Low
    ])
  })
})
