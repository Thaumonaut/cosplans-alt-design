<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import { teamService } from '$lib/api/services/teamService';
	import { Button } from '$lib/components/ui';
	import { Send, Loader2 } from 'lucide-svelte';

	// Props
	let {
		taskId,
		onSubmit = async (content: string, mentions: string[]) => {}
	}: {
		taskId: string;
		onSubmit?: (content: string, mentions: string[]) => Promise<void>;
	} = $props();

	// Local state
	let content = $state('');
	let isSending = $state(false);
	let error = $state<string | null>(null);
	let showMentionDropdown = $state(false);
	let mentionQuery = $state('');
	let mentionStartIndex = $state(-1);
	let selectedMentionIndex = $state(0);
	let teamMembers = $state<Array<{ id: string; name: string; avatar?: string }>>([]);
	let textareaRef = $state<HTMLTextAreaElement | null>(null);

	// Load team members for @mentions
	$effect(() => {
		loadTeamMembers();
	});

	async function loadTeamMembers() {
		try {
			const currentTeam = await teamService.getCurrentTeam();
			if (currentTeam) {
				const members = await teamService.getTeamMembers(currentTeam.id);
				teamMembers = members.map(m => ({
					id: m.userId,
					name: m.user?.name || m.user?.email || 'Unknown',
					avatar: m.user?.avatar
				}));
			}
		} catch (err) {
			console.error('Error loading team members:', err);
		}
	}

	// Filter team members based on mention query
	const filteredMembers = $derived(() => {
		if (!mentionQuery) return teamMembers;
		const query = mentionQuery.toLowerCase();
		return teamMembers.filter(m => m.name.toLowerCase().includes(query));
	});

	// Handle input changes
	function handleInput(event: Event) {
		const textarea = event.target as HTMLTextAreaElement;
		content = textarea.value;

		// Auto-resize textarea
		textarea.style.height = 'auto';
		textarea.style.height = `${textarea.scrollHeight}px`;

		// Detect @mention trigger
		const cursorPos = textarea.selectionStart;
		const textBeforeCursor = content.slice(0, cursorPos);
		const lastAtIndex = textBeforeCursor.lastIndexOf('@');

		if (lastAtIndex !== -1 && cursorPos - lastAtIndex <= 20) {
			const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
			// Check if there's a space after @ (which would end the mention)
			if (!textAfterAt.includes(' ')) {
				mentionQuery = textAfterAt;
				mentionStartIndex = lastAtIndex;
				showMentionDropdown = true;
				selectedMentionIndex = 0;
			} else {
				showMentionDropdown = false;
			}
		} else {
			showMentionDropdown = false;
		}
	}

	// Insert mention
	function insertMention(member: { id: string; name: string }) {
		if (!textareaRef || mentionStartIndex === -1) return;

		const cursorPos = textareaRef.selectionStart;
		const beforeMention = content.slice(0, mentionStartIndex);
		const afterCursor = content.slice(cursorPos);
		const mentionText = `@${member.name}`;

		content = beforeMention + mentionText + ' ' + afterCursor;
		showMentionDropdown = false;
		mentionQuery = '';
		mentionStartIndex = -1;

		// Move cursor after mention
		setTimeout(() => {
			if (textareaRef) {
				const newCursorPos = beforeMention.length + mentionText.length + 1;
				textareaRef.selectionStart = newCursorPos;
				textareaRef.selectionEnd = newCursorPos;
				textareaRef.focus();
			}
		}, 0);
	}

	// Handle keyboard navigation in mention dropdown
	function handleKeyDown(event: KeyboardEvent) {
		if (showMentionDropdown && filteredMembers().length > 0) {
			if (event.key === 'ArrowDown') {
				event.preventDefault();
				selectedMentionIndex = (selectedMentionIndex + 1) % filteredMembers().length;
			} else if (event.key === 'ArrowUp') {
				event.preventDefault();
				selectedMentionIndex = (selectedMentionIndex - 1 + filteredMembers().length) % filteredMembers().length;
			} else if (event.key === 'Enter' && !event.shiftKey) {
				event.preventDefault();
				const selected = filteredMembers()[selectedMentionIndex];
				if (selected) {
					insertMention(selected);
				}
			} else if (event.key === 'Escape') {
				showMentionDropdown = false;
			}
		} else if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
			// Cmd/Ctrl + Enter to send
			event.preventDefault();
			handleSubmit();
		}
	}

	// Extract mentioned user IDs from content
	function extractMentions(text: string): string[] {
		const mentionRegex = /@(\w+)/g;
		const matches = text.matchAll(mentionRegex);
		const mentionedNames = Array.from(matches, m => m[1]);
		
		// Map names to user IDs
		return mentionedNames
			.map(name => teamMembers.find(m => m.name === name)?.id)
			.filter((id): id is string => id !== undefined);
	}

	// Submit comment
	async function handleSubmit() {
		if (!content.trim() || isSending) return;

		isSending = true;
		error = null;

		try {
			const mentions = extractMentions(content);
			await onSubmit(content.trim(), mentions);
			
			// Clear form
			content = '';
			if (textareaRef) {
				textareaRef.style.height = 'auto';
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to send comment';
			console.error('Error sending comment:', err);
		} finally {
			isSending = false;
		}
	}
</script>

<!-- Comment Input -->
<div class="relative">
	<!-- Error Message -->
	{#if error}
		<div
			class="mb-2 rounded-md bg-red-50 p-3 text-sm text-red-800"
			transition:fade={{ duration: 200 }}
		>
			{error}
		</div>
	{/if}

	<!-- Textarea -->
	<div class="relative">
		<textarea
			bind:this={textareaRef}
			bind:value={content}
			placeholder="Add a comment... Use @ to mention someone"
			class="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
			rows="3"
			disabled={isSending}
			on:input={handleInput}
			on:keydown={handleKeyDown}
		></textarea>

		<!-- Mention Dropdown -->
		{#if showMentionDropdown && filteredMembers().length > 0}
			<div
				class="absolute bottom-full left-0 mb-2 w-64 rounded-md border border-gray-200 bg-white py-1 shadow-lg"
				transition:slide={{ duration: 200 }}
			>
				{#each filteredMembers() as member, index}
					<button
						class="flex w-full items-center space-x-2 px-3 py-2 text-left text-sm transition-colors {index === selectedMentionIndex ? 'bg-blue-50' : 'hover:bg-gray-50'}"
						on:click={() => insertMention(member)}
						on:mouseenter={() => (selectedMentionIndex = index)}
					>
						<!-- Avatar -->
						{#if member.avatar}
							<img
								src={member.avatar}
								alt={member.name}
								class="h-6 w-6 rounded-full"
							/>
						{:else}
							<div class="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
								{member.name[0]?.toUpperCase() || '?'}
							</div>
						{/if}

						<!-- Name -->
						<span class="flex-1 truncate text-gray-900">{member.name}</span>
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Actions -->
	<div class="mt-2 flex items-center justify-between">
		<div class="text-xs text-gray-500">
			{#if showMentionDropdown}
				<span>↑↓ to navigate, Enter to select</span>
			{:else}
				<span>Use @ to mention team members. Cmd/Ctrl + Enter to send.</span>
			{/if}
		</div>

		<Button
			variant="default"
			size="sm"
			on:click={handleSubmit}
			disabled={isSending || !content.trim()}
		>
			{#if isSending}
				<Loader2 class="mr-2 h-4 w-4 animate-spin" />
			{:else}
				<Send class="mr-2 h-4 w-4" />
			{/if}
			Send
		</Button>
	</div>
</div>

<style>
	textarea {
		min-height: 80px;
		max-height: 300px;
	}
</style>

