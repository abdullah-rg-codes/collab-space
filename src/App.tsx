import './App.css'
import { useState, useEffect, useCallback } from 'react'
import type { Task, TaskStatus, ToastProps } from './types'
import { Button, Modal, ToastContainer } from './components/ui'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useTasks } from './hooks/useTasks'
import { useUrlFilters } from './hooks/useUrlFilters'
import { useToast } from './hooks/useToast'
import { didMigrationHappen } from './lib/storage'
import BoardView from './features/board/BoardView'
import TaskForm from './features/tasks/TaskForm'

function App() {
  const { toasts, addToast, removeToast } = useToast()

  // Error handler for storage operations
  const handleStorageError = useCallback((message: string) => {
    addToast(message, 'error', 5000)
  }, [addToast])

  const {
    addTask,
    updateTask,
    deleteTask,
    filteredTasks,
    filters,
    sortBy,
    setFilter,
    setSortBy,
  } = useTasks(handleStorageError)

  // Initialize URL filters on mount
  const { updateUrlWithFilters } = useUrlFilters(setFilter, setSortBy)

  // Modal state for create/edit
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [taskToDelete, setTaskToDelete] = useState<Task | undefined>()

  // Show migration notification on mount if migration happened
  useEffect(() => {
    if (didMigrationHappen()) {
      addToast('Your data has been automatically upgraded to the latest version', 'success', 5000)
    }
  }, [addToast])

  // Sync filters/sort to URL whenever they change
  useEffect(() => {
    updateUrlWithFilters(filters.status, filters.priority, filters.search, sortBy)
  }, [filters.status, filters.priority, filters.search, sortBy, updateUrlWithFilters])

  // Handle edit task
  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }, [])

  // Handle delete task - show confirmation
  const handleDeleteTask = useCallback((task: Task) => {
    setTaskToDelete(task)
  }, [])

  // Confirm delete
  const handleConfirmDelete = useCallback(() => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id)
      setTaskToDelete(undefined)
    }
  }, [taskToDelete, deleteTask])

  // Cancel delete
  const handleCancelDelete = useCallback(() => {
    setTaskToDelete(undefined)
  }, [])

  // Handle task drop - move to different column
  const handleTaskDrop = useCallback((task: Task, newStatus: TaskStatus) => {
    if (task.status !== newStatus) {
      const updatedTask = { ...task, status: newStatus, updatedAt: Date.now() }
      updateTask(updatedTask)
    }
  }, [updateTask])

  // Open modal for new task
  const handleCreateNew = useCallback(() => {
    setEditingTask(undefined)
    setIsModalOpen(true)
  }, [])

  // Handle form submit (create or update)
  const handleFormSubmit = useCallback((task: Task) => {
    if (editingTask) {
      updateTask(task)
    } else {
      addTask(task)
    }
    setIsModalOpen(false)
    setEditingTask(undefined)
  }, [editingTask, updateTask, addTask])

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setEditingTask(undefined)
  }, [])

  return (
    <ErrorBoundary>
      <div className="app">
        <header className="appHeader">
          <div className='headerContent'>
            <h1>CollobSpace</h1>
            <p>Manage tasks and priorities</p>
          </div>
          <Button variant='primary' onClick={handleCreateNew} >+ New Task</Button>
        </header>

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts as (ToastProps & { id: string })[]} onClose={removeToast} />

        {/* Main Board */}
        <main className='appMain'><BoardView filteredTasks={filteredTasks}
          filters={filters}
          sortBy={sortBy}
          setFilter={setFilter}
          setSortBy={setSortBy}
          onTaskClick={handleEditTask}
          onTaskDelete={handleDeleteTask}
          onTaskDrop={handleTaskDrop} /></main>
        {/* Create/Edit Task Modal */}
        <Modal isOpen={isModalOpen} title={editingTask ? 'Edit Task' : 'Create New Task'}
          onClose={handleCloseModal}>
          <TaskForm task={editingTask}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseModal}></TaskForm>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={!!taskToDelete} title="Delete Task" onClose={handleCancelDelete}>
          <div className="deleteConfirmation">
            <p className="deleteMessage">
              Are you sure you want to delete this task?
            </p>
            <div className="deleteActions">
              <Button variant="secondary" onClick={handleCancelDelete}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ErrorBoundary>
  )
}

export default App
