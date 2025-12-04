import React from 'react'
import { cn } from '../../utils/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, ...props }, ref) => {
    const variants: Record<string, string> = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700',
      secondary: 'bg-secondary-600 text-white hover:bg-secondary-700',
      ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800',
      danger: 'bg-danger-600 text-white hover:bg-danger-700',
    }

    const sizes: Record<string, string> = {
      sm: 'px-3 py-1.5 text-sm rounded-lg',
      md: 'px-4 py-2 text-sm rounded-lg',
      lg: 'px-6 py-3 text-base rounded-xl',
    }

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center gap-2 transition-all',
          variants[variant],
          sizes[size],
          (isLoading || props.disabled) ? 'opacity-70 cursor-not-allowed' : undefined,
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          leftIcon
        )}
        <span className={cn('truncate', variants[variant], sizes[size])}>{children}</span>
        {rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'