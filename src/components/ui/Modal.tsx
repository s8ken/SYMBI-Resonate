import React from 'react'
import { cn } from '../../utils/cn'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  className?: string
  children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, className, children }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative min-h-full flex items-start justify-center p-4">
        <div className={cn('w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800', className)}>
          {children}
        </div>
      </div>
    </div>
  )
}

export interface ModalFooterProps { className?: string; children?: React.ReactNode }
export const ModalFooter: React.FC<ModalFooterProps> = ({ className, children }) => (
  <div className={cn('flex items-center justify-end gap-2 p-3 border-t border-neutral-200 dark:border-neutral-800', className)}>
    {children}
  </div>
)