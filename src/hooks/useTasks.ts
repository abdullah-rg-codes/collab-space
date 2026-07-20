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
    switch (action.type) {
        case 'LOAD_TASKS':
            // Convert array to normalized state
            const tasksMap: Record<string, Task> = {}
            const ids: string[] = []
            action.payload.forEach(task => {
                tasksMap[task.id] = task
                ids.push(task.id)
            })
            return { ...state, tasks: tasksMap, ids }

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

        case 'DELETE_TASK':
            const { [action.payload]: _, ...remainingTasks } = state.tasks
            return {
                ...state,
                tasks: remainingTasks,
                ids: state.ids.filter(id => id !== action.payload),
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
export function useTasks() {
    const [state, dispatch] = useReducer(tasksReducer, initialState)

    // Load tasks from storage on mount
    useEffect(() => {
        const tasks = loadTasks()
        dispatch({ type: 'LOAD_TASKS', payload: tasks })
    }, [])

    //save to storage whenever tasks change
    useEffect(() => {
        const allTasks = state.ids.map(id => state.tasks[id])
        saveTasks(allTasks)
    }, [state.tasks, state.ids])

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

    const setFilter = useCallback((filter: any) => {
        dispatch({ type: 'SET_FILTER', payload: filter })
    }, [])

    const setSortBy = useCallback((sortBy: any) => {
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