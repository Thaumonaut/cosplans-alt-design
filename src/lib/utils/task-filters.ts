/**
 * Task Filter Utilities
 * Feature: 003-modern-task-ui
 * Purpose: Client-side task filtering logic
 */

import type { Task, SavedTaskViewFilters } from '$lib/types/domain/task'

/**
 * Apply filters to a list of tasks
 * Returns filtered array based on all active filter criteria
 */
export function applyFilters(tasks: Task[], filters: SavedTaskViewFilters): Task[] {
  let filtered = [...tasks]

  // Filter by stages
  if (filters.stages && filters.stages.length > 0) {
    filtered = filtered.filter(task => filters.stages!.includes(task.stageId))
  }

  // Filter by priorities
  if (filters.priorities && filters.priorities.length > 0) {
    filtered = filtered.filter(task => filters.priorities!.includes(task.priority))
  }

  // Filter by assignees
  if (filters.assignees && filters.assignees.length > 0) {
    filtered = filtered.filter(task => {
      if (!task.assignedTo) return false
      return filters.assignees!.includes(task.assignedTo)
    })
  }

  // Filter by projects
  if (filters.projects && filters.projects.length > 0) {
    filtered = filtered.filter(task => {
      if (!task.projectId) return false
      return filters.projects!.includes(task.projectId)
    })
  }

  // Filter by date range
  if (filters.dateRange) {
    const startDate = new Date(filters.dateRange.start)
    const endDate = new Date(filters.dateRange.end)

    filtered = filtered.filter(task => {
      if (!task.dueDate) return false
      const dueDate = new Date(task.dueDate)
      return dueDate >= startDate && dueDate <= endDate
    })
  }

  // Filter by tags (when tags are implemented)
  if (filters.tags && filters.tags.length > 0) {
    // TODO: Implement when task tags are added to schema
    // filtered = filtered.filter(task => {
    //   if (!task.tags) return false
    //   return task.tags.some(tag => filters.tags!.includes(tag))
    // })
  }

  return filtered
}

/**
 * Search tasks by title and description
 */
export function searchTasks(tasks: Task[], searchQuery: string): Task[] {
  if (!searchQuery || searchQuery.trim() === '') {
    return tasks
  }

  const query = searchQuery.toLowerCase().trim()

  return tasks.filter(task => {
    const titleMatch = task.title.toLowerCase().includes(query)
    const descriptionMatch = task.description?.toLowerCase().includes(query) || false
    return titleMatch || descriptionMatch
  })
}

/**
 * Group tasks by a specific dimension
 */
export function groupTasks(
  tasks: Task[],
  groupBy: 'stage' | 'priority' | 'project' | 'assignee' | 'dueDate'
): Map<string, Task[]> {
  const groups = new Map<string, Task[]>()

  switch (groupBy) {
    case 'stage':
      tasks.forEach(task => {
        const key = task.stageId
        const group = groups.get(key) || []
        group.push(task)
        groups.set(key, group)
      })
      break

    case 'priority':
      tasks.forEach(task => {
        const key = task.priority
        const group = groups.get(key) || []
        group.push(task)
        groups.set(key, group)
      })
      break

    case 'project':
      tasks.forEach(task => {
        const key = task.projectId || 'standalone'
        const group = groups.get(key) || []
        group.push(task)
        groups.set(key, group)
      })
      break

    case 'assignee':
      tasks.forEach(task => {
        const key = task.assignedTo || 'unassigned'
        const group = groups.get(key) || []
        group.push(task)
        groups.set(key, group)
      })
      break

    case 'dueDate':
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const weekFromNow = new Date(today)
      weekFromNow.setDate(weekFromNow.getDate() + 7)

      tasks.forEach(task => {
        let key = 'no-date'

        if (task.dueDate) {
          const dueDate = new Date(task.dueDate)
          dueDate.setHours(0, 0, 0, 0)

          if (dueDate < today) {
            key = 'overdue'
          } else if (dueDate.getTime() === today.getTime()) {
            key = 'today'
          } else if (dueDate.getTime() === tomorrow.getTime()) {
            key = 'tomorrow'
          } else if (dueDate <= weekFromNow) {
            key = 'this-week'
          } else {
            key = 'later'
          }
        }

        const group = groups.get(key) || []
        group.push(task)
        groups.set(key, group)
      })
      break
  }

  return groups
}

/**
 * Sort tasks by a specific field
 */
export function sortTasks(
  tasks: Task[],
  sortBy: 'createdAt' | 'updatedAt' | 'dueDate' | 'title' | 'priority',
  order: 'asc' | 'desc' = 'desc'
): Task[] {
  const sorted = [...tasks]

  const priorityOrder = { high: 3, medium: 2, low: 1 }

  sorted.sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        break
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) comparison = 0
        else if (!a.dueDate) comparison = 1
        else if (!b.dueDate) comparison = -1
        else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        break
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'priority':
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
        break
    }

    return order === 'asc' ? comparison : -comparison
  })

  return sorted
}

/**
 * Check if task is overdue
 */
export function isOverdue(task: Task): boolean {
  if (!task.dueDate) return false
  const dueDate = new Date(task.dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return dueDate < today && !task.completed
}

/**
 * Get tasks due in a specific time range
 */
export function getTasksDueIn(tasks: Task[], days: number): Task[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const targetDate = new Date(today)
  targetDate.setDate(targetDate.getDate() + days)

  return tasks.filter(task => {
    if (!task.dueDate) return false
    const dueDate = new Date(task.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate >= today && dueDate <= targetDate && !task.completed
  })
}

/**
 * Calculate filter match count for display
 */
export function countFilterMatches(tasks: Task[], filters: SavedTaskViewFilters): number {
  return applyFilters(tasks, filters).length
}

/**
 * Check if any filters are active
 */
export function hasActiveFilters(filters: SavedTaskViewFilters): boolean {
  return (
    (filters.stages?.length ?? 0) > 0 ||
    (filters.priorities?.length ?? 0) > 0 ||
    (filters.assignees?.length ?? 0) > 0 ||
    (filters.projects?.length ?? 0) > 0 ||
    filters.dateRange !== undefined ||
    (filters.tags?.length ?? 0) > 0
  )
}

