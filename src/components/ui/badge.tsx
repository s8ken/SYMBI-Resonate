import React from 'react'
import { cn } from '../../utils/cn'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md'
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', size = 'md', children, ...props }) => {
  const variants: Record<string, string> = {
    default: 'bg-neutral-100 text-neutral-700',
    primary: 'bg-black text-white',
    secondary: 'bg-neutral-200 text-neutral-800',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
  }
  const sizes: Record<string, string> = {
    sm: 'text-xs px-2 py-0.5 rounded',
    md: 'text-sm px-2.5 py-1 rounded-lg',
  }
  return (
    <span className={cn('inline-flex items-center font-medium', variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  )
}

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {}
export const Tag: React.FC<TagProps> = ({ className, children, ...props }) => (
  <span className={cn('px-2 py-1 text-xs rounded-full bg-neutral-100 text-neutral-700', className)} {...props}>
    {children}
  </span>
)