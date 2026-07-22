import { useState, useCallback } from 'react'
import type { ToastProps } from '../types'

/**
 * Custom hook to manage toast notifications
 * Provides addToast and removeToast functions
 */
export function useToast() {
  const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([])

  const addToast = useCallback(
    (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info', duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random()}`
      const newToast: Omit<ToastProps, 'onClose'> = { id, message, type, duration }
      setToasts((prev) => [...prev, newToast])
      return id
    },
    []
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}
