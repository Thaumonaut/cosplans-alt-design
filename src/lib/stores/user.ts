import { writable } from 'svelte/store'
import type { User } from '$types'

// User store
export const user = writable<User | null>(null)

// User actions
export function setUser(userData: User) {
  user.set(userData)
}

export function clearUser() {
  user.set(null)
}

export function updateUser(updates: Partial<User>) {
  user.update(currentUser => 
    currentUser ? { ...currentUser, ...updates } : null
  )
}