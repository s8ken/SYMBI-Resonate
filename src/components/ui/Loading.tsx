import React from 'react'
import { cn } from '../../utils/cn'

export interface LoadingSpinnerProps { className?: string; size?: number }
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className, size = 20 }) => (
  <div style={{ width: size, height: size }} className={cn('inline-block border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin', className)} />
)

export interface SkeletonProps { className?: string }
export const Skeleton: React.FC<SkeletonProps> = ({ className }) => (
  <div className={cn('animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded', className)} />
)

export interface LoadingStateProps { title?: string; description?: string }
export const LoadingState: React.FC<LoadingStateProps> = ({ title = 'Loading...', description }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <LoadingSpinner size={24} />
    <p className="mt-3 text-sm text-neutral-700 dark:text-neutral-300">{title}</p>
    {description && <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{description}</p>}
  </div>
)

export interface EmptyStateProps { title?: string; description?: string }
export const EmptyState: React.FC<EmptyStateProps> = ({ title = 'No data', description }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <p className="text-sm text-neutral-700 dark:text-neutral-300">{title}</p>
    {description && <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{description}</p>}
  </div>
)