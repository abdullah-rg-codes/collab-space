import { useEffect, useRef, useCallback } from 'react'

/**
 * Custom hook to detect and warn about unsaved changes
 * Warns user before leaving page or closing modal if there are unsaved changes
 *
 * Usage:
 * const isDirty = useDirtyState(formData, onConfirmLeave)
 */
export function useDirtyState(
  isDirty: boolean,
  onBeforeLeave?: () => void
) {
  const isDirtyRef = useRef(isDirty)

  // Update ref when isDirty changes
  useEffect(() => {
    isDirtyRef.current = isDirty
  }, [isDirty])

  // Handle beforeunload event for page navigation
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        // Standard way to show unsaved changes warning
        event.preventDefault()
        event.returnValue = ''
        return ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  // Return isDirty for use in component logic
  return isDirty
}

/**
 * Helper to check if task form has unsaved changes
 * Compares current form state with original task
 */
export function checkTaskFormDirty(
  originalTask: any,
  formState: {
    title: string
    description: string
    priority: string
    assignee: string
    tags: string[]
    dueDate: string
  }
): boolean {
  // If no original task, it's new task - dirty if title is filled
  if (!originalTask) {
    return formState.title.trim() !== ''
  }

  // Compare each field with original task
  const isDifferent =
    formState.title !== originalTask.title ||
    formState.description !== originalTask.description ||
    formState.priority !== originalTask.priority ||
    formState.assignee !== originalTask.assignee ||
    formState.dueDate !== originalTask.dueDate ||
    JSON.stringify(formState.tags) !== JSON.stringify(originalTask.tags)

  return isDifferent
}
