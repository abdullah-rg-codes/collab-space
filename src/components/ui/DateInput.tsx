import type { UIComponentProps } from '../../types'
import './DateInput.css'

interface DateInputProps extends UIComponentProps {
  label?: string
  value: string // ISO format YYYY-MM-DD
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  required?: boolean
}

function DateInput({ label, value, onChange, error, disabled, required, className }: DateInputProps) {
  return (
    <div className={`date-input-container ${className || ''}`}>
      {label && (
        <label className="date-input-label">
          {label}
          {required && <span className="date-input-required">*</span>}
        </label>
      )}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`date-input ${error ? 'date-input-error' : ''}`}
        required={required}
      />
      {error && <span className="date-input-error-message">{error}</span>}
    </div>
  )
}

export default DateInput
