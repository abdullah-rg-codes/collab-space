/**
 * TextInput Component
 * 
 * Features: label, error state, aria attributes, placeholder
 */

import React from 'react'
import type { TextInputProps } from '../../types/index'
import './TextInput.css'

export function TextInput({
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  type = 'text',
  required = false,
  className = '',
}: TextInputProps & { type?: string }): React.JSX.Element {
  const inputId = `input_${Math.random().toString(36).substr(2, 9)}`
  const errorId = error ? `${inputId}_error` : undefined

  return (
    <div className={`text-input-group ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="text-input-label">
          {label}
          {required && <span className="required-indicator">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={`text-input ${error ? 'has-error' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={errorId}
      />
      {error && (
        <div id={errorId} className="text-input-error" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}
