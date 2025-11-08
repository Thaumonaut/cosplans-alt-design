/**
 * User Task Stats Service
 * Feature: 003-modern-task-ui
 * Purpose: CRUD operations for user task completion statistics and streak tracking
 */

import { supabase } from '$lib/supabase'
import type { UserTaskStats, UserTaskStatsCreate, UserTaskStatsUpdate } from '$lib/types/domain/task'

// Map database row to UserTaskStats type (camelCase conversion)
function mapUserTaskStatsFromDb(row: any): UserTaskStats {
  return {
    id: row.id,
    userId: row.user_id,
    teamId: row.team_id,
    currentStreak: row.current_streak,
    bestStreak: row.best_streak,
    lastTaskCompletedAt: row.last_task_completed_at,
    streakPausedAt: row.streak_paused_at,
    tasksCompletedToday: row.tasks_completed_today,
    tasksCompletedTotal: row.tasks_completed_total,
    celebrationAnimationsEnabled: row.celebration_animations_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const userTaskStatsService = {
  /**
   * Get stats for current user and team
   * RLS policies automatically filter to current user's stats only
   */
  async get(teamId: string): Promise<UserTaskStats | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User must be authenticated')

    const { data, error } = await supabase
      .from('user_task_stats')
      .select('*')
      .eq('user_id', user.id)
      .eq('team_id', teamId)
      .maybeSingle()

    if (error) throw error
    return data ? mapUserTaskStatsFromDb(data) : null
  },

  /**
   * Get or create stats for current user and team
   * Creates default stats if none exist
   */
  async getOrCreate(teamId: string): Promise<UserTaskStats> {
    const existing = await this.get(teamId)
    if (existing) return existing

    // Create new stats record
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User must be authenticated')

    const { data, error } = await supabase
      .from('user_task_stats')
      .insert({
        user_id: user.id,
        team_id: teamId,
        current_streak: 0,
        best_streak: 0,
        tasks_completed_today: 0,
        tasks_completed_total: 0,
        celebration_animations_enabled: true,
      })
      .select()
      .single()

    if (error) throw error
    return mapUserTaskStatsFromDb(data)
  },

  /**
   * Update stats
   * RLS policies ensure user can only update their own stats
   */
  async update(teamId: string, updates: UserTaskStatsUpdate): Promise<UserTaskStats> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User must be authenticated')

    const updateData: Record<string, unknown> = {}
    if (updates.currentStreak !== undefined) updateData.current_streak = updates.currentStreak
    if (updates.bestStreak !== undefined) updateData.best_streak = updates.bestStreak
    if (updates.lastTaskCompletedAt !== undefined) updateData.last_task_completed_at = updates.lastTaskCompletedAt
    if (updates.streakPausedAt !== undefined) updateData.streak_paused_at = updates.streakPausedAt
    if (updates.tasksCompletedToday !== undefined) updateData.tasks_completed_today = updates.tasksCompletedToday
    if (updates.tasksCompletedTotal !== undefined) updateData.tasks_completed_total = updates.tasksCompletedTotal
    if (updates.celebrationAnimationsEnabled !== undefined) updateData.celebration_animations_enabled = updates.celebrationAnimationsEnabled

    const { data, error } = await supabase
      .from('user_task_stats')
      .update(updateData)
      .eq('user_id', user.id)
      .eq('team_id', teamId)
      .select()
      .single()

    if (error) throw error
    return mapUserTaskStatsFromDb(data)
  },

  /**
   * Increment task completion (called when task is completed)
   * Updates streak, completion counts, and last completion date
   */
  async incrementCompletion(teamId: string): Promise<UserTaskStats> {
    const stats = await this.getOrCreate(teamId)
    const now = new Date().toISOString()
    
    // Check if this is first completion today (for streak)
    const today = new Date().toISOString().split('T')[0]
    const lastCompletionDate = stats.lastTaskCompletedAt ? new Date(stats.lastTaskCompletedAt).toISOString().split('T')[0] : null
    const isFirstToday = lastCompletionDate !== today

    // Calculate new streak
    let newCurrentStreak = stats.currentStreak
    let newBestStreak = stats.bestStreak
    let newStreakPausedAt = stats.streakPausedAt

    if (isFirstToday) {
      // First completion today - check if we should increment streak
      if (lastCompletionDate) {
        const daysSince = Math.floor((new Date(today).getTime() - new Date(lastCompletionDate).getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysSince === 1) {
          // Consecutive day - increment streak
          newCurrentStreak = stats.currentStreak + 1
          newBestStreak = Math.max(stats.bestStreak, newCurrentStreak)
          newStreakPausedAt = null // Clear pause if streak continues
        } else if (daysSince === 2 && stats.streakPausedAt) {
          // Grace period - continue streak
          newCurrentStreak = stats.currentStreak + 1
          newBestStreak = Math.max(stats.bestStreak, newCurrentStreak)
          newStreakPausedAt = null
        } else if (daysSince > 2) {
          // Streak broken - reset
          newCurrentStreak = 1
          newBestStreak = Math.max(stats.bestStreak, 1)
          newStreakPausedAt = null
        } else if (daysSince === 0) {
          // Same day - just increment, don't change streak
        }
      } else {
        // First completion ever - start streak
        newCurrentStreak = 1
        newBestStreak = Math.max(stats.bestStreak, 1)
      }
    }

    return await this.update(teamId, {
      currentStreak: newCurrentStreak,
      bestStreak: newBestStreak,
      lastTaskCompletedAt: now,
      streakPausedAt: newStreakPausedAt,
      tasksCompletedToday: stats.tasksCompletedToday + 1,
      tasksCompletedTotal: stats.tasksCompletedTotal + 1,
    })
  },

  /**
   * Reset daily completion count (called at midnight)
   * This is typically handled by a cron job, but can be called manually
   */
  async resetDailyCount(teamId: string): Promise<UserTaskStats> {
    const stats = await this.getOrCreate(teamId)
    
    // Check if streak should be paused (no completions yesterday)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const lastCompletionDate = stats.lastTaskCompletedAt ? new Date(stats.lastTaskCompletedAt).toISOString().split('T')[0] : null
    
    let newStreakPausedAt = stats.streakPausedAt
    if (lastCompletionDate && lastCompletionDate < yesterdayStr && stats.tasksCompletedToday === 0) {
      // No completions yesterday - pause streak (1 day grace period)
      if (!stats.streakPausedAt) {
        newStreakPausedAt = new Date().toISOString()
      } else {
        // Already paused - check if we should break streak (2 consecutive days)
        const pauseDate = new Date(stats.streakPausedAt).toISOString().split('T')[0]
        const daysSincePause = Math.floor((new Date(yesterdayStr).getTime() - new Date(pauseDate).getTime()) / (1000 * 60 * 60 * 24))
        if (daysSincePause >= 2) {
          // Break streak after 2 days
          return await this.update(teamId, {
            currentStreak: 0,
            tasksCompletedToday: 0,
            streakPausedAt: null,
          })
        }
      }
    }

    return await this.update(teamId, {
      tasksCompletedToday: 0,
      streakPausedAt: newStreakPausedAt,
    })
  },
}

