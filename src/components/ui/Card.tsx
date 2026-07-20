/**
 * Card Component
 * 
 * Features: composable header/body/footer, hover state, clickable
 */

import React from 'react'
import type { CardProps } from '../../types/index'
import './Card.css'

export function Card({
  children,
  header,
  footer,
  onClick,
  hoverable = false,
  className = '',
}: CardProps): React.JSX.Element {
  const isClickable = onClick !== undefined

  return (
    <div
      className={`card ${hoverable ? 'card-hoverable' : ''} ${
        isClickable ? 'card-clickable' : ''
      } ${className}`.trim()}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  )
}
