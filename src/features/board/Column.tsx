import type { Task, TaskStatus } from "../../types"
import TaskCard from "../tasks/TaskCard"
import styles from './Column.module.css'

interface ColumnProps {
    status: TaskStatus
    tasks: Task[]
}

function Column({ status, tasks }: ColumnProps) {
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
                        <TaskCard key={task.id} task={task} />
                    ))
                )}
            </div>
        </div>
    )
}

export default Column