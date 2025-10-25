import { writable } from 'svelte/store'
import { browser } from '$app/environment'
import type { AppSettings } from '$types'

// Initialize settings from localStorage or defaults
function createSettingsStore() {
  const defaultSettings: AppSettings = {
    theme: { mode: 'system' },
    notifications: true,
    autoSave: true
  }
  
  const { subscribe, set, update } = writable<AppSettings>(defaultSettings)

  return {
    subscribe,
    set,
    update,
    init: () => {
      if (browser) {
        const stored = localStorage.getItem('appSettings')
        if (stored) {
          try {
            const settings = JSON.parse(stored) as AppSettings
            set(settings)
          } catch {
            // Invalid stored settings, use defaults
            set(defaultSettings)
          }
        }
      }
    }
  }
}

export const appSettings = createSettingsStore()

// Settings actions
export function updateSettings(updates: Partial<AppSettings>) {
  appSettings.update(currentSettings => {
    const newSettings = { ...currentSettings, ...updates }
    
    if (browser) {
      localStorage.setItem('appSettings', JSON.stringify(newSettings))
    }
    
    return newSettings
  })
}

export function resetSettings() {
  const defaultSettings: AppSettings = {
    theme: { mode: 'system' },
    notifications: true,
    autoSave: true
  }
  
  appSettings.set(defaultSettings)
  
  if (browser) {
    localStorage.setItem('appSettings', JSON.stringify(defaultSettings))
  }
}