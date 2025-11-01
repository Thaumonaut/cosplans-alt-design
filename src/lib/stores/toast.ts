import { writable } from 'svelte/store'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

function createToastStore() {
  const { subscribe, update, set } = writable<Toast[]>([])

  function add(toast: Omit<Toast, 'id'>) {
    const id = `toast-${Date.now()}-${Math.random()}`
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    }

    update((toasts) => [...toasts, newToast])

    // Auto remove after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        remove(id)
      }, newToast.duration)
    }

    return id
  }

  function remove(id: string) {
    update((toasts) => toasts.filter((t) => t.id !== id))
  }

  function clear() {
    set([])
  }

  return {
    subscribe,
    add,
    remove,
    clear,
    success: (title: string, description?: string) => add({ type: 'success', title, description }),
    error: (title: string, description?: string) => add({ type: 'error', title, description }),
    info: (title: string, description?: string) => add({ type: 'info', title, description }),
    warning: (title: string, description?: string) => add({ type: 'warning', title, description }),
  }
}

export const toast = createToastStore()

