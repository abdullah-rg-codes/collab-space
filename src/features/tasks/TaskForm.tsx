import { useState, useCallback } from 'react'
import dayjs from 'dayjs'
import type { Task, TaskPriority } from '../../types'
import { TaskStatus } from '../../types'
import { Button, TextInput, TextArea, Select, DateInput } from '../../components/ui'
import { useDirtyState, checkTaskFormDirty } from '../../hooks/useDirtyState'
import styles from './TaskForm.module.css'

interface TaskFormProps {
    task?: Task // If provided, edit mode; if not, create mode
    onSubmit: (task: Task) => void
    onCancel: () => void
}


function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
    const [title, setTitle] = useState(task?.title ?? '')
    const [description, setDescription] = useState(task?.description ?? '')
    const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'Medium')
    const [assignee, setAssignee] = useState(task?.assignee ?? '')
    const [tags, setTags] = useState<string[]>(task?.tags ?? [])
    const [tagInput, setTagInput] = useState('')
    const [error, setError] = useState('')
    const [dueDate, setDueDate] = useState(
        task?.dueDate ? dayjs(task.dueDate).format('YYYY-MM-DD') : dayjs().add(1, 'day').format('YYYY-MM-DD')
    )
    const [showDirtyWarning, setShowDirtyWarning] = useState(false)

    // createdAt is read-only and only shown in edit mode
    const createdAtDisplay = task?.createdAt ? dayjs(task.createdAt).format('MMMM D, YYYY [at] h:mm A') : null

    // Check if form is dirty (has unsaved changes)
    const isDirty = checkTaskFormDirty(task, {
        title,
        description,
        priority,
        assignee,
        tags,
        dueDate,
    })

    // Enable dirty state warning
    useDirtyState(isDirty)

    // Validation
    const validate = useCallback(() => {
        if (!title.trim()) {
            setError('Title is required')
            return false
        }
        if (title.length > 100) {
            setError('Title must be less than 100 characters')
            return false
        }
        return true
    }, [title])

    // Handle form submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!validate()) return

        const now = dayjs().valueOf() // Get current timestamp
        const dueDateTimestamp = dayjs(dueDate).valueOf() // Convert selected date to timestamp

        const newTask: Task = {
            id: task?.id ?? `task-${Date.now()}`,
            title: title.trim(),
            description: description.trim(),
            priority,
            assignee: assignee.trim(),
            tags,
            status: task?.status ?? TaskStatus.BACKLOG,
            createdAt: task?.createdAt ?? now, // Keep original creation time, or set now for new tasks
            updatedAt: now, // Always update the modification time
            dueDate: dueDateTimestamp,
        }

        onSubmit(newTask)
    }
    // Handle adding tags
    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()])
            setTagInput('')
        }
    }

    // Handle removing tags
    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove))
    }

    // Handle cancel with dirty state check
    const handleCancel = () => {
        if (isDirty) {
            setShowDirtyWarning(true)
        } else {
            onCancel()
        }
    }

    // Confirm cancel despite unsaved changes
    const handleConfirmCancel = () => {
        setShowDirtyWarning(false)
        onCancel()
    }

    // Keep editing (close warning without leaving)
    const handleContinueEditing = () => {
        setShowDirtyWarning(false)
    }

    const isEditing = !!task
    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}

            {/* Title */}
            <TextInput
                label="Title"
                placeholder="Task title..."
                value={title}
                onChange={setTitle}
                required
                error={error ? 'Title is required' : ''}
            />

            {/* Description */}
            <TextArea
                label="Description"
                placeholder="Add task details..."
                value={description}
                onChange={setDescription}
            />

            {/* Priority */}
            <Select
                label="Priority"
                value={priority}
                onChange={(val) => setPriority(val as TaskPriority)}
                options={[
                    { value: 'Low', label: 'Low' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'High', label: 'High' },
                ]}
            />

            {/* Assignee */}
            <TextInput
                label="Assignee"
                placeholder="Who is assigned?"
                value={assignee}
                onChange={setAssignee}
            />

            {/* Task Finish Date (Due Date) - Editable */}
            <DateInput
                label="Task Finish Date"
                value={dueDate}
                onChange={setDueDate}
            />

            {/* Created At - Read-only (only shown in edit mode) */}
            {createdAtDisplay && (
                <div className={styles.createdAtReadOnly}>
                    <label>Created At</label>
                    <p>{createdAtDisplay}</p>
                </div>
            )}

            {/* Tags */}
            <div className={styles.tagsSection}>
                <label>Tags</label>
                <div className={styles.tagInput}>
                    <TextInput
                        placeholder="Add a tag..."
                        value={tagInput}
                        onChange={setTagInput}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddTag()
                            }
                        }}
                    />
                    <Button onClick={handleAddTag} variant="secondary">
                        Add
                    </Button>
                </div>
                <div className={styles.tagsList}>
                    {tags.map(tag => (
                        <span key={tag} className={styles.tag}>
                            {tag}
                            <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className={styles.removeTag}
                            >
                                ✕
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            {/* Form Actions */}
            <div className={styles.formActions}>
                <Button variant="secondary" onClick={handleCancel} type="button">
                    Cancel
                </Button>
                <Button variant="primary" type="submit">
                    {isEditing ? 'Update' : 'Create'}
                </Button>
            </div>

            {/* Dirty State Warning Modal */}
            {showDirtyWarning && (
                <div className={styles.dirtyWarningOverlay}>
                    <div className={styles.dirtyWarningDialog}>
                        <h3>Unsaved Changes</h3>
                        <p>You have unsaved changes. Are you sure you want to leave without saving?</p>
                        <div className={styles.dirtyWarningActions}>
                            <Button variant="secondary" onClick={handleContinueEditing}>
                                Continue Editing
                            </Button>
                            <Button variant="destructive" onClick={handleConfirmCancel}>
                                Discard Changes
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    )
}
export default TaskForm