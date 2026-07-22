/**
 * Modal Component
 * 
 * Features: focus trap, close on Escape, ARIA attributes, backdrop close
 */

import React, { useEffect, useRef } from 'react'
import type { ModalProps } from '../../types/index'
import './Modal.css'

export function Modal({
  isOpen,
  title,
  children,
  onClose,
  footer,
  size = 'md',
  className = '',
}: ModalProps): React.JSX.Element | null {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const dialog = dialogRef.current
    if (!dialog) return

    // Store previously focused element
    const previouslyFocused = document.activeElement as HTMLElement

    // Focus first focusable element in modal
    const focusableElements = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    // Prefer the first input/textarea for forms, otherwise first focusable
    const firstInput = dialog.querySelector('input:not([disabled]), textarea:not([disabled])') as HTMLElement
    const firstFocusable = (firstInput || focusableElements[0]) as HTMLElement
    firstFocusable?.focus()

    // Handle keyboard escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }

      // Focus trap
      if (e.key === 'Tab' && focusableElements.length > 0) {
        const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement
        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable.focus()
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable.focus()
        }
      }
    }

    dialog.addEventListener('keydown', handleKeyDown)

    // Restore focus when closed
    return () => {
      dialog.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={`modal modal-${size} ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {title && (
          <div className="modal-header">
            <h2 id="modal-title" className="modal-title">
              {title}
            </h2>
            <button
              className="modal-close"
              onClick={onClose}
              aria-label="Close dialog"
              type="button"
            >
              ×
            </button>
          </div>
        )}
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}
