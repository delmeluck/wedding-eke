'use client'

import * as Toast from '@radix-ui/react-toast'
import { createContext, useContext, useState, useCallback } from 'react'
import { X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  title: string
  description?: string
  type: ToastType
}

interface ToastContextValue {
  toast: (opts: { title: string; description?: string; type?: ToastType }) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback(({ title, description, type = 'info' }: {
    title: string; description?: string; type?: ToastType
  }) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, title, description, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const colors: Record<ToastType, string> = {
    success: 'border-l-4 border-green-500',
    error:   'border-l-4 border-red-500',
    info:    'border-l-4 border-purple-500',
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      <Toast.Provider swipeDirection="right">
        {toasts.map(t => (
          <Toast.Root
            key={t.id}
            className={`bg-white rounded-xl shadow-lg p-4 flex items-start gap-3 ${colors[t.type]} max-w-sm`}
            open
          >
            <div className="flex-1">
              <Toast.Title className="font-semibold text-earth-900 text-sm">{t.title}</Toast.Title>
              {t.description && (
                <Toast.Description className="text-earth-600 text-xs mt-1">{t.description}</Toast.Description>
              )}
            </div>
            <Toast.Close asChild>
              <button className="text-earth-400 hover:text-earth-700">
                <X size={14} />
              </button>
            </Toast.Close>
          </Toast.Root>
        ))}
        <Toast.Viewport className="fixed bottom-4 right-4 flex flex-col gap-2 z-50 w-80" />
      </Toast.Provider>
    </ToastContext.Provider>
  )
}
