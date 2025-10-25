import { writable } from 'svelte/store'
import { browser } from '$app/environment'
import type { Theme } from '$types'

// Initialize theme from localStorage or default to system
function createThemeStore() {
  const defaultTheme: Theme = { mode: 'system' }
  
  const { subscribe, set, update } = writable<Theme>(defaultTheme)

  return {
    subscribe,
    set,
    update,
    init: () => {
      if (browser) {
        const stored = localStorage.getItem('theme')
        if (stored) {
          try {
            const theme = JSON.parse(stored) as Theme
            set(theme)
            applyTheme(theme.mode)
          } catch {
            // Invalid stored theme, use default
            set(defaultTheme)
          }
        } else {
          applyTheme(defaultTheme.mode)
        }
      }
    }
  }
}

export const theme = createThemeStore()

// Apply theme to document
function applyTheme(mode: Theme['mode']) {
  if (!browser) return

  const root = document.documentElement
  
  if (mode === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
  } else {
    root.classList.toggle('dark', mode === 'dark')
  }
}

// Theme actions
export function setTheme(newTheme: Theme) {
  theme.set(newTheme)
  if (browser) {
    localStorage.setItem('theme', JSON.stringify(newTheme))
    applyTheme(newTheme.mode)
  }
}

export function toggleTheme() {
  theme.update(currentTheme => {
    const newMode: Theme['mode'] = currentTheme.mode === 'light' ? 'dark' : 'light'
    const newTheme: Theme = { mode: newMode }
    
    if (browser) {
      localStorage.setItem('theme', JSON.stringify(newTheme))
      applyTheme(newMode)
    }
    
    return newTheme
  })
}

// Listen for system theme changes
if (browser) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    theme.update(currentTheme => {
      if (currentTheme.mode === 'system') {
        applyTheme('system')
      }
      return currentTheme
    })
  })
}