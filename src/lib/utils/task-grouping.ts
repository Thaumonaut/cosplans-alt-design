/**
 * Task Grouping Utilities
 * Feature: 003-modern-task-ui
 * Purpose: Group tasks by different dimensions for views
 */

import type { Task, GroupingOption } from '$lib/types/domain/task'

export interface TaskGroup {
  key: string
  label: string
  tasks: Task[]
}

/**
 * Group tasks by a specific dimension
 * Returns an array of TaskGroup objects sorted by key
 */
export function groupTasks(
  tasks: Task[],
  grouping: GroupingOption
): TaskGroup[] {
  const groups = new Map<string, Task[]>()
  const labels = new Map<string, string>()

  switch (grouping) {
    case 'stage':
      tasks.forEach(task => {
        const key = task.stageId
        const group = groups.get(key) || []
        group.push(task)
        groups.set(key, group)
        // Label will be set from stage name in component
        if (!labels.has(key)) {
          labels.set(key, `Stage ${key.substring(0, 8)}`)
        }
      })
      break

    case 'priority':
      tasks.forEach(task => {
        const key = task.priority
        const group = groups.get(key) || []
        group.push(task)
        groups.set(key, group)
        labels.set(key, key.charAt(0).toUpperCase() + key.slice(1))
      })
      break

    case 'project':
      tasks.forEach(task => {
        const key = task.projectId || 'standalone'
        const group = groups.get(key) || []
        group.push(task)
        groups.set(key, group)
        if (!labels.has(key)) {
          labels.set(key, key === 'standalone' ? 'Standalone Tasks' : `Project ${key.substring(0, 8)}`)
        }
      })
      break

    case 'assignee':
      tasks.forEach(task => {
        const key = task.assignedTo || 'unassigned'
        const group = groups.get(key) || []
        group.push(task)
        groups.set(key, group)
        if (!labels.has(key)) {
          labels.set(key, key === 'unassigned' ? 'Unassigned' : `User ${key.substring(0, 8)}`)
        }
      })
      break

    case 'dueDate':
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const weekFromNow = new Date(today)
      weekFromNow.setDate(weekFromNow.getDate() + 7)

      const monthFromNow = new Date(today)
      monthFromNow.setDate(monthFromNow.getDate() + 30)

      tasks.forEach(task => {
        let key = 'no-date'
        let label = 'No Date'

        if (task.dueDate) {
          const dueDate = new Date(task.dueDate)
          dueDate.setHours(0, 0, 0, 0)

          if (dueDate < today) {
            key = 'overdue'
            label = 'Overdue'
          } else if (dueDate.getTime() === today.getTime()) {
            key = 'today'
            label = 'Today'
          } else if (dueDate.getTime() === tomorrow.getTime()) {
            key = 'tomorrow'
            label = 'Tomorrow'
          } else if (dueDate <= weekFromNow) {
            key = 'this-week'
            label = 'This Week'
          } else if (dueDate <= monthFromNow) {
            key = 'this-month'
            label = 'This Month'
          } else {
            key = 'later'
            label = 'Later'
          }
        }

        const group = groups.get(key) || []
        group.push(task)
        groups.set(key, group)
        labels.set(key, label)
      })
      break
  }

  // Convert to array and sort
  const result: TaskGroup[] = Array.from(groups.entries()).map(([key, tasks]) => ({
    key,
    label: labels.get(key) || key,
    tasks
  }))

  // Sort groups by key (custom order for dueDate)
  if (grouping === 'dueDate') {
    const order = ['overdue', 'today', 'tomorrow', 'this-week', 'this-month', 'later', 'no-date']
    result.sort((a, b) => {
      const aIndex = order.indexOf(a.key)
      const bIndex = order.indexOf(b.key)
      if (aIndex === -1 && bIndex === -1) return a.key.localeCompare(b.key)
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    })
  } else {
    result.sort((a, b) => a.key.localeCompare(b.key))
  }

  return result
}

/**
 * Get group label for a specific grouping and key
 */
export function getGroupLabel(grouping: GroupingOption, key: string): string {
  switch (grouping) {
    case 'priority':
      return key.charAt(0).toUpperCase() + key.slice(1)
    case 'assignee':
      return key === 'unassigned' ? 'Unassigned' : `User ${key.substring(0, 8)}`
    case 'project':
      return key === 'standalone' ? 'Standalone Tasks' : `Project ${key.substring(0, 8)}`
    case 'dueDate':
      const labels: Record<string, string> = {
        'overdue': 'Overdue',
        'today': 'Today',
        'tomorrow': 'Tomorrow',
        'this-week': 'This Week',
        'this-month': 'This Month',
        'later': 'Later',
        'no-date': 'No Date'
      }
      return labels[key] || key
    case 'stage':
      return `Stage ${key.substring(0, 8)}`
    default:
      return key
  }
}

/**
 * Count tasks in each group
 */
export function countTasksByGroup(
  tasks: Task[],
  grouping: GroupingOption
): Map<string, number> {
  const groups = groupTasks(tasks, grouping)
  const counts = new Map<string, number>()
  
  groups.forEach(group => {
    counts.set(group.key, group.tasks.length)
  })
  
  return counts
}

