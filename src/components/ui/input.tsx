import React from 'react'
import { cn } from '../../utils/cn'

export interface BaseInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: string
  helperText?: string
}

export type InputProps = BaseInputProps

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, leftIcon, rightIcon, error, helperText, ...props }, ref) => {
    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <label className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{label}</label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">{leftIcon}</span>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full brutalist-input pl-10 pr-10',
              leftIcon ? 'pl-10' : 'pl-3',
              rightIcon ? 'pr-10' : 'pr-3',
              error ? 'border-danger-500' : undefined
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">{rightIcon}</span>
          )}
        </div>
        {error && <p className="text-sm text-danger-600" role="alert">{error}</p>}
        {!error && helperText && <p className="text-sm text-neutral-500">{helperText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, ...props }, ref) => (
    <div className={cn('space-y-2', className)}>
      {label && <label className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{label}</label>}
      <textarea ref={ref} className="w-full brutalist-input" {...props} />
    </div>
  )
)

Textarea.displayName = 'Textarea'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, children, ...props }, ref) => (
    <div className={cn('space-y-2', className)}>
      {label && <label className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{label}</label>}
      <select ref={ref} className="w-full brutalist-input" {...props}>
        {children}
      </select>
    </div>
  )
)

Select.displayName = 'Select'