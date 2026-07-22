/**
 * Select Component
 * 
 * Features: label, options array, error state, aria attributes
 */

import React, { useId } from 'react'
import type { SelectProps } from '../../types/index'
import './Select.css'

export function Select({
  label,
  options,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  className = '',
}: SelectProps): React.JSX.Element {
  const generatedId = useId()
  const selectId = `select_${generatedId}`
  const errorId = error ? `${selectId}_error` : undefined

  return (
    <div className={`select-group ${className}`.trim()}>
      {label && (
        <label htmlFor={selectId} className="select-label">
          {label}
          {required && <span className="required-indicator">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`select ${error ? 'has-error' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={errorId}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <div id={errorId} className="select-error" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}
