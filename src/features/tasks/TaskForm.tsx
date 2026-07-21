import { useState, useCallback } from 'react'
import type { Task, TaskPriority } from '../../types'
import { TaskStatus } from '../../types'
import { Button, TextInput, TextArea, Select } from '../../components/ui'
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

        const newTask: Task = {
            id: task?.id ?? `task-${Date.now()}`,
            title: title.trim(),
            description: description.trim(),
            priority,
            assignee: assignee.trim(),
            tags,
            status: task?.status ?? TaskStatus.BACKLOG,
            createdAt: task?.createdAt ?? Date.now(),
            updatedAt: Date.now(),
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

    const isEditing = !!task
    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h2>{isEditing ? 'Edit Task' : 'Create New Task'}</h2>

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
                <Button variant="secondary" onClick={onCancel} type="button">
                    Cancel
                </Button>
                <Button variant="primary" type="submit">
                    {isEditing ? 'Update' : 'Create'}
                </Button>
            </div>
        </form>
    )
}
export default TaskForm