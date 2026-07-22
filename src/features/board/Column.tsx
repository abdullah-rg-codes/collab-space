import type { Task, TaskStatus } from "../../types"
import React from "react"
import TaskCard from "../tasks/TaskCard"
import styles from './Column.module.css'

interface ColumnProps {
    status: TaskStatus
    tasks: Task[]
    onTaskClick: (task: Task) => void
    onTaskDelete: (task: Task) => void
    onTaskDrop: (task: Task, newStatus: TaskStatus) => void
}

const Column = React.memo(function Column({ status, tasks, onTaskClick, onTaskDelete, onTaskDrop }: ColumnProps) {
    const [isDragOver, setIsDragOver] = React.useState(false)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setIsDragOver(true)
    }

    const handleDragLeave = () => {
        setIsDragOver(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        const taskData = e.dataTransfer.getData('application/json')
        if (taskData) {
            try {
                const task = JSON.parse(taskData)
                onTaskDrop(task, status)
            } catch (error) {
                console.error('Error parsing dropped task:', error)
            }
        }
    }

    return (
        <div className={styles.columnContainer}>
            <div className={styles.columnHeader}>
                <h2>{status}</h2>
                <span className={styles.taskCount}>{tasks.length}</span>
            </div>

            {/* Tasks list */}
            <div 
                className={`${styles.tasksList} ${isDragOver ? styles.dragOver : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {tasks.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyStateIcon}>📭</div>
                        <p className={styles.emptyStateTitle}>No tasks yet</p>
                        <p className={styles.emptyStateDescription}>
                            {status === 'Backlog' && 'Ready to add a new task? Create one above!'}
                            {status === 'In Progress' && 'Drag tasks here to start working on them'}
                            {status === 'Done' && 'Completed tasks will appear here'}
                        </p>
                    </div>
                ) : (
                    tasks.map(task => (
                        <TaskCard 
                            key={task.id} 
                            task={task} 
                            onEdit={onTaskClick}
                            onDelete={onTaskDelete}
                        />
                    ))
                )}
            </div>
        </div>
    )
})

export default Column
