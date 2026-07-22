import { useEffect, useMemo, useReducer, useCallback, useRef } from "react";
import type { Task, TaskStatus, TaskPriority, TasksState } from '../types'
import { loadTasks, saveTasks } from "../lib/storage";

// Action types for the reducer
type TaskAction =
    | { type: 'ADD_TASK'; payload: Task }
    | { type: 'UPDATE_TASK'; payload: Task }
    | { type: 'DELETE_TASK'; payload: string }
    | { type: 'SET_FILTER'; payload: { status?: TaskStatus[]; priority?: TaskPriority[]; search?: string } }
    | { type: 'SET_SORT'; payload: 'createdAt' | 'updatedAt' | 'priority' }

// Reducer function
function tasksReducer(state: TasksState, action: TaskAction): TasksState {
    switch (action.type) {
        case 'ADD_TASK':
            return {
                ...state,
                tasks: { ...state.tasks, [action.payload.id]: action.payload },
                ids: [...state.ids, action.payload.id],
            }

        case 'UPDATE_TASK':
            return {
                ...state,
                tasks: { ...state.tasks, [action.payload.id]: action.payload },
            }

        case 'DELETE_TASK': {
            const { [action.payload]: _, ...remainingTasks } = state.tasks
            return {
                ...state,
                tasks: remainingTasks,
                ids: state.ids.filter(id => id !== action.payload),
            }
        }

        case 'SET_FILTER':
            return {
                ...state,
                filters: { ...state.filters, ...action.payload },
            }

        case 'SET_SORT':
            return { ...state, sortBy: action.payload }

        default:
            return state
    }
}

/**
 * Initialize state by reading localStorage synchronously.
 * This runs once during useReducer init — no race conditions.
 */
function createInitialState(): TasksState {
    const tasks = loadTasks()
    const tasksMap: Record<string, Task> = {}
    const ids: string[] = []
    tasks.forEach(task => {
        tasksMap[task.id] = task
        ids.push(task.id)
    })
    return {
        tasks: tasksMap,
        ids,
        filters: {
            status: [],
            priority: [],
            search: '',
        },
        sortBy: 'createdAt',
    }
}

export function useTasks(onError?: (message: string) => void) {
    // Hydrate from localStorage synchronously — state is never empty
    const [state, dispatch] = useReducer(tasksReducer, undefined, createInitialState)

    // Skip saving on the very first render (data already matches localStorage)
    const isFirstRender = useRef(true)

    // Save to storage whenever tasks change (skip initial render)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }
        const allTasks = state.ids.map(id => state.tasks[id])
        try {
            saveTasks(allTasks)
        } catch (error) {
            console.error('[useTasks] Failed to save tasks:', error)
            if (onError) {
                onError('Failed to save tasks to storage')
            }
        }
    }, [state.tasks, state.ids, onError])

    // Compute filtered and sorted tasks
    const filteredTasks = useMemo(() => {
        let result = state.ids.map(id => state.tasks[id])

        // Apply status filter
        if (state.filters.status.length > 0) {
            result = result.filter(task => state.filters.status.includes(task.status))
        }

        // Apply priority filter
        if (state.filters.priority.length > 0) {
            result = result.filter(task => state.filters.priority.includes(task.priority))
        }

        // Apply search filter
        if (state.filters.search) {
            const search = state.filters.search.toLowerCase()
            result = result.filter(task =>
                task.title.toLowerCase().includes(search) ||
                task.description.toLowerCase().includes(search)
            )
        }

        // Apply sorting
        result.sort((a, b) => {
            if (state.sortBy === 'priority') {
                const priorityOrder = { High: 0, Medium: 1, Low: 2 }
                return priorityOrder[a.priority as keyof typeof priorityOrder] -
                    priorityOrder[b.priority as keyof typeof priorityOrder]
            }
            return b[state.sortBy] - a[state.sortBy]
        })

        return result
    }, [state.ids, state.tasks, state.filters, state.sortBy])


    // Action creators (memoized)
    const addTask = useCallback((task: Task) => {
        dispatch({ type: 'ADD_TASK', payload: task })
    }, [])

    const updateTask = useCallback((task: Task) => {
        dispatch({ type: 'UPDATE_TASK', payload: task })
    }, [])

    const deleteTask = useCallback((id: string) => {
        dispatch({ type: 'DELETE_TASK', payload: id })
    }, [])

    const setFilter = useCallback((filter: { status?: TaskStatus[]; priority?: TaskPriority[]; search?: string }) => {
        dispatch({ type: 'SET_FILTER', payload: filter })
    }, [])

    const setSortBy = useCallback((sortBy: 'createdAt' | 'updatedAt' | 'priority') => {
        dispatch({ type: 'SET_SORT', payload: sortBy })
    }, [])

    // Memoize the tasks array to prevent new references on every render
    const tasks = useMemo(() => {
        return state.ids.map(id => state.tasks[id])
    }, [state.ids, state.tasks])

    return {
        tasks,
        filteredTasks,
        filters: state.filters,
        sortBy: state.sortBy,
        addTask,
        updateTask,
        deleteTask,
        setFilter,
        setSortBy,
    }
}
