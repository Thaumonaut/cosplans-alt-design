/**
 * Notifications Store
 * Feature: 003-modern-task-ui
 * Purpose: Manage in-app task notifications
 */

import { writable, derived } from 'svelte/store'
import { browser } from '$app/environment'
import type { TaskNotification } from '$lib/types/domain/task'

// Main notifications store
export const notifications = writable<TaskNotification[]>([])

// Loading and error states
export const notificationsLoading = writable(false)
export const notificationsError = writable<string | null>(null)

// Notification center open/closed state
export const notificationCenterOpen = writable(false)

// Derived store: Unread notifications
export const unreadNotifications = derived(
  notifications,
  $notifications => $notifications.filter(n => !n.read)
)

// Derived store: Unread count (for badge)
export const unreadCount = derived(
  unreadNotifications,
  $unread => $unread.length
)

// Derived store: Notifications by type
export const notificationsByType = derived(
  notifications,
  $notifications => ({
    assignment: $notifications.filter(n => n.eventType === 'assignment'),
    mention: $notifications.filter(n => n.eventType === 'mention'),
    comment: $notifications.filter(n => n.eventType === 'comment'),
    statusChange: $notifications.filter(n => n.eventType === 'status_change'),
  })
)

// Derived store: Recent notifications (last 50)
export const recentNotifications = derived(
  notifications,
  $notifications => $notifications.slice(0, 50)
)

// Utility functions for managing notifications
export function addNotification(notification: TaskNotification) {
  notifications.update(current => [notification, ...current])
}

export function markAsRead(notificationId: string) {
  notifications.update(current =>
    current.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    )
  )
}

export function markAllAsRead() {
  notifications.update(current =>
    current.map(n => ({ ...n, read: true }))
  )
}

export function deleteNotification(notificationId: string) {
  notifications.update(current =>
    current.filter(n => n.id !== notificationId)
  )
}

export function clearAllNotifications() {
  notifications.set([])
}

// Toggle notification center
export function openNotificationCenter() {
  notificationCenterOpen.set(true)
}

export function closeNotificationCenter() {
  notificationCenterOpen.set(false)
}

export function toggleNotificationCenter() {
  notificationCenterOpen.update(open => !open)
}

// Polling state for real-time updates
export const notificationPollingInterval = writable<number | null>(null)

// Start polling for new notifications (every 30 seconds)
export function startNotificationPolling(fetchFunction: () => Promise<void>) {
  if (!browser) return
  
  // Clear existing interval if any
  const currentInterval = notificationPollingInterval
  if (currentInterval) {
    clearInterval(currentInterval as unknown as number)
  }
  
  // Set up new interval
  const intervalId = setInterval(() => {
    fetchFunction().catch(error => {
      console.error('Failed to poll notifications:', error)
    })
  }, 30000) // 30 seconds
  
  notificationPollingInterval.set(intervalId as unknown as number)
}

// Stop polling
export function stopNotificationPolling() {
  const currentInterval = notificationPollingInterval
  if (currentInterval) {
    clearInterval(currentInterval as unknown as number)
    notificationPollingInterval.set(null)
  }
}

// Cleanup on unmount
if (browser) {
  // Stop polling when page is hidden/unloaded
  window.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopNotificationPolling()
    }
  })
  
  window.addEventListener('beforeunload', () => {
    stopNotificationPolling()
  })
}

