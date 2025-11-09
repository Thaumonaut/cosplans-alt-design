<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { 
		Palette, Save, RotateCcw, Eye, Code2, Check, ArrowLeft, Search, 
		ChevronRight, ChevronDown, Plus, Trash2, Download, Upload, Copy,
		Undo2, Redo2
	} from 'lucide-svelte';
	import { Button, Input, Label, Switch, Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui';
	import VariableEditor from '$lib/components/theme-builder/VariableEditor.svelte';
	import ThemePreview from '$lib/components/theme-builder/ThemePreview.svelte';
	import { theme } from '$lib/stores/theme';
	import { pageHeader } from '$lib/stores/page-header-store';
	import { Willow, WillowDark } from '@svar-ui/svelte-core';
	import { getThemeVariantById, DEFAULT_THEME_ID } from '$lib/utils/theme-variants';
	import { VARIABLE_GROUPS, getAllVariables, searchVariables, searchGroups, getGroupForVariable } from '$lib/utils/theme-variable-groups';
	import { getBaseVariable, generateAllVariations } from '$lib/utils/theme-variations';
	import { debounce } from '$lib/utils';
	import type { ThemeVariant } from '$lib/types/theme';
	import { get } from 'svelte/store';

	// Current theme state
	let themeState = $state({ resolvedMode: 'light' as 'light' | 'dark', activeId: '', customThemes: [] as ThemeVariant[] });
	
	// Builder state
	let currentThemeId = $state<string | null>(null); // null = new theme, string = editing existing
	let themeName = $state('My Custom Theme');
	let themeDescription = $state('');
	let mode = $state<'light' | 'dark'>('light');
	
	// Reactive CSS variables - this is the working copy that updates the preview in real-time
	let cssVars = $state<Record<string, string>>({});
	
	// Track changes with a version counter for reliable reactivity
	let cssVarsVersion = $state(0);
	
	// Undo/Redo history
	let history = $state<Array<Record<string, string>>>([]);
	let historyIndex = $state(-1);
	let isUndoRedoInProgress = $state(false); // Prevent adding to history during undo/redo
	
	// Derived value to track changes - forces reactivity
	// Access all keys and values to ensure proper tracking
	const cssVarsSnapshot = $derived.by(() => {
		// Read version to track changes
		const version = cssVarsVersion;
		// Read all entries to ensure we track the entire object
		const entries = Object.entries(cssVars);
		// Access both keys and values to establish reactivity
		return `${version}|${entries.map(([key, value]) => `${key}:${value}`).join('|')}`;
	});
	
	// UI state
	let selectedGroupId = $state<string | null>(VARIABLE_GROUPS[0]?.id || null);
	let searchQuery = $state('');
	let showPreview = $state(true);
	let autoGenerateVariations = $state(true);
	let selectedVariable = $state<string | undefined>(undefined);
	// Track which variations have been manually overridden (broken links)
	let brokenVariations = $state<Set<string>>(new Set());
	// Start with first group expanded
	let collapsedGroups = $state<Set<string>>(new Set(
		VARIABLE_GROUPS.slice(1).map(g => g.id) // Collapse all except first
	));

	// Subscribe to theme changes (but don't apply theme - we handle preview ourselves)
	$effect(() => {
		const unsubscribe = theme.subscribe((state) => {
			themeState = state;
			// Don't apply theme here - we're in builder mode and handle preview ourselves
		});
		return unsubscribe;
	});

	// Initialize from a base theme or existing custom theme
	function initializeTheme(baseThemeId?: string, customThemeId?: string) {
		let baseVariant: ThemeVariant;
		
		if (customThemeId) {
			const custom = theme.getCustomTheme(customThemeId);
			if (custom) {
				baseVariant = custom;
				currentThemeId = customThemeId;
				themeName = custom.label;
				themeDescription = custom.description || '';
			} else {
				baseVariant = getThemeVariantById(baseThemeId || DEFAULT_THEME_ID) || getThemeVariantById(DEFAULT_THEME_ID)!;
				currentThemeId = null;
			}
		} else {
			baseVariant = getThemeVariantById(baseThemeId || DEFAULT_THEME_ID) || getThemeVariantById(DEFAULT_THEME_ID)!;
			currentThemeId = null;
		}
		
		mode = baseVariant.mode;
		
		// Initialize cssVars with all variables from the base theme
		// Then ensure all variables from VARIABLE_GROUPS are present (use base theme values or empty string)
		const allVariableNames = getAllVariables();
		const newCssVars: Record<string, string> = {};
		
		// First, copy all variables from the base theme
		Object.assign(newCssVars, baseVariant.cssVars);
		
		// Then, ensure all variables from groups are present (fill missing ones with empty string)
		allVariableNames.forEach(varName => {
			if (!(varName in newCssVars)) {
				newCssVars[varName] = '';
			}
		});
		
		// Assign the new object to trigger reactivity
		cssVars = newCssVars;
		cssVarsVersion++; // Increment version to trigger effect
		
		themeName = baseVariant.label;
		themeDescription = baseVariant.description || '';
		
		applyPreview();
		
		// Initialize history with the initial state
		initializeHistory();
	}
	
	// Initialize history with current state
	function initializeHistory() {
		history = [{ ...cssVars }];
		historyIndex = 0;
		isUndoRedoInProgress = false;
	}
	
	// Add current state to history
	function addToHistory() {
		if (isUndoRedoInProgress) return; // Don't add to history during undo/redo
		
		// Remove any history after current index (when undoing then making a new change)
		if (historyIndex < history.length - 1) {
			history = history.slice(0, historyIndex + 1);
		}
		
		// Add current state to history (deep copy)
		const snapshot = { ...cssVars };
		history = [...history, snapshot];
		historyIndex = history.length - 1;
		
		// Limit history size to 50 entries to prevent memory issues
		if (history.length > 50) {
			history = history.slice(-50);
			historyIndex = history.length - 1;
		}
	}
	
	// Undo last change
	function undo() {
		if (historyIndex <= 0) return; // Can't undo if at the beginning
		
		isUndoRedoInProgress = true;
		historyIndex--;
		cssVars = { ...history[historyIndex] };
		cssVarsVersion++;
		isUndoRedoInProgress = false;
	}
	
	// Redo last undone change
	function redo() {
		if (historyIndex >= history.length - 1) return; // Can't redo if at the end
		
		isUndoRedoInProgress = true;
		historyIndex++;
		cssVars = { ...history[historyIndex] };
		cssVarsVersion++;
		isUndoRedoInProgress = false;
	}
	
	// Check if undo is available
	const canUndo = $derived(historyIndex > 0);
	
	// Check if redo is available
	const canRedo = $derived(historyIndex < history.length - 1);

	// Apply preview theme temporarily - now reactive
	function applyPreview() {
		if (!browser || !showPreview) {
			return;
		}
		const root = document.documentElement;
		let appliedCount = 0;
		// Apply all CSS variables
		Object.entries(cssVars).forEach(([key, value]) => {
			if (value && value.trim()) {
				root.style.setProperty(key, value);
				appliedCount++;
			} else {
				// Remove empty values to allow fallbacks
				root.style.removeProperty(key);
			}
		});
		
		// Verify a few key variables were actually set
		const testVars = ['--theme-background', '--theme-card-bg', '--theme-section-bg'];
		testVars.forEach(varName => {
			const computed = root.style.getPropertyValue(varName);
			const inCssVars = cssVars[varName];
			if (inCssVars && computed !== inCssVars) {
				console.warn('[ThemeBuilder] Variable mismatch:', varName, 'expected:', inCssVars, 'got:', computed);
			}
		});
	}

	// Handle variable change - update reactive state immediately
	function handleVariableChange(event: CustomEvent<{ varName: string; value: string }>) {
		const { varName, value } = event.detail;
		
		// Add to history before making the change
		addToHistory();
		
		// Update the reactive state - create new object to trigger reactivity
		cssVars = { ...cssVars, [varName]: value };
		// Increment version AFTER updating cssVars to ensure effect sees the new value
		cssVarsVersion++;
	}

	// Handle variations generated - update reactive state immediately
	function handleVariationsGenerated(event: CustomEvent<Record<string, string>>) {
		const variations = event.detail;
		
		// Validate variations before applying - filter out NaN and invalid values
		// Also skip variations that have been manually overridden (broken links)
		const validVariations: Record<string, string> = {};
		for (const [key, value] of Object.entries(variations)) {
			// Skip if this variation has been manually overridden
			if (brokenVariations.has(key)) {
				continue;
			}
			
			if (value && typeof value === 'string' && !value.includes('NaN') && !value.includes('undefined') && !value.includes('null')) {
				validVariations[key] = value;
			} else {
				console.warn(`[ThemeBuilder] Skipping invalid variation ${key}:`, value);
			}
		}
		
		// Only update if we have valid variations
		if (Object.keys(validVariations).length > 0) {
			// Add to history before making the change
			addToHistory();
			
			// Update the reactive state - create new object to trigger reactivity
			cssVars = { ...cssVars, ...validVariations };
			cssVarsVersion++; // Increment version to trigger reactivity
		}
	}
	
	// Handle variation broken (manually overridden)
	function handleVariationBroken(event: CustomEvent<{ varName: string }>) {
		const { varName } = event.detail;
		brokenVariations.add(varName);
		brokenVariations = new Set(brokenVariations); // Trigger reactivity
	}
	
	// Handle variation relinked (restore auto-generation)
	async function handleVariationRelinked(event: CustomEvent<{ varName: string }>) {
		const { varName } = event.detail;
		const baseVar = getBaseVariable(varName);
		
		if (!baseVar) {
			console.warn(`[ThemeBuilder] Cannot relink ${varName} - no base variable found`);
			return;
		}
		
		// Get the base value
		const baseValue = cssVars[baseVar];
		if (!baseValue) {
			console.warn(`[ThemeBuilder] Cannot relink ${varName} - base variable ${baseVar} has no value`);
			return;
		}
		
		// Remove from broken variations
		brokenVariations.delete(varName);
		brokenVariations = new Set(brokenVariations); // Trigger reactivity
		
		// Regenerate this specific variation from the base
		try {
			// Determine variation type from variable name
			let variationType: 'hover' | 'active' | 'bg' | 'muted' | 'border' | 'dot' = 'hover';
			if (varName.includes('-hover')) {
				variationType = 'hover';
			} else if (varName.includes('-active')) {
				variationType = 'active';
			} else if (varName.includes('-bg')) {
				variationType = 'bg';
			} else if (varName.includes('-muted')) {
				variationType = 'muted';
			} else if (varName.includes('-border')) {
				variationType = 'border';
			} else if (varName.includes('-dot')) {
				variationType = 'dot';
			}
			
			const { generateVariation } = await import('$lib/utils/theme-variations');
			const regenerated = generateVariation(baseVar, baseValue, variationType, mode);
			if (regenerated && !regenerated.includes('NaN')) {
				cssVars = { ...cssVars, [varName]: regenerated };
				cssVarsVersion++;
			}
		} catch (error) {
			console.error(`[ThemeBuilder] Failed to relink ${varName}:`, error);
		}
	}

	// Save theme
	function saveTheme() {
		if (!themeName.trim()) {
			alert('Please enter a theme name');
			return;
		}

		const variant: ThemeVariant = {
			id: currentThemeId || `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			label: themeName,
			description: themeDescription,
			mode,
			preview: {
				primary: cssVars['--theme-primary'] || '#8b5cf6',
				accent: cssVars['--theme-accent'] || '#ec4899',
				muted: cssVars['--theme-text-muted'] || '#78716c',
				background: cssVars['--theme-background'] || '#fafafa',
			},
			cssVars,
			source: 'custom',
		};

		if (currentThemeId) {
			theme.updateCustomTheme(currentThemeId, variant);
		} else {
			theme.addCustomTheme(variant);
			currentThemeId = variant.id;
		}
	}

	// Delete theme
	function deleteTheme() {
		if (!currentThemeId) return;
		if (confirm(`Are you sure you want to delete "${themeName}"?`)) {
			theme.deleteCustomTheme(currentThemeId);
			initializeTheme(DEFAULT_THEME_ID);
		}
	}

	// Export theme
	function exportTheme() {
		const variant: ThemeVariant = {
			id: currentThemeId || 'exported',
			label: themeName,
			description: themeDescription,
			mode,
			preview: {
				primary: cssVars['--theme-primary'] || '#8b5cf6',
				accent: cssVars['--theme-accent'] || '#ec4899',
				muted: cssVars['--theme-text-muted'] || '#78716c',
				background: cssVars['--theme-background'] || '#fafafa',
			},
			cssVars,
			source: 'custom',
		};

		const blob = new Blob([JSON.stringify(variant, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${themeName.replace(/\s+/g, '-').toLowerCase()}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	// Import theme
	function importTheme(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const variant = JSON.parse(e.target?.result as string) as ThemeVariant;
				initializeTheme(undefined, variant.id);
				themeName = variant.label;
				themeDescription = variant.description || '';
				mode = variant.mode;
				cssVars = { ...variant.cssVars };
				applyPreview();
			} catch (error) {
				alert('Failed to import theme: ' + (error as Error).message);
			}
		};
		reader.readAsText(file);
		input.value = ''; // Reset input
	}

	// New theme
	function newTheme() {
		if (confirm('Create a new theme? Current changes will be lost.')) {
			initializeTheme(DEFAULT_THEME_ID);
			themeName = 'My Custom Theme';
			themeDescription = '';
		}
	}

	// Duplicate theme
	function duplicateTheme() {
		const variant: ThemeVariant = {
			id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			label: `${themeName} (Copy)`,
			description: themeDescription,
			mode,
			preview: {
				primary: cssVars['--theme-primary'] || '#8b5cf6',
				accent: cssVars['--theme-accent'] || '#ec4899',
				muted: cssVars['--theme-text-muted'] || '#78716c',
				background: cssVars['--theme-background'] || '#fafafa',
			},
			cssVars: { ...cssVars },
			source: 'custom',
		};
		theme.addCustomTheme(variant);
		currentThemeId = variant.id;
		themeName = variant.label;
	}

	// Filtered groups and variables
	let filteredGroups = $state(VARIABLE_GROUPS);
	
	// Update filtered groups when search query changes
	$effect(() => {
		if (!searchQuery.trim()) {
			filteredGroups = VARIABLE_GROUPS;
		} else {
			const results = searchGroups(searchQuery);
			filteredGroups = results.length > 0 ? results : VARIABLE_GROUPS;
		}
	});

	// Toggle group collapse
	function toggleGroup(groupId: string) {
		if (collapsedGroups.has(groupId)) {
			collapsedGroups.delete(groupId);
		} else {
			collapsedGroups.add(groupId);
		}
		collapsedGroups = new Set(collapsedGroups);
	}

	// Select variable
	function selectVariable(varName: string) {
		selectedVariable = varName;
		const group = getGroupForVariable(varName);
		if (group) {
			selectedGroupId = group.id;
			if (collapsedGroups.has(group.id)) {
				toggleGroup(group.id);
			}
		}
	}

	// Apply preview on changes - watch cssVarsVersion directly for reliable reactivity
	$effect(() => {
		// Access cssVarsVersion to establish reactivity - this will trigger whenever it changes
		const version = cssVarsVersion;
		
		// Also access cssVars to read current values
		const vars = cssVars;
		
		if (!browser || !showPreview) {
			return;
		}
		
		// Use requestAnimationFrame to ensure DOM is ready
		requestAnimationFrame(() => {
			applyPreview();
		});
	});

	onMount(() => {
		// Configure page header
		pageHeader.setConfig({
			showBackButton: true,
			backUrl: '/tasks',
		});

		// Check if we're editing an existing theme from URL
		const themeParam = $page.url.searchParams.get('theme');
		if (themeParam) {
			const customTheme = theme.getCustomTheme(themeParam);
			if (customTheme) {
				initializeTheme(undefined, themeParam);
			} else {
				initializeTheme(DEFAULT_THEME_ID);
			}
		} else {
			// Use the currently selected theme instead of defaulting to light theme
			const currentThemeState = get(theme);
			const activeThemeId = currentThemeState.activeId || DEFAULT_THEME_ID;
			
			// Check if it's a custom theme
			const customTheme = theme.getCustomTheme(activeThemeId);
			if (customTheme) {
				initializeTheme(undefined, activeThemeId);
			} else {
				initializeTheme(activeThemeId);
			}
		}
		
		// Add keyboard shortcuts for undo/redo
		function handleKeyDown(e: KeyboardEvent) {
			// Ctrl+Z or Cmd+Z for undo
			if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
				e.preventDefault();
				if (canUndo) undo();
			}
			// Ctrl+Shift+Z or Ctrl+Y or Cmd+Shift+Z or Cmd+Y for redo
			if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
				e.preventDefault();
				if (canRedo) redo();
			}
		}
		
		window.addEventListener('keydown', handleKeyDown);
		
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	onDestroy(() => {
		// Reset page header when leaving
		pageHeader.reset();
	});
</script>

<svelte:head>
	<title>Theme Builder - Cosplay Tracker</title>
</svelte:head>

{#if mode === 'dark'}
	<WillowDark fonts={false}>
		<div class="theme-builder-container flex flex-col" style="background-color: var(--theme-background); height: calc(100vh - 64px);">
			<!-- Action Bar -->
			<div class="border-b px-6 py-3 flex items-center justify-between shrink-0" style="border-color: var(--theme-border); background-color: var(--theme-section-bg);">
				<div class="flex items-center gap-2">
					<Palette class="size-5" style="color: var(--theme-primary);" />
					<h1 class="text-xl font-bold" style="color: var(--theme-foreground);">Theme Builder</h1>
				</div>
				<div class="flex items-center gap-2">
					<Button variant="outline" size="sm" onclick={newTheme}>
						<Plus class="size-4 mr-2" />
						New Theme
					</Button>
					{#if currentThemeId}
						<Button variant="outline" size="sm" onclick={duplicateTheme}>
							<Copy class="size-4 mr-2" />
							Duplicate
						</Button>
						<Button variant="outline" size="sm" onclick={deleteTheme}>
							<Trash2 class="size-4 mr-2" />
							Delete
						</Button>
					{/if}
					<Button variant="outline" size="sm" onclick={exportTheme}>
						<Download class="size-4 mr-2" />
						Export
					</Button>
					<label>
						<Button variant="outline" size="sm" as="span">
							<Upload class="size-4 mr-2" />
							Import
						</Button>
						<input type="file" accept=".json" onchange={importTheme} class="hidden" />
					</label>
					<div class="flex items-center gap-2">
						<Button 
							variant="outline" 
							size="sm" 
							onclick={undo} 
							disabled={!canUndo}
							title="Undo (Ctrl+Z)"
						>
							<Undo2 class="size-4" />
						</Button>
						<Button 
							variant="outline" 
							size="sm" 
							onclick={redo} 
							disabled={!canRedo}
							title="Redo (Ctrl+Shift+Z)"
						>
							<Redo2 class="size-4" />
						</Button>
					</div>
					<Button size="sm" onclick={saveTheme} style="background-color: var(--theme-primary); color: var(--theme-card-bg);">
						<Save class="size-4 mr-2" />
						Save Theme
					</Button>
				</div>
			</div>

			<!-- Main Content -->
			<div class="flex-1 flex overflow-hidden">
				<!-- Left Sidebar: Theme Info & Variables -->
				<aside class="w-96 border-r overflow-y-auto" style="border-color: var(--theme-border); background-color: var(--theme-section-bg);">
					<div class="p-4 space-y-4">
						<!-- Search -->
						<div class="relative">
							<Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4" style="color: var(--theme-text-muted);" />
							<Input
								type="text"
								placeholder="Search variables..."
								bind:value={searchQuery}
								class="pl-9"
							/>
						</div>

						<!-- Theme Info -->
						<Card>
							<CardHeader>
								<CardTitle class="text-sm">Theme Info</CardTitle>
							</CardHeader>
							<CardContent class="space-y-3">
								<div>
									<Label for="theme-name" class="text-xs">Name</Label>
									<Input
										id="theme-name"
										bind:value={themeName}
										class="text-sm"
									/>
								</div>
								<div>
									<Label for="theme-description" class="text-xs">Description</Label>
									<textarea
										id="theme-description"
										bind:value={themeDescription}
										class="w-full px-3 py-2 text-sm rounded-md border resize-none"
										style="background-color: var(--theme-input-bg); border-color: var(--theme-border); color: var(--theme-foreground);"
										placeholder="Optional description"
										rows="2"
									></textarea>
								</div>
								<div class="flex items-center justify-between">
									<Label class="text-xs">Mode</Label>
									<Switch
										checked={mode === 'dark'}
										onchange={(e) => {
											mode = e.currentTarget.checked ? 'dark' : 'light';
											applyPreview();
										}}
									/>
									<span class="text-xs" style="color: var(--theme-text-muted);">{mode === 'dark' ? 'Dark' : 'Light'}</span>
								</div>
								<div class="flex items-center justify-between">
									<Label class="text-xs">Auto Variations</Label>
									<Switch bind:checked={autoGenerateVariations} />
								</div>
							</CardContent>
						</Card>

						<!-- Variable Groups with Editors -->
						<div class="space-y-2">
							<h3 class="text-xs font-semibold uppercase tracking-wide px-2" style="color: var(--theme-text-muted);">Variables</h3>
							{#if !VARIABLE_GROUPS || VARIABLE_GROUPS.length === 0}
								<div class="p-4 text-center text-sm" style="color: var(--theme-text-muted);">
									Loading variable groups...
								</div>
							{:else if filteredGroups.length === 0}
								<div class="p-4 text-center text-sm" style="color: var(--theme-text-muted);">
									No groups match your search
								</div>
							{:else}
								{#each filteredGroups as group (group.id)}
									{@const isCollapsed = collapsedGroups.has(group.id)}
									{@const groupVariables = searchQuery.trim() 
										? group.variables.filter(v => v.toLowerCase().includes(searchQuery.toLowerCase()))
										: group.variables}
									<div class="space-y-1">
										<div class="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-[var(--theme-hover)]"
											style="color: var(--theme-foreground); background-color: var(--theme-card-bg); border: 1px solid var(--theme-border);"
										>
											<button
												type="button"
												class="flex-1 text-left flex items-center gap-2"
												onclick={() => {
													if (collapsedGroups.has(group.id)) {
														collapsedGroups.delete(group.id);
													} else {
														collapsedGroups.add(group.id);
													}
													collapsedGroups = new Set(collapsedGroups);
												}}
											>
												{#if isCollapsed}
													<ChevronRight class="size-4" />
												{:else}
													<ChevronDown class="size-4" />
												{/if}
												<span>{group.label}</span>
												<span class="text-xs opacity-70">({groupVariables.length})</span>
											</button>
										</div>
										{#if !isCollapsed && groupVariables.length > 0}
											<div class="pl-2 space-y-2">
												{#each groupVariables as varName}
													{@const currentValue = cssVars[varName] || ''}
													<VariableEditor
														varName={varName}
														value={currentValue}
														{mode}
														{autoGenerateVariations}
														isVariationBroken={brokenVariations.has(varName)}
														on:change={handleVariableChange}
														on:variationsGenerated={handleVariationsGenerated}
														on:variationBroken={handleVariationBroken}
														on:variationRelinked={handleVariationRelinked}
														on:select={(e) => selectVariable(e.detail.varName)}
													/>
												{/each}
											</div>
										{:else if !isCollapsed && groupVariables.length === 0}
											<div class="pl-2 text-xs" style="color: var(--theme-text-muted);">
												No variables match your search
											</div>
										{/if}
									</div>
								{/each}
							{/if}
						</div>
					</div>
				</aside>

				<!-- Center: Live Preview (Main View) -->
				<main class="flex-1 overflow-y-auto" style="background-color: var(--theme-section-bg);">
					<div class="p-6">
						<div class="mb-6">
							<h2 class="text-2xl font-semibold mb-2" style="color: var(--theme-foreground);">Live Preview</h2>
							<p class="text-sm" style="color: var(--theme-text-muted);">See how your theme looks across different components</p>
						</div>
						<ThemePreview {selectedVariable} {mode} />
					</div>
				</main>
			</div>
		</div>
	</WillowDark>
{:else}
	<Willow fonts={false}>
		<div class="theme-builder-container flex flex-col" style="background-color: var(--theme-background); height: calc(100vh - 64px);">
			<!-- Action Bar -->
			<div class="border-b px-6 py-3 flex items-center justify-between shrink-0" style="border-color: var(--theme-border); background-color: var(--theme-section-bg);">
				<div class="flex items-center gap-2">
					<Palette class="size-5" style="color: var(--theme-primary);" />
					<h1 class="text-xl font-bold" style="color: var(--theme-foreground);">Theme Builder</h1>
				</div>
				<div class="flex items-center gap-2">
					<Button variant="outline" size="sm" onclick={newTheme}>
						<Plus class="size-4 mr-2" />
						New Theme
					</Button>
					{#if currentThemeId}
						<Button variant="outline" size="sm" onclick={duplicateTheme}>
							<Copy class="size-4 mr-2" />
							Duplicate
						</Button>
						<Button variant="outline" size="sm" onclick={deleteTheme}>
							<Trash2 class="size-4 mr-2" />
							Delete
						</Button>
					{/if}
					<Button variant="outline" size="sm" onclick={exportTheme}>
						<Download class="size-4 mr-2" />
						Export
					</Button>
					<label>
						<Button variant="outline" size="sm" as="span">
							<Upload class="size-4 mr-2" />
							Import
						</Button>
						<input type="file" accept=".json" onchange={importTheme} class="hidden" />
					</label>
					<div class="flex items-center gap-2">
						<Button 
							variant="outline" 
							size="sm" 
							onclick={undo} 
							disabled={!canUndo}
							title="Undo (Ctrl+Z)"
						>
							<Undo2 class="size-4" />
						</Button>
						<Button 
							variant="outline" 
							size="sm" 
							onclick={redo} 
							disabled={!canRedo}
							title="Redo (Ctrl+Shift+Z)"
						>
							<Redo2 class="size-4" />
						</Button>
					</div>
					<Button size="sm" onclick={saveTheme} style="background-color: var(--theme-primary); color: var(--theme-card-bg);">
						<Save class="size-4 mr-2" />
						Save Theme
					</Button>
				</div>
			</div>

			<!-- Main Content -->
			<div class="flex-1 flex overflow-hidden">
				<!-- Left Sidebar: Theme Info & Variables -->
				<aside class="w-96 border-r overflow-y-auto" style="border-color: var(--theme-border); background-color: var(--theme-section-bg);">
					<div class="p-4 space-y-4">
						<!-- Search -->
						<div class="relative">
							<Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4" style="color: var(--theme-text-muted);" />
							<Input
								type="text"
								placeholder="Search variables..."
								bind:value={searchQuery}
								class="pl-9"
							/>
						</div>

						<!-- Theme Info -->
						<Card>
							<CardHeader>
								<CardTitle class="text-sm">Theme Info</CardTitle>
							</CardHeader>
							<CardContent class="space-y-3">
								<div>
									<Label for="theme-name" class="text-xs">Name</Label>
									<Input
										id="theme-name"
										bind:value={themeName}
										class="text-sm"
									/>
								</div>
								<div>
									<Label for="theme-description" class="text-xs">Description</Label>
									<textarea
										id="theme-description"
										bind:value={themeDescription}
										class="w-full px-3 py-2 text-sm rounded-md border resize-none"
										style="background-color: var(--theme-input-bg); border-color: var(--theme-border); color: var(--theme-foreground);"
										placeholder="Optional description"
										rows="2"
									></textarea>
								</div>
								<div class="flex items-center justify-between">
									<Label class="text-xs">Mode</Label>
									<Switch
										checked={mode === 'dark'}
										onchange={(e) => {
											mode = e.currentTarget.checked ? 'dark' : 'light';
											applyPreview();
										}}
									/>
									<span class="text-xs" style="color: var(--theme-text-muted);">{mode === 'dark' ? 'Dark' : 'Light'}</span>
								</div>
								<div class="flex items-center justify-between">
									<Label class="text-xs">Auto Variations</Label>
									<Switch bind:checked={autoGenerateVariations} />
								</div>
							</CardContent>
						</Card>

						<!-- Variable Groups with Editors -->
						<div class="space-y-2">
							<h3 class="text-xs font-semibold uppercase tracking-wide px-2" style="color: var(--theme-text-muted);">Variables</h3>
							{#if !VARIABLE_GROUPS || VARIABLE_GROUPS.length === 0}
								<div class="p-4 text-center text-sm" style="color: var(--theme-text-muted);">
									Loading variable groups...
								</div>
							{:else if filteredGroups.length === 0}
								<div class="p-4 text-center text-sm" style="color: var(--theme-text-muted);">
									No groups match your search
								</div>
							{:else}
								{#each filteredGroups as group (group.id)}
									{@const isCollapsed = collapsedGroups.has(group.id)}
									{@const groupVariables = searchQuery.trim() 
										? group.variables.filter(v => v.toLowerCase().includes(searchQuery.toLowerCase()))
										: group.variables}
									<div class="space-y-1">
										<div class="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-[var(--theme-hover)]"
											style="color: var(--theme-foreground); background-color: var(--theme-card-bg); border: 1px solid var(--theme-border);"
										>
											<button
												type="button"
												class="flex-1 text-left flex items-center gap-2"
												onclick={() => {
													if (collapsedGroups.has(group.id)) {
														collapsedGroups.delete(group.id);
													} else {
														collapsedGroups.add(group.id);
													}
													collapsedGroups = new Set(collapsedGroups);
												}}
											>
												{#if isCollapsed}
													<ChevronRight class="size-4" />
												{:else}
													<ChevronDown class="size-4" />
												{/if}
												<span>{group.label}</span>
												<span class="text-xs opacity-70">({groupVariables.length})</span>
											</button>
										</div>
										{#if !isCollapsed && groupVariables.length > 0}
											<div class="pl-2 space-y-2">
												{#each groupVariables as varName}
													{@const currentValue = cssVars[varName] || ''}
													<VariableEditor
														varName={varName}
														value={currentValue}
														{mode}
														{autoGenerateVariations}
														isVariationBroken={brokenVariations.has(varName)}
														on:change={handleVariableChange}
														on:variationsGenerated={handleVariationsGenerated}
														on:variationBroken={handleVariationBroken}
														on:variationRelinked={handleVariationRelinked}
														on:select={(e) => selectVariable(e.detail.varName)}
													/>
												{/each}
											</div>
										{:else if !isCollapsed && groupVariables.length === 0}
											<div class="pl-2 text-xs" style="color: var(--theme-text-muted);">
												No variables match your search
											</div>
										{/if}
									</div>
								{/each}
							{/if}
						</div>
					</div>
				</aside>

				<!-- Center: Live Preview (Main View) -->
				<main class="flex-1 overflow-y-auto" style="background-color: var(--theme-section-bg);">
					<div class="p-6">
						<div class="mb-6">
							<h2 class="text-2xl font-semibold mb-2" style="color: var(--theme-foreground);">Live Preview</h2>
							<p class="text-sm" style="color: var(--theme-text-muted);">See how your theme looks across different components</p>
						</div>
						<ThemePreview {selectedVariable} {mode} />
					</div>
				</main>
			</div>
		</div>
	</Willow>
{/if}

