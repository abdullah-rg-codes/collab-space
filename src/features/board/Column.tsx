import type { Task, TaskStatus } from "../../types"
import TaskCard from "../tasks/TaskCard"
import styles from './Column.module.css'

interface ColumnProps {
    status: TaskStatus
    tasks: Task[]
    onTaskClick: (task: Task) => void
    onTaskDelete: (task: Task) => void
}

function Column({ status, tasks, onTaskClick, onTaskDelete }: ColumnProps) {
    return (
        <div className={styles.columnContainer}>
            <div className={styles.columnHeader}>
                <h2>{status}</h2>
                <span className={styles.taskCount}>{tasks.length}</span>
            </div>

            {/* Tasks list */}
            <div className={styles.tasksList}>
                {tasks.length === 0 ? (
                    <div className={styles.emptyState}>No tasks</div>
                ) : (
                    tasks.map(task => (
                        <TaskCard 
                            key={task.id} 
                            task={task} 
                            onEdit={() => onTaskClick(task)}
                            onDelete={() => onTaskDelete(task)}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

export default Column