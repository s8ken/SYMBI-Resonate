import type { ReactNode } from 'react'

export interface ModalProps {
  open?: boolean
  onClose?: () => void
  title?: string
  children?: ReactNode
}

export interface ModalFooterProps {
  children?: ReactNode
}

export function Modal({ children }: ModalProps) {
  return <div role="dialog">{children}</div>
}

export function ModalFooter({ children }: ModalFooterProps) {
  return <div role="contentinfo">{children}</div>
}
