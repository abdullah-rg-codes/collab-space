/**
 * Button Component
 * 
 * Variants: primary, secondary, destructive
 * Sizes: sm, md, lg
 * Features: disabled state, click handler, ARIA labels
 */

import React from 'react'
import type { ButtonProps } from '../../types/index'
import './Button.css'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  ariaLabel,
  className = '',
}: ButtonProps & { type?: 'button' | 'submit' | 'reset' }): React.JSX.Element {
  const baseClasses = `btn btn-${variant} btn-${size}`
  const classes = `${baseClasses} ${className}`.trim()

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  )
}
