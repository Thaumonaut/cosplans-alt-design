<script lang="ts">
	import ShopifyDraggableBoard from '$lib/components/dev/implementations/ShopifyDraggableBoard.svelte';
	import NeodragBoard from '$lib/components/dev/implementations/NeodragBoard.svelte';
	import SveltedndBoard from '$lib/components/dev/implementations/SveltedndBoard.svelte';
	import { mockStages, mockTasks, type MockTask } from '$lib/components/dev/mockData';

	type LibraryType = 'shopify' | 'neodrag' | 'sveltednd';

	let selectedLibrary: LibraryType = $state('shopify');
	let tasks = $state<MockTask[]>([...mockTasks]);

	function handleTaskMove(taskId: string, newStageId: string) {
		// Update task status
		tasks = tasks.map((task) => (task.id === taskId ? { ...task, status_id: newStageId } : task));
		console.log(`[Test] Task ${taskId} moved to stage ${newStageId}`);
	}
</script>

<svelte:head>
	<title>Drag & Drop Library Test - Dev</title>
</svelte:head>

<div class="min-h-screen p-8" style="background-color: var(--theme-background, #f5f5f4);">
	<div class="max-w-7xl mx-auto">
		<!-- Header -->
		<div class="mb-6">
			<h1 class="text-3xl font-bold mb-2" style="color: var(--theme-foreground, #1c1917);">
				Drag & Drop Library Comparison
			</h1>
			<p class="text-sm" style="color: var(--theme-text-muted, #78716c);">
				Test and compare three drag-and-drop libraries for kanban board implementation
			</p>
		</div>

		<!-- Library Selector -->
		<div class="mb-6 p-4 rounded-lg border" style="background-color: var(--theme-card-bg, white); border-color: var(--theme-border, rgba(120, 113, 108, 0.2));">
			<div class="flex items-center gap-4">
				<span class="text-sm font-medium" style="color: var(--theme-foreground, #1c1917);">Select Library:</span>
				<div class="flex gap-2">
					<button
						type="button"
						class="px-4 py-2 rounded-md text-sm font-medium transition-colors {selectedLibrary === 'shopify'
							? 'bg-blue-600 text-white'
							: 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
						onclick={() => (selectedLibrary = 'shopify')}
					>
						@shopify/draggable
					</button>
					<button
						type="button"
						class="px-4 py-2 rounded-md text-sm font-medium transition-colors {selectedLibrary === 'neodrag'
							? 'bg-blue-600 text-white'
							: 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
						onclick={() => (selectedLibrary = 'neodrag')}
					>
						Neodrag
					</button>
					<button
						type="button"
						class="px-4 py-2 rounded-md text-sm font-medium transition-colors {selectedLibrary === 'sveltednd'
							? 'bg-blue-600 text-white'
							: 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
						onclick={() => (selectedLibrary = 'sveltednd')}
					>
						svelte-dnd-action
					</button>
				</div>
			</div>
		</div>

		<!-- Test Instructions -->
		<div class="mb-6 p-4 rounded-lg border" style="background-color: var(--theme-card-bg, white); border-color: var(--theme-border, rgba(120, 113, 108, 0.2));">
			<h2 class="text-lg font-semibold mb-2" style="color: var(--theme-foreground, #1c1917);">Testing Checklist</h2>
			<ul class="list-disc list-inside space-y-1 text-sm" style="color: var(--theme-text-muted, #78716c);">
				<li>Drag tasks between columns using the drag handle (visible on hover)</li>
				<li>Test collapsed columns - they should auto-expand when dragging over them</li>
				<li>Verify smooth dragging with visual feedback (mirror element)</li>
				<li>Test auto-scroll when dragging near board edges</li>
				<li>Check that DOM updates don't break drag state</li>
				<li>Test on mobile/tablet (touch support)</li>
			</ul>
		</div>

		<!-- Test Board -->
		<div class="rounded-lg border overflow-hidden" style="background-color: var(--theme-card-bg, white); border-color: var(--theme-border, rgba(120, 113, 108, 0.2));">
			{#if selectedLibrary === 'shopify'}
				<ShopifyDraggableBoard stages={mockStages} {tasks} onTaskMove={handleTaskMove} />
			{:else if selectedLibrary === 'neodrag'}
				<NeodragBoard stages={mockStages} {tasks} onTaskMove={handleTaskMove} />
			{:else if selectedLibrary === 'sveltednd'}
				<SveltedndBoard stages={mockStages} {tasks} onTaskMove={handleTaskMove} />
			{/if}
		</div>

		<!-- Library Info -->
		<div class="mt-6 p-4 rounded-lg border" style="background-color: var(--theme-card-bg, white); border-color: var(--theme-border, rgba(120, 113, 108, 0.2));">
			<h2 class="text-lg font-semibold mb-3" style="color: var(--theme-foreground, #1c1917);">Library Information</h2>
			<div class="space-y-3 text-sm">
				{#if selectedLibrary === 'shopify'}
					<div>
						<h3 class="font-medium mb-1" style="color: var(--theme-foreground, #1c1917);">@shopify/draggable (Current)</h3>
						<p style="color: var(--theme-text-muted, #78716c);">
							Current implementation. Framework-agnostic, excellent cross-browser support, touch support, advanced features.
							Bundle size: ~15KB. Reported issues with DOM updates.
						</p>
					</div>
				{:else if selectedLibrary === 'neodrag'}
					<div>
						<h3 class="font-medium mb-1" style="color: var(--theme-foreground, #1c1917);">Neodrag</h3>
						<p style="color: var(--theme-text-muted, #78716c);">
							Svelte-native, multi-framework support, SSR-friendly. Bundle size: ~4-5KB. Note: Primarily designed for
							individual draggable elements, not sortable lists. This implementation uses a workaround.
						</p>
					</div>
				{:else if selectedLibrary === 'sveltednd'}
					<div>
						<h3 class="font-medium mb-1" style="color: var(--theme-foreground, #1c1917);">svelte-dnd-action</h3>
						<p style="color: var(--theme-text-muted, #78716c);">
							Built specifically for Svelte 5, designed for sortable lists with multiple containers. Lightweight, handles
							reactive updates well. Bundle size: ~3-5KB.
						</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

