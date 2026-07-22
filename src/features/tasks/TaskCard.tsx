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
    onEdit?: (task: Task) => void
    onDelete?: (task: Task) => void
}

const TaskCard = React.memo(function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
    // Priority color mapping - monochrome
    const priorityColors: Record<TaskPriority, string> = {
        High: '#171717',
        Medium: '#525252',
        Low: '#a3a3a3',
    }

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('application/json', JSON.stringify(task))
    }

    return (
        <div 
            className={styles.taskCard}
            draggable
            onDragStart={handleDragStart}
        >
            {/* Action Buttons */}
            <div className={styles.actionButtons}>
                {onEdit && (
                    <button
                        className={styles.editButton}
                        onClick={() => onEdit(task)}
                        title="Edit task"
                        aria-label="Edit task"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    </button>
                )}
                {onDelete && (
                    <button
                        className={styles.deleteButton}
                        onClick={() => onDelete(task)}
                        title="Delete task"
                        aria-label="Delete task"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
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
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display: 'inline', verticalAlign: 'middle', marginRight: '4px'}}>
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Due: {dayjs(task.dueDate).format('MMM D, YYYY')}
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
