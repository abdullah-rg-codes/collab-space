import type { Task, TaskPriority } from "../../types"
import { Tag } from "../../components/ui"
import styles from './TaskCard.module.css'
import React from "react"

interface TaskCardProps {
    task: Task
    onClick?: () => void
}

const TaskCard = React.memo(function TaskCard({ task, onClick }: TaskCardProps) {
    // Priority color mapping
    const priorityColors: Record<TaskPriority, string> = {
        High: '#d32f2f',
        Medium: '#f57c00',
        Low: '#388e3c',
    }

    return (
        <div
            className={styles.taskCard}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onClick?.()
            }}
        >
            {/* Task Title */}
            <h3 className={styles.taskTitle}>{task.title}</h3>

            {/* Priority & Assignee */}
            <div className={styles.metadata}>
                <span
                    className={styles.priority}
                    style={{ backgroundColor: priorityColors[task.priority] }}
                >
                    {task.priority}
                </span>
                <span className={styles.assignee}>{task.assignee}</span>
            </div>

            {/* Tags */}
            {task.tags.length > 0 && (
                <div className={styles.tagsContainer}>
                    {task.tags.map(tag => (
                        <Tag key={tag} variant="default">
                            {tag}
                        </Tag>
                    ))}
                </div>
            )}
        </div>
    )
})

export default TaskCard
