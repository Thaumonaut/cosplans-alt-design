/**
 * User Task Stats Service
 * 
 * Manages user task completion statistics for streak tracking.
 * Handles daily stats, streak calculation, and grace period logic.
 */

import { BaseService, type ServiceResponse } from './supabase';

export interface UserTaskStats {
	id: string;
	user_id: string;
	team_id: string;
	date: string; // ISO date string (YYYY-MM-DD)
	tasks_completed: number;
	tasks_created: number;
	current_streak: number;
	longest_streak: number;
	created_at: string;
	updated_at: string;
}

export interface UserTaskStatsUpdate {
	tasks_completed?: number;
	tasks_created?: number;
	current_streak?: number;
	longest_streak?: number;
}

export class UserTaskStatsService extends BaseService {
	/**
	 * Get today's stats for a user and team
	 */
	async getTodayStats(userId: string, teamId: string): Promise<ServiceResponse<UserTaskStats | null>> {
		return this.execute(async () => {
			const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

			const { data, error } = await this.client
				.from('user_task_stats')
				.select('*')
				.eq('user_id', userId)
				.eq('team_id', teamId)
				.eq('date', today)
				.single();

			if (error && error.code !== 'PGRST116') {
				// PGRST116 = not found, which is OK
				return { data: null, error };
			}

			return { data: data || null, error: null };
		});
	}

	/**
	 * Get or create today's stats record
	 */
	async getOrCreateTodayStats(userId: string, teamId: string): Promise<ServiceResponse<UserTaskStats>> {
		const todayResult = await this.getTodayStats(userId, teamId);
		
		if (todayResult.data) {
			return todayResult as ServiceResponse<UserTaskStats>;
		}

		// Create new stats record for today
		return this.execute(async () => {
			const today = new Date().toISOString().split('T')[0];
			
			// Get yesterday's stats to calculate current streak
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			const yesterdayStr = yesterday.toISOString().split('T')[0];

			const { data: yesterdayStats } = await this.client
				.from('user_task_stats')
				.select('current_streak, longest_streak')
				.eq('user_id', userId)
				.eq('team_id', teamId)
				.eq('date', yesterdayStr)
				.single();

			const previousStreak = yesterdayStats?.current_streak || 0;
			const previousLongest = yesterdayStats?.longest_streak || 0;

			// Calculate initial streak (0 if no previous day, or previous streak if yesterday had completions)
			// Grace period: if yesterday had tasks_completed > 0, continue streak
			const initialStreak = yesterdayStats?.tasks_completed > 0 ? previousStreak : 0;

			const { data, error } = await this.client
				.from('user_task_stats')
				.insert({
					user_id: userId,
					team_id: teamId,
					date: today,
					tasks_completed: 0,
					tasks_created: 0,
					current_streak: initialStreak,
					longest_streak: Math.max(previousLongest, initialStreak),
				})
				.select()
				.single();

			if (error) return { data: null, error };
			return { data: data as UserTaskStats, error: null };
		});
	}

	/**
	 * Increment task completion count and update streak
	 * Called when a task is moved to a completion stage
	 */
	async incrementTaskCompletion(userId: string, teamId: string): Promise<ServiceResponse<UserTaskStats>> {
		return this.execute(async () => {
			// Get or create today's stats
			const statsResult = await this.getOrCreateTodayStats(userId, teamId);
			if (statsResult.error || !statsResult.data) {
				return statsResult;
			}

			const todayStats = statsResult.data;
			const isFirstCompletionToday = todayStats.tasks_completed === 0;

			// Increment tasks_completed
			const newCompletedCount = todayStats.tasks_completed + 1;

			// Update streak if this is the first completion today
			let newCurrentStreak = todayStats.current_streak;
			let newLongestStreak = todayStats.longest_streak;

			if (isFirstCompletionToday) {
				// First task completed today - increment streak
				newCurrentStreak = todayStats.current_streak + 1;
				newLongestStreak = Math.max(todayStats.longest_streak, newCurrentStreak);
			}

			// Update the stats record
			const { data, error } = await this.client
				.from('user_task_stats')
				.update({
					tasks_completed: newCompletedCount,
					current_streak: newCurrentStreak,
					longest_streak: newLongestStreak,
					updated_at: new Date().toISOString(),
				})
				.eq('id', todayStats.id)
				.select()
				.single();

			if (error) return { data: null, error };
			return { data: data as UserTaskStats, error: null };
		});
	}

	/**
	 * Get current streak for a user and team
	 */
	async getCurrentStreak(userId: string, teamId: string): Promise<ServiceResponse<number>> {
		return this.execute(async () => {
			const today = new Date().toISOString().split('T')[0];

			const { data, error } = await this.client
				.from('user_task_stats')
				.select('current_streak')
				.eq('user_id', userId)
				.eq('team_id', teamId)
				.eq('date', today)
				.single();

			if (error && error.code !== 'PGRST116') {
				return { data: 0, error };
			}

			return { data: data?.current_streak || 0, error: null };
		});
	}

	/**
	 * Get longest streak for a user and team
	 */
	async getLongestStreak(userId: string, teamId: string): Promise<ServiceResponse<number>> {
		return this.execute(async () => {
			const { data, error } = await this.client
				.from('user_task_stats')
				.select('longest_streak')
				.eq('user_id', userId)
				.eq('team_id', teamId)
				.order('longest_streak', { ascending: false })
				.limit(1)
				.single();

			if (error && error.code !== 'PGRST116') {
				return { data: 0, error };
			}

			return { data: data?.longest_streak || 0, error: null };
		});
	}

	/**
	 * Get stats for a date range
	 */
	async getStatsRange(
		userId: string,
		teamId: string,
		startDate: string,
		endDate: string
	): Promise<ServiceResponse<UserTaskStats[]>> {
		return this.execute(async () => {
			const { data, error } = await this.client
				.from('user_task_stats')
				.select('*')
				.eq('user_id', userId)
				.eq('team_id', teamId)
				.gte('date', startDate)
				.lte('date', endDate)
				.order('date', { ascending: true });

			if (error) return { data: [], error };
			return { data: (data || []) as UserTaskStats[], error: null };
		});
	}

	/**
	 * Reset streak (called when streak breaks)
	 * This happens when a day passes without task completion
	 */
	async resetStreak(userId: string, teamId: string): Promise<ServiceResponse<void>> {
		return this.execute(async () => {
			const today = new Date().toISOString().split('T')[0];

			// Get today's stats
			const todayResult = await this.getTodayStats(userId, teamId);
			
			if (todayResult.data && todayResult.data.tasks_completed === 0) {
				// No tasks completed today, reset streak
				await this.client
					.from('user_task_stats')
					.update({
						current_streak: 0,
						updated_at: new Date().toISOString(),
					})
					.eq('id', todayResult.data.id);
			}

			return { data: undefined, error: null };
		});
	}
}


