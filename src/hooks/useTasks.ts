import { useEffect, useMemo, useReducer, useCallback } from "react";
import type { Task, TaskStatus, TaskPriority, TasksState } from '../types'
import { loadTasks, saveTasks } from "../lib/storage";

// Action types for the reducer
type TaskAction =
    | { type: 'LOAD_TASKS'; payload: Task[] }
    | { type: 'ADD_TASK'; payload: Task }
    | { type: 'UPDATE_TASK'; payload: Task }
    | { type: 'DELETE_TASK'; payload: string }
    | { type: 'SET_FILTER'; payload: { status?: TaskStatus[]; priority?: TaskPriority[]; search?: string } }
    | { type: 'SET_SORT'; payload: 'createdAt' | 'updatedAt' | 'priority' }
// Initial state
const initialState: TasksState = {
    tasks: {},
    ids: [],
    filters: {
        status: [],
        priority: [],
        search: '',
    },
    sortBy: 'createdAt',
}
// Reducer function
function tasksReducer(state: TasksState, action: TaskAction): TasksState {
    console.log('[Reducer] Action:', action.type, action)
    switch (action.type) {
        case 'LOAD_TASKS':
            // Convert array to normalized state
            const tasksMap: Record<string, Task> = {}
            const ids: string[] = []
            action.payload.forEach(task => {
                tasksMap[task.id] = task
                ids.push(task.id)
            })
            console.log('[Reducer] LOAD_TASKS: Loaded', ids.length, 'tasks')
            return { ...state, tasks: tasksMap, ids }

        case 'ADD_TASK':
            console.log('[Reducer] ADD_TASK: Adding task', action.payload.id, action.payload.title)
            return {
                ...state,
                tasks: { ...state.tasks, [action.payload.id]: action.payload },
                ids: [...state.ids, action.payload.id],
            }

        case 'UPDATE_TASK':
            console.log('[Reducer] UPDATE_TASK: Updating task', action.payload.id)
            return {
                ...state,
                tasks: { ...state.tasks, [action.payload.id]: action.payload },
            }

        case 'DELETE_TASK':
            console.log('[Reducer] DELETE_TASK: Deleting task', action.payload)
            const { [action.payload]: _, ...remainingTasks } = state.tasks
            return {
                ...state,
                tasks: remainingTasks,
                ids: state.ids.filter(id => id !== action.payload),
            }

        case 'SET_FILTER':
            console.log('[Reducer] SET_FILTER: Applying filter', action.payload)
            return {
                ...state,
                filters: { ...state.filters, ...action.payload },
            }

        case 'SET_SORT':
            console.log('[Reducer] SET_SORT: Sorting by', action.payload)
            return { ...state, sortBy: action.payload }

        default:
            return state
    }
}
export function useTasks(onError?: (message: string) => void) {
    console.log('[useTasks] Hook initialized')
    const [state, dispatch] = useReducer(tasksReducer, initialState)

    // Load tasks from storage on mount
    useEffect(() => {
        console.log('[useTasks] Loading tasks on mount')
        try {
            const tasks = loadTasks()
            console.log('[useTasks] Loaded', tasks.length, 'tasks from storage')
            dispatch({ type: 'LOAD_TASKS', payload: tasks })
        } catch (error) {
            console.error('[useTasks] Failed to load tasks:', error)
            if (onError) {
                onError('Failed to load tasks from storage')
            }
        }
    }, [onError])

    //save to storage whenever tasks change
    useEffect(() => {
        const allTasks = state.ids.map(id => state.tasks[id])
        console.log('[useTasks] useEffect: Saving', allTasks.length, 'tasks to storage')
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
        console.log('[useTasks] Computing filteredTasks...')
        let result = state.ids.map(id => state.tasks[id])
        console.log('[useTasks] Initial result count:', result.length)

        // Apply status filter
        if (state.filters.status.length > 0) {
            result = result.filter(task => state.filters.status.includes(task.status))
            console.log('[useTasks] After status filter:', result.length)
        }

        // Apply priority filter
        if (state.filters.priority.length > 0) {
            result = result.filter(task => state.filters.priority.includes(task.priority))
            console.log('[useTasks] After priority filter:', result.length)
        }

        // Apply search filter
        if (state.filters.search) {
            const search = state.filters.search.toLowerCase()
            result = result.filter(task =>
                task.title.toLowerCase().includes(search) ||
                task.description.toLowerCase().includes(search)
            )
            console.log('[useTasks] After search filter:', result.length)
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

        console.log('[useTasks] Final filteredTasks count:', result.length)
        console.log('[useTasks] Filtered tasks:', result)
        return result
    }, [state.ids, state.tasks, state.filters, state.sortBy])


    // Action creators (memoized)
    const addTask = useCallback((task: Task) => {
        console.log('[useTasks] addTask() called with:', task)
        dispatch({ type: 'ADD_TASK', payload: task })
    }, [])

    const updateTask = useCallback((task: Task) => {
        console.log('[useTasks] updateTask() called with:', task)
        dispatch({ type: 'UPDATE_TASK', payload: task })
    }, [])

    const deleteTask = useCallback((id: string) => {
        console.log('[useTasks] deleteTask() called with id:', id)
        dispatch({ type: 'DELETE_TASK', payload: id })
    }, [])

    const setFilter = useCallback((filter: any) => {
        console.log('[useTasks] setFilter() called with:', filter)
        dispatch({ type: 'SET_FILTER', payload: filter })
    }, [])

    const setSortBy = useCallback((sortBy: any) => {
        console.log('[useTasks] setSortBy() called with:', sortBy)
        dispatch({ type: 'SET_SORT', payload: sortBy })
    }, [])

    return {
        tasks: state.ids.map(id => state.tasks[id]),
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