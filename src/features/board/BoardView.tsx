import { useTasks } from "../../hooks/useTasks";
import { TaskStatus } from "../../types";
import styles from './BoardView.module.css'
import Column from "./Column";

export default function BoardView(){
    const {filteredTasks}=useTasks();
    
    // The three status columns
    const columns:TaskStatus[]=[TaskStatus.BACKLOG,TaskStatus.IN_PROGRESS,TaskStatus.DONE] 

    return(
        <div className={styles.boardContainer}>
            <h1>CollabSpace</h1>
            <div className={styles.columnsWrapper}>
                {columns.map(status=>(
                    <Column key={status} status={status} tasks={filteredTasks.filter(task=>task.status===status)}
                    />
                ))}
            </div>
        </div>
    )
}