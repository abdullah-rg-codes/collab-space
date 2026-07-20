/**
 * Toast Component
 * 
 * Features: auto-dismiss, stacking, type variants, screen reader announcements
 */

import React, { useEffect } from 'react'
import type { ToastProps } from '../../types/index'
import './Toast.css'

export function Toast({
  id,
  message,
  type = 'info',
  duration = 4000,
  onClose,
}: ToastProps): React.JSX.Element {
  useEffect(() => {
    if (duration <= 0) return

    const timer = setTimeout(() => {
      onClose(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '⚠'
      default:
        return 'ℹ'
    }
  }

  return (
    <div
      className={`toast toast-${type}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="toast-icon">{getIcon(type)}</span>
      <span className="toast-message">{message}</span>
      <button
        className="toast-close"
        onClick={() => onClose(id)}
        aria-label="Dismiss notification"
        type="button"
      >
        ×
      </button>
    </div>
  )
}

/**
 * ToastContainer - renders multiple toasts with stacking
 */
interface ToastContainerProps {
  toasts: Array<ToastProps & { id: string }>
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps): React.JSX.Element {
  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  )
}
