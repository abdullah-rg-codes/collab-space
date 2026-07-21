import type { Task, TaskPriority } from "../../types"
import { Tag } from "../../components/ui"
import styles from './TaskCard.module.css'
import React from "react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

// Enable the relativeTime plugin
dayjs.extend(relativeTime)

interface TaskCardProps {
    task: Task
    onEdit?: () => void
    onDelete?: () => void
}

const TaskCard = React.memo(function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
    // Priority color mapping
    const priorityColors: Record<TaskPriority, string> = {
        High: '#d32f2f',
        Medium: '#f57c00',
        Low: '#388e3c',
    }

    return (
        <div className={styles.taskCard}>
            {/* Action Buttons */}
            <div className={styles.actionButtons}>
                {onEdit && (
                    <button
                        className={styles.editButton}
                        onClick={onEdit}
                        title="Edit task"
                        aria-label="Edit task"
                    >
                        ✏️
                    </button>
                )}
                {onDelete && (
                    <button
                        className={styles.deleteButton}
                        onClick={onDelete}
                        title="Delete task"
                        aria-label="Delete task"
                    >
                        🗑️
                    </button>
                )}
            </div>

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

            {/* Due Date */}
            {task.dueDate && (
                <div className={styles.dueDate}>
                    📅 Due: {dayjs(task.dueDate).format('MMM D, YYYY')}
                </div>
            )}

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

            {/* Relative Time */}
            <div className={styles.relativeTime}>
                <div>created {dayjs(task.createdAt).fromNow()}</div>
                <div>updated {dayjs(task.updatedAt).fromNow()}</div>
            </div>
        </div>
    )
})

export default TaskCard
