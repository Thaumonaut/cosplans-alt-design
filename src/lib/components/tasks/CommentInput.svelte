<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import { teamService } from '$lib/api/services/teamService';
	import { currentTeam } from '$lib/stores/teams';
	import { get } from 'svelte/store';
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
			const team = get(currentTeam);
			if (team) {
				const members = await teamService.getMembers(team.id);
				teamMembers = members.map(m => ({
					id: m.userId,
					name: m.user?.name || m.user?.email || 'Unknown',
					avatar: m.user?.avatarUrl
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
			class="mb-2 rounded-md p-3 text-sm"
			style="background-color: var(--theme-error-bg); color: var(--theme-error);"
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
			class="w-full resize-none rounded-md border bg-[var(--theme-card-bg)] px-3 py-2 text-sm focus:outline-none focus:ring-1"
			style="border-color: var(--theme-border); color: var(--theme-foreground); --tw-ring-color: var(--theme-focus);"
			style:disabled="background-color: var(--theme-section-bg); color: var(--theme-text-disabled);"
			rows="3"
			disabled={isSending}
			on:input={handleInput}
			on:keydown={handleKeyDown}
		></textarea>

		<!-- Mention Dropdown -->
		{#if showMentionDropdown && filteredMembers().length > 0}
			<div
				class="absolute bottom-full left-0 mb-2 w-64 rounded-md border py-1 shadow-lg"
				style="border-color: var(--theme-border); background-color: var(--theme-card-bg); box-shadow: var(--theme-shadow-lg);"
				transition:slide={{ duration: 200 }}
			>
				{#each filteredMembers() as member, index}
					<button
						class="flex w-full items-center space-x-2 px-3 py-2 text-left text-sm transition-colors"
						style={index === selectedMentionIndex 
							? 'background-color: var(--theme-hover); color: var(--theme-foreground);'
							: 'color: var(--theme-foreground);'}
						on:click={() => insertMention(member)}
						on:mouseenter={(e) => {
							if (index !== selectedMentionIndex) {
								e.currentTarget.style.backgroundColor = 'var(--theme-hover)';
							}
						}}
						on:mouseleave={(e) => {
							if (index !== selectedMentionIndex) {
								e.currentTarget.style.backgroundColor = 'transparent';
							}
						}}
					>
						<!-- Avatar -->
						{#if member.avatar}
							<img
								src={member.avatar}
								alt={member.name}
								class="h-6 w-6 rounded-full"
							/>
						{:else}
							<div class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium" style="background-color: var(--theme-section-bg); color: var(--theme-text-muted);">
								{member.name[0]?.toUpperCase() || '?'}
							</div>
						{/if}

						<!-- Name -->
						<span class="flex-1 truncate" style="color: var(--theme-foreground);">{member.name}</span>
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Actions -->
	<div class="mt-2 flex items-center justify-between">
		<div class="text-xs" style="color: var(--theme-text-muted);">
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

