import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type Toast = { id: string; title: string; description?: string }

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const value = useMemo<ToastContextValue>(() => ({
    toasts,
    addToast: (toast) => setToasts((current) => [...current, { ...toast, id: crypto.randomUUID() }]),
    removeToast: (id) => setToasts((current) => current.filter((t) => t.id !== id)),
  }), [toasts])

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
