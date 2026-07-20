/**
 * TextArea Component
 * 
 * Features: label, error state, aria attributes, rows
 */

import React from 'react'
import type { TextInputProps } from '../../types/index'
import './TextArea.css'

interface TextAreaProps extends Omit<TextInputProps, 'type'> {
  rows?: number
}

export function TextArea({
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  rows = 4,
  className = '',
}: TextAreaProps): React.JSX.Element {
  const textareaId = `textarea_${Math.random().toString(36).substr(2, 9)}`
  const errorId = error ? `${textareaId}_error` : undefined

  return (
    <div className={`textarea-group ${className}`.trim()}>
      {label && (
        <label htmlFor={textareaId} className="textarea-label">
          {label}
          {required && <span className="required-indicator">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`textarea ${error ? 'has-error' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        rows={rows}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={errorId}
      />
      {error && (
        <div id={errorId} className="textarea-error" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}
