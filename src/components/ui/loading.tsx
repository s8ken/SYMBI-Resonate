import type { ReactNode } from 'react'

export interface LoadingSpinnerProps { label?: string }
export function LoadingSpinner({ label }: LoadingSpinnerProps) {
  return <div role="status">{label || 'Loading...'}</div>
}

export interface SkeletonProps { width?: string | number; height?: string | number }
export function Skeleton({ width = '100%', height = '1rem' }: SkeletonProps) {
  return <div style={{ width, height }} aria-busy="true" />
}

export interface LoadingStateProps { message?: string; children?: ReactNode }
export function LoadingState({ message, children }: LoadingStateProps) {
  return <div>{message || 'Loading'}{children}</div>
}

export interface EmptyStateProps { title?: string; description?: string; action?: ReactNode }
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div>
      <h3>{title || 'Nothing here yet'}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}
