'use client'
import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const ToastProvider = ToastPrimitive.Provider
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn('fixed bottom-4 right-4 z-[100] flex max-h-screen w-full max-w-[380px] flex-col gap-2', className)}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitive.Viewport.displayName

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & { variant?: 'default' | 'success' | 'destructive' }
>(({ className, variant = 'default', ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(
      'group pointer-events-auto relative flex w-full items-center justify-between space-x-3 overflow-hidden rounded-xl border p-4 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-5',
      variant === 'destructive' && 'border-red-500/30 bg-red-950/90 text-red-200',
      variant === 'success' && 'border-green-500/30 bg-green-950/90 text-green-200',
      variant === 'default' && 'border-[#333] bg-[#111] text-white',
      className
    )}
    {...props}
  />
))
Toast.displayName = ToastPrimitive.Root.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn('rounded-lg p-1 text-gray-400 hover:text-white transition-colors', className)}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitive.Close>
))
ToastClose.displayName = ToastPrimitive.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
))
ToastTitle.displayName = ToastPrimitive.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description ref={ref} className={cn('text-xs opacity-80', className)} {...props} />
))
ToastDescription.displayName = ToastPrimitive.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>
type ToastActionElement = React.ReactElement<typeof ToastPrimitive.Action>

// Simple toast state
interface ToastItem {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'destructive'
  open: boolean
}

const toastState: ToastItem[] = []
let listeners: Array<(toasts: ToastItem[]) => void> = []

function notifyListeners() {
  const copy = [...toastState]
  listeners.forEach((l) => l(copy))
}

export function toast(options: Omit<ToastItem, 'id' | 'open'>) {
  const id = Math.random().toString(36).slice(2)
  toastState.push({ ...options, id, open: true })
  notifyListeners()
  setTimeout(() => {
    const idx = toastState.findIndex((t) => t.id === id)
    if (idx !== -1) {
      toastState[idx].open = false
      notifyListeners()
      setTimeout(() => {
        const i = toastState.findIndex((t) => t.id === id)
        if (i !== -1) toastState.splice(i, 1)
        notifyListeners()
      }, 300)
    }
  }, 4000)
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  React.useEffect(() => {
    listeners.push(setToasts)
    return () => { listeners = listeners.filter((l) => l !== setToasts) }
  }, [])

  return (
    <ToastProvider>
      {toasts.map((t) => (
        <Toast key={t.id} open={t.open} variant={t.variant}>
          <div className="flex-1">
            {t.title && <ToastTitle>{t.title}</ToastTitle>}
            {t.description && <ToastDescription>{t.description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}

export type { ToastProps, ToastActionElement }
