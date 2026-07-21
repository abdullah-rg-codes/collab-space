import './App.css'
import { useState, useEffect } from 'react'
import type { Task, TaskStatus, ToastProps } from './types'
import { Button, Modal, ToastContainer } from './components/ui'
import { useTasks } from './hooks/useTasks'
import { useUrlFilters } from './hooks/useUrlFilters'
import { useToast } from './hooks/useToast'
import { didMigrationHappen } from './lib/storage'
import BoardView from './features/board/BoardView'
import TaskForm from './features/tasks/TaskForm'

function App() {
  const {
    addTask,
    updateTask,
    deleteTask,
    filteredTasks,
    filters,
    sortBy,
    setFilter,
    setSortBy,
  } = useTasks()

  const { toasts, addToast, removeToast } = useToast()

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
  const handleEditTask = (task: Task) => {
    console.log('[App] handleEditTask() called with:', task)
    setEditingTask(task)
    setIsModalOpen(true)
  }

  // Handle delete task - show confirmation
  const handleDeleteTask = (task: Task) => {
    console.log('[App] handleDeleteTask() called with:', task)
    setTaskToDelete(task)
  }

  // Confirm delete
  const handleConfirmDelete = () => {
    if (taskToDelete) {
      console.log('[App] Confirming delete for task:', taskToDelete.id)
      deleteTask(taskToDelete.id)
      setTaskToDelete(undefined)
    }
  }

  // Cancel delete
  const handleCancelDelete = () => {
    console.log('[App] Cancelling delete')
    setTaskToDelete(undefined)
  }

  // Handle task drop - move to different column
  const handleTaskDrop = (task: Task, newStatus: TaskStatus) => {
    console.log('[App] handleTaskDrop() called - moving task', task.id, 'to', newStatus)
    if (task.status !== newStatus) {
      const updatedTask = { ...task, status: newStatus, updatedAt: Date.now() }
      updateTask(updatedTask)
    }
  }

  // Open modal for new task
  const handleCreateNew = () => {
    console.log('[App] handleCreateNew() called')
    setEditingTask(undefined)
    setIsModalOpen(true)
  }

  // Handle form submit (create or update)
  const handleFormSubmit = (task: Task) => {
    console.log('[App] handleFormSubmit() called with:', task)
    if (editingTask) {
      console.log('[App] Updating existing task')
      updateTask(task)
    } else {
      console.log('[App] Adding new task')
      addTask(task)
    }
    setIsModalOpen(false)
    setEditingTask(undefined)
  }

  // Handle modal close
  const handleCloseModal = () => {
    console.log('[App] handleCloseModal() called')
    setIsModalOpen(false)
    setEditingTask(undefined)
  }

  return (
    <>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
              Are you sure you want to delete this task?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
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
    </>
  )
}

export default App
