<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import type { TaskComment, CreateCommentRequest } from '$lib/types/tasks';
	import { CommentService } from '$lib/services/comment-service';
	import CommentInput from './CommentInput.svelte';
	import { supabase } from '$lib/supabase';
	import { formatDistanceToNow } from 'date-fns';
	import { MessageSquare, Trash2 } from 'lucide-svelte';
	
	// Service instance
	const commentService = new CommentService();

	// Props
	let {
		taskId,
		comments = $bindable<TaskComment[]>([]),
		onCommentAdded = (comment: TaskComment) => {}
	}: {
		taskId: string;
		comments: TaskComment[];
		onCommentAdded?: (comment: TaskComment) => void;
	} = $props();

	// Local state
	let error = $state<string | null>(null);
	let deletingId = $state<string | null>(null);
	let currentUserId = $state<string | null>(null);

	// Get current user ID
	$effect(() => {
		supabase.auth.getUser().then(({ data: { user } }) => {
			if (user) {
				currentUserId = user.id;
			}
		});
	});

	// Add new comment
	async function handleCommentSubmit(content: string, mentions: string[]) {
		error = null;

		try {
			const data: CreateCommentRequest = {
				task_id: taskId,
				content
				// mentions are automatically extracted from content by the service
			};

			const response = await commentService.createComment(data);
			if (response.error) {
				throw new Error(response.error.message || 'Failed to add comment');
			}
			
			if (response.data) {
				comments = [response.data, ...comments];
				onCommentAdded(response.data);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to add comment';
			console.error('Error adding comment:', err);
		}
	}

	// Delete comment (soft delete)
	async function deleteComment(commentId: string) {
		const previousComments = [...comments];
		
		// Optimistic update: mark as deleted
		comments = comments.map(c => 
			c.id === commentId ? { ...c, deleted: true } : c
		);

		deletingId = commentId;
		error = null;

		try {
			const response = await commentService.deleteComment(commentId);
			if (response.error) {
				throw new Error(response.error.message || 'Failed to delete comment');
			}
		} catch (err) {
			// Rollback on error
			comments = previousComments;
			error = err instanceof Error ? err.message : 'Failed to delete comment';
			console.error('Error deleting comment:', err);
		} finally {
			deletingId = null;
		}
	}

	// Format relative time
	function formatRelativeTime(dateString: string): string {
		try {
			return formatDistanceToNow(new Date(dateString), { addSuffix: true });
		} catch {
			return dateString;
		}
	}

	// Parse @mentions in content
	function parseContent(content: string): string {
		// Replace @username patterns with styled mentions
		return content.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
	}

	// Check if current user can delete comment
	function canDeleteComment(comment: TaskComment): boolean {
		return currentUserId !== null && comment.userId === currentUserId;
	}
</script>

<!-- Comment Thread -->
<div class="space-y-4">
	<!-- Error Message -->
	{#if error}
		<div
			class="rounded-md bg-red-50 p-3 text-sm text-red-800"
			transition:fade={{ duration: 200 }}
		>
			{error}
		</div>
	{/if}

	<!-- Comment Input -->
	<CommentInput
		{taskId}
		onSubmit={handleCommentSubmit}
	/>

	<!-- Comments List -->
	{#if comments.length > 0}
		<div class="space-y-3">
			{#each comments as comment (comment.id)}
				<div
					class="rounded-md border border-gray-200 bg-white p-4 {comment.deleted ? 'opacity-50' : ''}"
					transition:slide={{ duration: 200 }}
				>
					<!-- Comment Header -->
					<div class="mb-2 flex items-start justify-between">
						<div class="flex items-center space-x-2">
							<!-- User Avatar -->
							{#if comment.user?.avatar}
								<img
									src={comment.user.avatar}
									alt={comment.user.name}
									class="h-8 w-8 rounded-full"
								/>
							{:else}
								<div class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
									{comment.user?.name?.[0]?.toUpperCase() || '?'}
								</div>
							{/if}

							<!-- User Name and Time -->
							<div>
								<div class="text-sm font-medium text-gray-900">
									{comment.user?.name || 'Unknown User'}
								</div>
								<div class="text-xs text-gray-500">
									{formatRelativeTime(comment.createdAt)}
									{#if comment.createdAt !== comment.updatedAt}
										<span class="ml-1">(edited)</span>
									{/if}
								</div>
							</div>
						</div>

						<!-- Delete Button -->
						{#if !comment.deleted && canDeleteComment(comment)}
							<button
								class="text-gray-400 transition-colors hover:text-red-600"
								on:click={() => deleteComment(comment.id)}
								disabled={deletingId === comment.id}
								title="Delete comment"
							>
								<Trash2 class="h-4 w-4" />
							</button>
						{/if}
					</div>

					<!-- Comment Content -->
					<div class="prose prose-sm max-w-none">
						{#if comment.deleted}
							<p class="italic text-gray-400">[Comment deleted]</p>
						{:else}
							<div class="text-gray-700 whitespace-pre-wrap">
								{@html parseContent(comment.content)}
							</div>
						{/if}
					</div>

					<!-- Mentioned Users -->
					{#if !comment.deleted && comment.mentions && comment.mentions.length > 0}
						<div class="mt-2 flex items-center space-x-1 text-xs text-gray-500">
							<MessageSquare class="h-3 w-3" />
							<span>Mentioned {comment.mentions.length} {comment.mentions.length === 1 ? 'person' : 'people'}</span>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<div class="rounded-md border border-dashed border-gray-300 p-8 text-center">
			<MessageSquare class="mx-auto h-8 w-8 text-gray-400" />
			<p class="mt-2 text-sm text-gray-500">No comments yet. Start the conversation!</p>
		</div>
	{/if}
</div>

<style>
	/* Mention styles */
	:global(.mention) {
		background-color: #dbeafe;
		color: #1e40af;
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		font-weight: 500;
	}

	/* Prose customization for comment content */
	.prose {
		line-height: 1.5;
	}

	.prose p {
		margin: 0;
	}
</style>

