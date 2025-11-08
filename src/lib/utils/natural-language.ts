/**
 * Natural Language Parsing Utilities
 * Feature: 003-modern-task-ui
 * Purpose: Parse task creation input for quick task creation
 */

import type { TaskPriority } from '$lib/types/domain/task'

export interface ParsedTaskInput {
  title: string
  projectMention?: string // Project name mentioned with "for"
  dueDate?: string // ISO date string
  priority?: TaskPriority
  tags?: string[]
}

/**
 * Parse natural language task input
 * Examples:
 * - "buy fabric for Cosplay X by Friday #high"
 * - "finish sewing @tomorrow #medium"
 * - "pack convention gear by 2025-11-10 #urgent"
 */
export function parseTaskInput(input: string): ParsedTaskInput {
  let title = input.trim()
  const result: ParsedTaskInput = { title }

  // Extract priority from hashtags (#high, #medium, #low, #urgent)
  const priorityMatch = title.match(/#(high|medium|low|urgent|important)/i)
  if (priorityMatch) {
    const priorityText = priorityMatch[1].toLowerCase()
    if (priorityText === 'urgent' || priorityText === 'important') {
      result.priority = 'high'
    } else if (priorityText === 'high') {
      result.priority = 'high'
    } else if (priorityText === 'medium') {
      result.priority = 'medium'
    } else if (priorityText === 'low') {
      result.priority = 'low'
    }
    // Remove priority from title
    title = title.replace(priorityMatch[0], '').trim()
  }

  // Extract project mention (for ProjectName, for "Project Name")
  const projectMatch = title.match(/for\s+(?:"([^"]+)"|'([^']+)'|(\S+))/i)
  if (projectMatch) {
    result.projectMention = projectMatch[1] || projectMatch[2] || projectMatch[3]
    // Remove project mention from title
    title = title.replace(projectMatch[0], '').trim()
  }

  // Extract due date from various formats
  const dueDate = extractDueDate(title)
  if (dueDate) {
    result.dueDate = dueDate.dateString
    // Remove due date text from title
    title = title.replace(dueDate.matchedText, '').trim()
  }

  // Extract tags (any #word that wasn't priority)
  const tagMatches = title.matchAll(/#(\w+)/g)
  const tags: string[] = []
  for (const match of tagMatches) {
    const tag = match[1].toLowerCase()
    if (tag !== 'high' && tag !== 'medium' && tag !== 'low' && tag !== 'urgent' && tag !== 'important') {
      tags.push(tag)
    }
  }
  if (tags.length > 0) {
    result.tags = tags
    // Remove tags from title
    title = title.replace(/#(\w+)/g, '').trim()
  }

  // Clean up extra spaces and "by" keyword
  title = title.replace(/\s+by\s+/i, ' ').replace(/\s+/g, ' ').trim()

  result.title = title

  return result
}

/**
 * Extract due date from text
 * Supports: @tomorrow, @today, by Friday, by 2025-11-10, etc.
 */
function extractDueDate(text: string): { dateString: string; matchedText: string } | null {
  // @tomorrow
  if (/@tomorrow/i.test(text)) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return {
      dateString: tomorrow.toISOString().split('T')[0],
      matchedText: text.match(/@tomorrow/i)![0]
    }
  }

  // @today
  if (/@today/i.test(text)) {
    const today = new Date()
    return {
      dateString: today.toISOString().split('T')[0],
      matchedText: text.match(/@today/i)![0]
    }
  }

  // ISO date format: YYYY-MM-DD
  const isoDateMatch = text.match(/(\d{4}-\d{2}-\d{2})/);
  if (isoDateMatch) {
    return {
      dateString: isoDateMatch[1],
      matchedText: isoDateMatch[1]
    }
  }

  // Day names (by Monday, by Friday, etc.)
  const dayMatch = text.match(/by\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i)
  if (dayMatch) {
    const dayName = dayMatch[1].toLowerCase()
    const targetDate = getNextDayOfWeek(dayName)
    return {
      dateString: targetDate.toISOString().split('T')[0],
      matchedText: dayMatch[0]
    }
  }

  // Relative dates (in 3 days, in 1 week)
  const relativeMatch = text.match(/in\s+(\d+)\s+(day|days|week|weeks)/i)
  if (relativeMatch) {
    const amount = parseInt(relativeMatch[1])
    const unit = relativeMatch[2].toLowerCase()
    const targetDate = new Date()
    
    if (unit.startsWith('day')) {
      targetDate.setDate(targetDate.getDate() + amount)
    } else if (unit.startsWith('week')) {
      targetDate.setDate(targetDate.getDate() + (amount * 7))
    }
    
    return {
      dateString: targetDate.toISOString().split('T')[0],
      matchedText: relativeMatch[0]
    }
  }

  return null
}

/**
 * Get next occurrence of a day of the week
 */
function getNextDayOfWeek(dayName: string): Date {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const targetDay = days.indexOf(dayName.toLowerCase())
  
  if (targetDay === -1) {
    return new Date() // Invalid day name, return today
  }

  const today = new Date()
  const currentDay = today.getDay()
  
  let daysUntilTarget = targetDay - currentDay
  if (daysUntilTarget <= 0) {
    daysUntilTarget += 7 // Next week
  }

  const targetDate = new Date(today)
  targetDate.setDate(targetDate.getDate() + daysUntilTarget)
  
  return targetDate
}

/**
 * Suggest task title based on project context
 */
export function suggestTaskTitle(projectName?: string, context?: string): string {
  if (!projectName && !context) {
    return 'New Task'
  }

  if (projectName && context) {
    return `${context} for ${projectName}`
  }

  if (projectName) {
    return `Task for ${projectName}`
  }

  return context || 'New Task'
}

/**
 * Parse @mentions from text (returns user IDs or names)
 */
export function extractMentions(text: string): string[] {
  const mentions: string[] = []
  
  // Pattern: @username or @[Display Name](userId)
  const simplePattern = /@(\w+)/g
  let match
  
  while ((match = simplePattern.exec(text)) !== null) {
    mentions.push(match[1])
  }

  // Markdown-style mentions with IDs
  const markdownPattern = /@\[([^\]]+)\]\(([^)]+)\)/g
  while ((match = markdownPattern.exec(text)) !== null) {
    mentions.push(match[2]) // Use the ID, not the display name
  }

  return mentions
}

/**
 * Format parsed task for display
 */
export function formatParsedTask(parsed: ParsedTaskInput): string {
  let formatted = `Title: "${parsed.title}"`

  if (parsed.priority) {
    formatted += `\nPriority: ${parsed.priority}`
  }

  if (parsed.projectMention) {
    formatted += `\nProject: ${parsed.projectMention}`
  }

  if (parsed.dueDate) {
    formatted += `\nDue: ${formatDate(parsed.dueDate)}`
  }

  if (parsed.tags && parsed.tags.length > 0) {
    formatted += `\nTags: ${parsed.tags.join(', ')}`
  }

  return formatted
}

/**
 * Format date for display
 */
function formatDate(isoDate: string): string {
  const date = new Date(isoDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dateOnly = new Date(date)
  dateOnly.setHours(0, 0, 0, 0)

  const diffDays = Math.floor((dateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`

  return date.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric', 
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
  })
}

