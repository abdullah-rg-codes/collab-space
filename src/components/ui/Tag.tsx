/**
 * Tag/Badge Component
 * 
 * Features: color variants, removable, compact
 */

import React from 'react'
import type { TagProps } from '../../types/index'
import './Tag.css'

export function Tag({
  children,
  variant = 'default',
  onRemove,
  className = '',
}: TagProps): React.JSX.Element {
  return (
    <span className={`tag tag-${variant} ${className}`.trim()}>
      {children}
      {onRemove && (
        <button
          className="tag-remove"
          onClick={onRemove}
          aria-label={`Remove ${children}`}
          type="button"
        >
          ×
        </button>
      )}
    </span>
  )
}
