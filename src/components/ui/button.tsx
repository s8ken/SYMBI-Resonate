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
      primary: 'bg-black text-white hover:bg-neutral-900',
      secondary: 'bg-white text-black border border-neutral-200 hover:bg-neutral-100',
      ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800',
      danger: 'bg-red-600 text-white hover:bg-red-700',
    }

    const sizes: Record<string, string> = {
      sm: 'px-2.5 py-1.5 text-sm rounded-lg',
      md: 'px-3.5 py-2.5 text-sm rounded-lg',
      lg: 'px-5 py-3 text-base rounded-xl',
    }

    return (
      <button
        ref={ref}
        className={cn('inline-flex items-center gap-2 transition-all', variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          leftIcon
        )}
        <span className="truncate">{children}</span>
        {rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'