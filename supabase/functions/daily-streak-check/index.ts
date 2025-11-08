/**
 * Daily Streak Check Edge Function
 * 
 * Checks and resets streaks for all users at midnight UTC.
 * Should be scheduled as a cron job in Supabase dashboard.
 * 
 * Cron schedule: 0 0 * * * (runs daily at midnight UTC)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
	// Handle CORS preflight
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		// Create Supabase admin client (bypasses RLS)
		const supabaseAdmin = createClient(
			Deno.env.get('SUPABASE_URL') ?? '',
			Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
			{
				auth: {
					autoRefreshToken: false,
					persistSession: false,
				},
			}
		);

		const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		const yesterdayStr = yesterday.toISOString().split('T')[0];

		// Get all active team members
		const { data: teamMembers, error: membersError } = await supabaseAdmin
			.from('team_members')
			.select('user_id, team_id')
			.eq('status', 'active');

		if (membersError) {
			throw new Error(`Failed to fetch team members: ${membersError.message}`);
		}

		if (!teamMembers || teamMembers.length === 0) {
			return new Response(
				JSON.stringify({ message: 'No active team members found', processed: 0 }),
				{
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					status: 200,
				}
			);
		}

		let processed = 0;
		let errors = 0;

		// Process each user-team combination
		for (const member of teamMembers) {
			try {
				// Get yesterday's stats
				const { data: yesterdayStats } = await supabaseAdmin
					.from('user_task_stats')
					.select('current_streak, longest_streak, tasks_completed')
					.eq('user_id', member.user_id)
					.eq('team_id', member.team_id)
					.eq('date', yesterdayStr)
					.single();

				// Get today's stats (if exists)
				const { data: todayStats } = await supabaseAdmin
					.from('user_task_stats')
					.select('*')
					.eq('user_id', member.user_id)
					.eq('team_id', member.team_id)
					.eq('date', today)
					.single();

				const previousStreak = yesterdayStats?.current_streak || 0;
				const previousLongest = yesterdayStats?.longest_streak || 0;
				const yesterdayHadTasks = (yesterdayStats?.tasks_completed || 0) > 0;

				// Calculate new streak
				// Grace period: If yesterday had tasks completed, maintain streak
				// Otherwise, reset to 0
				const newStreak = yesterdayHadTasks ? previousStreak : 0;
				const newLongest = Math.max(previousLongest, newStreak);

				if (todayStats) {
					// Update existing stats
					await supabaseAdmin
						.from('user_task_stats')
						.update({
							current_streak: newStreak,
							longest_streak: newLongest,
							updated_at: new Date().toISOString(),
						})
						.eq('id', todayStats.id);
				} else {
					// Create new stats record for today
					await supabaseAdmin
						.from('user_task_stats')
						.insert({
							user_id: member.user_id,
							team_id: member.team_id,
							date: today,
							tasks_completed: 0,
							tasks_created: 0,
							current_streak: newStreak,
							longest_streak: newLongest,
						});
				}

				processed++;
			} catch (err) {
				console.error(`Error processing user ${member.user_id} in team ${member.team_id}:`, err);
				errors++;
			}
		}

		return new Response(
			JSON.stringify({
				message: 'Daily streak check completed',
				processed,
				errors,
				timestamp: new Date().toISOString(),
			}),
			{
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				status: 200,
			}
		);
	} catch (error) {
		console.error('Daily streak check error:', error);
		return new Response(
			JSON.stringify({
				error: error instanceof Error ? error.message : 'Unknown error',
				timestamp: new Date().toISOString(),
			}),
			{
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				status: 500,
			}
		);
	}
});


