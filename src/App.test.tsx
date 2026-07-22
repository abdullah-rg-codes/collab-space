/**
 * Core workflow test:
 *   User creates a new task via the form and sees it appear on the board.
 *
 * This exercises the primary happy path end-to-end:
 *   useTasks (hook) → storage → filter/sort logic → output
 *
 * We test the core logic through the useTasks hook directly (using renderHook)
 * rather than rendering the full App tree, because React 19's concurrent
 * renderer hangs during jsdom cleanup when components have active effects
 * (Toast timers, beforeunload listeners). This approach validates the same
 * business logic without the environment limitation.
 */
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTasks } from './hooks/useTasks'
import { loadTasks } from './lib/storage'
import type { Task } from './types'

describe('Core workflow: creating a task and seeing it on the board', () => {
  it('adds a new task and it appears in filteredTasks with Backlog status', () => {
    const { result } = renderHook(() => useTasks())

    // Initially no tasks
    expect(result.current.filteredTasks).toHaveLength(0)

    // Create a new task (simulating what TaskForm.onSubmit produces)
    const newTask: Task = {
      id: 'test-1',
      title: 'Write unit tests',
      description: 'Add comprehensive test coverage',
      status: 'Backlog',
      priority: 'High',
      assignee: 'Dev',
      tags: ['testing', 'quality'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    }

    act(() => {
      result.current.addTask(newTask)
    })

    // Task appears in filteredTasks
    expect(result.current.filteredTasks).toHaveLength(1)
    expect(result.current.filteredTasks[0].title).toBe('Write unit tests')
    expect(result.current.filteredTasks[0].status).toBe('Backlog')
    expect(result.current.filteredTasks[0].priority).toBe('High')
    expect(result.current.filteredTasks[0].tags).toEqual(['testing', 'quality'])

    // Task is persisted to localStorage
    const stored = loadTasks()
    expect(stored).toHaveLength(1)
    expect(stored[0].title).toBe('Write unit tests')
    expect(stored[0].id).toBe('test-1')
  })

  it('creates multiple tasks and they appear sorted by createdAt desc (newest first)', () => {
    const { result } = renderHook(() => useTasks())

    const task1: Task = {
      id: 'task-1',
      title: 'First task',
      description: '',
      status: 'Backlog',
      priority: 'Low',
      assignee: '',
      tags: [],
      createdAt: 1000,
      updatedAt: 1000,
      dueDate: 0,
    }

    const task2: Task = {
      id: 'task-2',
      title: 'Second task',
      description: '',
      status: 'In Progress',
      priority: 'High',
      assignee: 'Alice',
      tags: ['urgent'],
      createdAt: 2000,
      updatedAt: 2000,
      dueDate: 0,
    }

    act(() => {
      result.current.addTask(task1)
      result.current.addTask(task2)
    })

    // Default sort is createdAt descending (newest first)
    expect(result.current.filteredTasks).toHaveLength(2)
    expect(result.current.filteredTasks[0].title).toBe('Second task')
    expect(result.current.filteredTasks[1].title).toBe('First task')
  })

  it('updates a task status (simulating drag-and-drop column move)', () => {
    const { result } = renderHook(() => useTasks())

    const task: Task = {
      id: 'drag-1',
      title: 'Draggable task',
      description: '',
      status: 'Backlog',
      priority: 'Medium',
      assignee: '',
      tags: [],
      createdAt: 1000,
      updatedAt: 1000,
      dueDate: 0,
    }

    act(() => {
      result.current.addTask(task)
    })

    expect(result.current.filteredTasks[0].status).toBe('Backlog')

    // Simulate drag-drop: move to In Progress
    act(() => {
      result.current.updateTask({
        ...task,
        status: 'In Progress',
        updatedAt: Date.now(),
      })
    })

    expect(result.current.filteredTasks[0].status).toBe('In Progress')
  })

  it('deletes a task and it disappears from filteredTasks and storage', () => {
    const { result } = renderHook(() => useTasks())

    const task: Task = {
      id: 'del-1',
      title: 'To be deleted',
      description: '',
      status: 'Done',
      priority: 'Low',
      assignee: '',
      tags: [],
      createdAt: 1000,
      updatedAt: 1000,
      dueDate: 0,
    }

    act(() => {
      result.current.addTask(task)
    })

    expect(result.current.filteredTasks).toHaveLength(1)

    act(() => {
      result.current.deleteTask('del-1')
    })

    expect(result.current.filteredTasks).toHaveLength(0)
    expect(loadTasks()).toHaveLength(0)
  })
})
