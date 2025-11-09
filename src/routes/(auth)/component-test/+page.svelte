<script lang="ts">
	import { Button, Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui';
	import { Palette, TestTube, Layers, RotateCw, Plus, X, ChevronDown, ChevronUp, ArrowLeftRight, Maximize2, Minimize2 } from 'lucide-svelte';
	import ColorPicker from '$lib/components/ui/color-picker.svelte';
	import CircularColorPicker from '$lib/components/ui/circular-color-picker.svelte';
	import ColorisWrapper from '$lib/components/ui/coloris-wrapper.svelte';
	import { closeColorisPicker } from '$lib/utils/coloris';
	
	// Test state
	let colorValue = $state('#8b5cf6');
	let colorValue2 = $state('#FA4996');
	
	// ColorisWrapper test state
	let wrapperValue1 = $state('#3b82f6');
	let wrapperValue2 = $state('#ef4444');
	let wrapperValue3 = $state<string | null>(null);
	let wrapperValueCallback = $state('#22c55e');
	let gradientValue = $state('linear-gradient(to right, #FA4996 0%, #8772FF 100%)');
	
	// Gradient builder state
	let gradientStops = $state([
		{ id: '1', color: '#FA4996', position: 0 },
		{ id: '2', color: '#8772FF', position: 100 }
	]);
	let gradientType = $state<'linear' | 'radial'>('linear');
	let gradientDirection = $state('to right');
	let gradientAngle = $state(0); // Angle in degrees for linear gradients
	let draggingStop = $state<string | null>(null);
	let gradientBarRef = $state<HTMLDivElement | null>(null);
	let selectedStopId = $state<string | null>(null);
	let showDetailedStops = $state(false); // Toggle for detailed stops list
	let stopColorPickerRefs = $state<Record<string, any>>({});
	
	// Track mouse down position to distinguish click from drag
	let mouseDownPos = $state<{ x: number; y: number; stopId: string } | null>(null);
	const DRAG_THRESHOLD = 5; // pixels
	
	// Rotation dial state
	let angleDialRef = $state<HTMLDivElement | null>(null);
	let isDraggingDial = $state(false);
	let unwrappedAngle = $state(0); // Track unwrapped angle for smooth rotation
	
	// Preview expansion state
	let isPreviewExpanded = $state(false);
	
	// Sorted gradient stops (non-mutating)
	const sortedStops = $derived([...gradientStops].sort((a, b) => a.position - b.position));
	
	// Build gradient string for the bar (always linear horizontal for consistent handle behavior)
	const gradientBarString = $derived.by(() => {
		const stopsStr = sortedStops
			.map(s => `${s.color} ${s.position}%`)
			.join(', ');
		// Always use linear horizontal gradient for the bar so handles work consistently
		return `linear-gradient(to right, ${stopsStr})`;
	});
	
	// Build actual gradient string (for preview and output)
	const gradientString = $derived.by(() => {
		const stopsStr = sortedStops
			.map(s => `${s.color} ${s.position}%`)
			.join(', ');
		
		if (gradientType === 'radial') {
			return `radial-gradient(circle, ${stopsStr})`;
		}
		// Use angle if it's a degree value, otherwise use direction
		if (gradientDirection.includes('deg')) {
			return `linear-gradient(${gradientAngle}deg, ${stopsStr})`;
		}
		return `linear-gradient(${gradientDirection}, ${stopsStr})`;
	});
	
	function addGradientStop() {
		gradientStops = [...gradientStops, {
			id: Date.now().toString(),
			color: '#000000',
			position: 50
		}];
	}
	
	function removeGradientStop(id: string) {
		if (gradientStops.length > 2) {
			gradientStops = gradientStops.filter(s => s.id !== id);
		}
	}
	
	function invertGradient() {
		// Reverse the order of stops and invert their positions
		gradientStops = gradientStops.map(stop => ({
			...stop,
			position: 100 - stop.position
		})).reverse();
	}
	
	function updateStopColor(id: string, color: string) {
		if (!color) return;
		// Create a new array to ensure reactivity
		const updated = gradientStops.map(s => s.id === id ? { ...s, color } : s);
		gradientStops = updated;
		console.log('[Gradient] Updated stop', id, 'to', color, 'New stops:', gradientStops);
	}
	
	function updateStopPosition(id: string, position: number) {
		// Clamp position between 0 and 100
		const clampedPosition = Math.max(0, Math.min(100, position));
		// Create a new array to ensure reactivity
		const updated = gradientStops.map(s => s.id === id ? { ...s, position: clampedPosition } : s);
		gradientStops = updated;
	}
	
	function handleGradientBarClick(e: MouseEvent) {
		if (!gradientBarRef) return;
		const rect = gradientBarRef.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const percentage = Math.round((x / rect.width) * 100);
		const clampedPercentage = Math.max(0, Math.min(100, percentage));
		
		// Add a new stop at this position
		const newStop = {
			id: Date.now().toString(),
			color: '#000000',
			position: clampedPercentage
		};
		gradientStops = [...gradientStops, newStop];
		selectedStopId = newStop.id;
	}
	
	function handleStopDrag(e: MouseEvent, stopId: string) {
		if (!gradientBarRef) return;
		e.preventDefault();
		// Close any open color picker when dragging starts
		closeColorisPicker();
		draggingStop = stopId;
		selectedStopId = stopId;
		
		function onMouseMove(moveEvent: MouseEvent) {
			const rect = gradientBarRef!.getBoundingClientRect();
			const x = moveEvent.clientX - rect.left;
			const percentage = Math.round((x / rect.width) * 100);
			const clampedPercentage = Math.max(0, Math.min(100, percentage));
			updateStopPosition(stopId, clampedPercentage);
		}
		
		function onMouseUp() {
			draggingStop = null;
			mouseDownPos = null;
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		}
		
		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	}
	
	function handleStopMouseDown(e: MouseEvent, stopId: string) {
		mouseDownPos = {
			x: e.clientX,
			y: e.clientY,
			stopId
		};
		selectedStopId = stopId;
		
		// Set up document-level listeners to detect drag vs click
		function onDocumentMouseMove(moveEvent: MouseEvent) {
			if (!mouseDownPos || mouseDownPos.stopId !== stopId || draggingStop) return;
			
			const deltaX = Math.abs(moveEvent.clientX - mouseDownPos.x);
			const deltaY = Math.abs(moveEvent.clientY - mouseDownPos.y);
			const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
			
			// If mouse moved beyond threshold, start dragging
			if (distance >= DRAG_THRESHOLD && !draggingStop) {
				document.removeEventListener('mousemove', onDocumentMouseMove);
				document.removeEventListener('mouseup', onDocumentMouseUp);
				handleStopDrag(moveEvent, stopId);
			}
		}
		
		function onDocumentMouseUp(upEvent: MouseEvent) {
			if (!mouseDownPos || mouseDownPos.stopId !== stopId) {
				document.removeEventListener('mousemove', onDocumentMouseMove);
				document.removeEventListener('mouseup', onDocumentMouseUp);
				return;
			}
			
			const deltaX = Math.abs(upEvent.clientX - mouseDownPos.x);
			const deltaY = Math.abs(upEvent.clientY - mouseDownPos.y);
			const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
			
			// If mouse didn't move much, it's a click - open color picker
			if (distance < DRAG_THRESHOLD && !draggingStop) {
				openStopColorPicker(stopId);
			}
			
			mouseDownPos = null;
			document.removeEventListener('mousemove', onDocumentMouseMove);
			document.removeEventListener('mouseup', onDocumentMouseUp);
		}
		
		document.addEventListener('mousemove', onDocumentMouseMove);
		document.addEventListener('mouseup', onDocumentMouseUp);
	}
	
	function updateAngle(angle: number) {
		// Normalize angle to 0-360 range for storage and display
		let normalizedAngle = angle % 360;
		if (normalizedAngle < 0) normalizedAngle += 360;
		gradientAngle = normalizedAngle;
		// Update direction to match angle
		gradientDirection = `${normalizedAngle}deg`;
	}
	
	function handleDialMouseDown(e: MouseEvent) {
		if (!angleDialRef) return;
		e.preventDefault();
		isDraggingDial = true;
		
		const startY = e.clientY;
		const startAngle = gradientAngle;
		// Initialize unwrapped angle from current normalized angle
		unwrappedAngle = startAngle;
		const sensitivity = 1.5; // Degrees per pixel
		
		// Track cumulative movement for pointer lock
		let cumulativeDeltaY = 0;
		let lastClientY = startY;
		
		// Request pointer lock to capture mouse movement
		const element = angleDialRef;
		if (element && element.requestPointerLock) {
			element.requestPointerLock();
		}
		
		function onMouseMove(moveEvent: MouseEvent) {
			if (!isDraggingDial) return;
			
			let deltaY: number;
			
			// Check if pointer is locked (use movementY for relative movement)
			if (document.pointerLockElement === element && moveEvent.movementY !== undefined) {
				// Pointer is locked - use movementY (relative movement)
				deltaY = -moveEvent.movementY; // movementY is inverted (positive = down, we want up = positive)
				cumulativeDeltaY += deltaY;
			} else {
				// Pointer not locked - use absolute position
				deltaY = lastClientY - moveEvent.clientY;
				lastClientY = moveEvent.clientY;
				cumulativeDeltaY += deltaY;
			}
			
			const angleDelta = cumulativeDeltaY * sensitivity;
			
			// Calculate unwrapped angle from start (allows smooth rotation beyond 360)
			unwrappedAngle = startAngle + angleDelta;
			
			// Normalize for storage and display, but use unwrapped for visual rotation
			let normalizedAngle = unwrappedAngle % 360;
			if (normalizedAngle < 0) normalizedAngle += 360;
			
			gradientAngle = normalizedAngle;
			gradientDirection = `${normalizedAngle}deg`;
		}
		
		function onMouseUp() {
			isDraggingDial = false;
			// Release pointer lock
			if (document.exitPointerLock) {
				document.exitPointerLock();
			}
			// Final normalization on mouse up
			let finalAngle = unwrappedAngle % 360;
			if (finalAngle < 0) finalAngle += 360;
			unwrappedAngle = finalAngle; // Sync unwrapped angle with normalized
			updateAngle(finalAngle);
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
			document.removeEventListener('pointerlockchange', onPointerLockChange);
			document.removeEventListener('pointerlockerror', onPointerLockError);
		}
		
		function onPointerLockChange() {
			// If pointer lock was lost, exit dragging mode
			if (!document.pointerLockElement && isDraggingDial) {
				onMouseUp();
			}
		}
		
		function onPointerLockError() {
			// If pointer lock fails, continue with normal mouse tracking
			console.warn('Pointer lock failed, using normal mouse tracking');
		}
		
		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
		document.addEventListener('pointerlockchange', onPointerLockChange);
		document.addEventListener('pointerlockerror', onPointerLockError);
	}
	
	const selectedStop = $derived(gradientStops.find(s => s.id === selectedStopId) || sortedStops[0]);
	
	// Initialize selected stop
	$effect(() => {
		if (!selectedStopId && sortedStops.length > 0) {
			selectedStopId = sortedStops[0].id;
		}
	});
	
	async function openStopColorPicker(stopId: string) {
		const ref = stopColorPickerRefs[stopId];
		if (ref && typeof ref.openPicker === 'function') {
			await ref.openPicker();
		}
	}
</script>

<svelte:head>
	<title>Component Test - Cosplay Tracker</title>
</svelte:head>

<div class="min-h-screen p-8" style="background-color: var(--theme-background);">
	<div class="max-w-7xl mx-auto">
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-center gap-3 mb-4">
				<TestTube class="size-8" style="color: var(--theme-primary);" />
				<h1 class="text-4xl font-bold" style="color: var(--theme-foreground);">Component Test</h1>
			</div>
			<p class="text-lg" style="color: var(--theme-text-muted);">
				Test page for custom components and design overrides
			</p>
		</div>

		<div class="space-y-8">
			<!-- Color Pickers -->
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<Palette class="size-6" />
						Color Pickers
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-6">
					<div>
						<label class="block mb-2 text-sm font-medium" style="color: var(--theme-foreground);">
							ColorPicker Component:
						</label>
						<div class="flex items-center gap-4">
							<ColorPicker
								value={colorValue}
								onchange={(e) => colorValue = e.detail || colorValue}
							/>
							<div>
								<p class="text-sm font-mono" style="color: var(--theme-text-muted);">
									Value: <code class="px-2 py-1 rounded bg-section-bg">{colorValue}</code>
								</p>
							</div>
						</div>
					</div>
					
					<div>
						<label class="block mb-2 text-sm font-medium" style="color: var(--theme-foreground);">
							Circular Color Picker:
						</label>
						<div class="flex items-center gap-4">
							<CircularColorPicker
								value={colorValue2}
								onchange={(e) => colorValue2 = e.detail || colorValue2}
							/>
							<div>
								<p class="text-sm font-mono" style="color: var(--theme-text-muted);">
									Value: <code class="px-2 py-1 rounded bg-section-bg">{colorValue2}</code>
								</p>
							</div>
						</div>
					</div>
					
					<!-- Color Preview -->
					<div class="grid grid-cols-2 gap-4">
						<div class="p-4 rounded border" style="background-color: {colorValue}; border-color: var(--theme-border);">
							<p class="text-white text-sm font-medium">Color 1 Preview</p>
						</div>
						<div class="p-4 rounded border" style="background-color: {colorValue2}; border-color: var(--theme-border);">
							<p class="text-white text-sm font-medium">Color 2 Preview</p>
						</div>
					</div>
					
					<!-- ColorisWrapper Tests -->
					<div class="pt-6 border-t" style="border-color: var(--theme-border);">
						<h3 class="text-lg font-semibold mb-4" style="color: var(--theme-foreground);">ColorisWrapper Component (New)</h3>
						
						<!-- Test 1: bind:value pattern -->
						<div class="mb-6">
							<label class="block mb-2 text-sm font-medium" style="color: var(--theme-foreground);">
								Test 1: bind:value Pattern
							</label>
							<div class="flex items-center gap-4">
								<ColorisWrapper bind:value={wrapperValue1} />
								<div>
									<p class="text-sm font-mono" style="color: var(--theme-text-muted);">
										Value: <code class="px-2 py-1 rounded bg-section-bg">{wrapperValue1 ?? 'null'}</code>
									</p>
									<Button
										size="sm"
										variant="outline"
										onclick={() => wrapperValue1 = '#8b5cf6'}
										class="mt-2"
									>
										Set to Purple
									</Button>
								</div>
							</div>
						</div>
						
						<!-- Test 2: Multiple instances -->
						<div class="mb-6">
							<label class="block mb-2 text-sm font-medium" style="color: var(--theme-foreground);">
								Test 2: Multiple Instances (bind:value)
							</label>
							<div class="flex items-center gap-4">
								<ColorisWrapper bind:value={wrapperValue2} id="wrapper-test-2" />
								<ColorisWrapper bind:value={wrapperValue3} id="wrapper-test-3" />
								<div>
									<p class="text-sm font-mono" style="color: var(--theme-text-muted);">
										Value 2: <code class="px-2 py-1 rounded bg-section-bg">{wrapperValue2 ?? 'null'}</code>
									</p>
									<p class="text-sm font-mono mt-1" style="color: var(--theme-text-muted);">
										Value 3: <code class="px-2 py-1 rounded bg-section-bg">{wrapperValue3 ?? 'null'}</code>
									</p>
								</div>
							</div>
						</div>
						
						<!-- Test 3: onchange callback pattern -->
						<div class="mb-6">
							<label class="block mb-2 text-sm font-medium" style="color: var(--theme-foreground);">
								Test 3: onchange Callback Pattern
							</label>
							<div class="flex items-center gap-4">
								<ColorisWrapper
									value={wrapperValueCallback}
									onchange={(val) => {
										wrapperValueCallback = val ?? '#22c55e';
										console.log('ColorisWrapper onchange called:', val);
									}}
									id="wrapper-test-callback"
								/>
								<div>
									<p class="text-sm font-mono" style="color: var(--theme-text-muted);">
										Value: <code class="px-2 py-1 rounded bg-section-bg">{wrapperValueCallback ?? 'null'}</code>
									</p>
								</div>
							</div>
						</div>
						
						<!-- Test 4: Different configurations -->
						<div class="mb-6">
							<label class="block mb-2 text-sm font-medium" style="color: var(--theme-foreground);">
								Test 4: Custom Configuration (theme: large)
							</label>
							<div class="flex items-center gap-4">
								<ColorisWrapper
									bind:value={wrapperValue1}
									theme="large"
									swatches={['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']}
									id="wrapper-test-config"
								/>
								<div>
									<p class="text-sm" style="color: var(--theme-text-muted);">
										Using large theme with custom swatches
									</p>
								</div>
							</div>
						</div>
						
						<!-- Wrapper Previews -->
						<div class="grid grid-cols-3 gap-4 mt-4">
							{#if wrapperValue1}
								<div class="p-4 rounded border" style="background-color: {wrapperValue1}; border-color: var(--theme-border);">
									<p class="text-white text-sm font-medium text-center">Wrapper 1</p>
								</div>
							{/if}
							{#if wrapperValue2}
								<div class="p-4 rounded border" style="background-color: {wrapperValue2}; border-color: var(--theme-border);">
									<p class="text-white text-sm font-medium text-center">Wrapper 2</p>
								</div>
							{/if}
							{#if wrapperValue3}
								<div class="p-4 rounded border" style="background-color: {wrapperValue3}; border-color: var(--theme-border);">
									<p class="text-white text-sm font-medium text-center">Wrapper 3</p>
								</div>
							{/if}
						</div>
					</div>
				</CardContent>
			</Card>

			<!-- Gradient Builder -->
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<Layers class="size-6" />
						Gradient Builder
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<!-- Top Row: Controls + Preview -->
					<div class="flex items-center gap-3 flex-wrap">
						<!-- Type Toggle -->
						<div class="flex items-center gap-1 border rounded-md p-1" style="border-color: var(--theme-border);">
							<Button
								size="sm"
								variant={gradientType === 'linear' ? 'default' : 'ghost'}
								onclick={() => gradientType = 'linear'}
								class="h-7 px-2 text-xs"
							>
								Linear
							</Button>
							<Button
								size="sm"
								variant={gradientType === 'radial' ? 'default' : 'ghost'}
								onclick={() => gradientType = 'radial'}
								class="h-7 px-2 text-xs"
							>
								Radial
							</Button>
						</div>
						
						<!-- Angle Control (for linear) - Rotatable Dial -->
						{#if gradientType === 'linear'}
							<div class="flex items-center gap-2">
								<RotateCw class="size-4" style="color: var(--theme-text-muted);" />
								<div class="relative flex items-center gap-2">
									<!-- Rotation Dial -->
									<div
										bind:this={angleDialRef}
										class="relative w-12 h-12 rounded-full border-2 cursor-grab active:cursor-grabbing transition-all hover:scale-110"
										style="border-color: var(--theme-border); background-color: var(--theme-section-bg);"
										onmousedown={handleDialMouseDown}
										title="Drag to rotate (0-360°)"
									>
										<!-- Dial center dot -->
										<div
											class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
											style="background-color: var(--theme-foreground);"
										></div>
										<!-- Angle indicator line -->
										<div
											class="absolute top-1/2 left-1/2 w-0.5 origin-bottom {isDraggingDial ? '' : 'transition-transform duration-75'}"
											style="height: 40%; transform: translate(-50%, -100%) rotate({(isDraggingDial ? unwrappedAngle : gradientAngle) - 90}deg); background-color: var(--theme-primary);"
										></div>
										<!-- Angle value display -->
										<div
											class="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-xs font-mono"
											style="color: var(--theme-text-muted);"
										>
											{Math.round(gradientAngle)}°
										</div>
									</div>
								</div>
							</div>
						{/if}
						
						<!-- Invert Gradient Button -->
						<Button
							size="sm"
							variant="outline"
							onclick={invertGradient}
							class="h-7 px-2 text-xs"
							title="Invert gradient"
						>
							<ArrowLeftRight class="size-3 mr-1" />
							Invert
						</Button>
						
						<!-- Add Stop Button -->
						<Button size="sm" variant="outline" onclick={addGradientStop} class="h-7 px-2 text-xs">
							<Plus class="size-3 mr-1" />
							Add Stop
						</Button>
						
						<!-- Preview (Rectangle, expandable to Square) -->
						<div class="ml-auto">
							{#if isPreviewExpanded}
								<!-- Expanded Preview (square) -->
								<div class="relative w-32 h-32 rounded border overflow-hidden" style="border-color: var(--theme-border); background: {gradientString};">
									<button
										type="button"
										onclick={() => isPreviewExpanded = false}
										class="absolute top-1 right-1 w-6 h-6 rounded-full bg-background/80 hover:bg-background border flex items-center justify-center transition-colors shadow-sm z-10"
										style="border-color: var(--theme-border);"
										title="Minimize preview"
									>
										<Minimize2 class="size-3" style="color: var(--theme-foreground);" />
									</button>
								</div>
							{:else}
								<!-- Compact Preview (rectangle) -->
								<button
									type="button"
									onclick={() => isPreviewExpanded = true}
									class="relative w-32 h-16 rounded border overflow-hidden transition-all hover:shadow-md group"
									style="border-color: var(--theme-border); background: {gradientString};"
									title="Expand preview"
								>
									<div class="absolute inset-0 flex items-center justify-center bg-background/0 group-hover:bg-background/5 transition-colors">
										<Maximize2 class="size-4 opacity-0 group-hover:opacity-100 transition-opacity" style="color: var(--theme-foreground);" />
									</div>
								</button>
							{/if}
						</div>
					</div>
					
					<!-- Visual Gradient Bar with Draggable Stops (always horizontal for adjusting stops) -->
					<div class="space-y-3">
						<!-- Gradient Bar + Color Stops Button -->
						<div class="flex items-center gap-2">
							<!-- Container for handles and gradient bar -->
							<div class="relative flex-1">
								<!-- Stop Handles Above Bar (clamped to gradient bar width) -->
								<div class="relative h-8 w-full">
									{#each sortedStops as stop (stop.id)}
										{@const stopId = stop.id}
										<div
											class="absolute -translate-x-1/2 {selectedStopId === stopId ? 'z-10' : 'z-0'}"
											style="left: {stop.position}%;"
										>
											<!-- Color Picker (hidden, used for opening) -->
											<div class="absolute opacity-0 pointer-events-none">
												<ColorisWrapper
													bind:this={stopColorPickerRefs[stopId]}
													value={stop.color}
													id={`gradient-stop-${stopId}`}
													onchange={(color) => {
														if (color) {
															updateStopColor(stop.id, color);
														}
													}}
												/>
											</div>
											
											<!-- Stop Handle Container -->
											<div class="relative">
												<!-- Stop Handle (draggable, clickable for color picker) -->
												<div
													class="relative z-10 cursor-grab active:cursor-grabbing transition-all {selectedStopId === stopId ? 'scale-110' : ''}"
													onmousedown={(e) => {
														e.stopPropagation();
														handleStopMouseDown(e, stopId);
													}}
													oncontextmenu={(e) => {
														e.preventDefault();
														e.stopPropagation();
														if (gradientStops.length > 2) {
															removeGradientStop(stopId);
															selectedStopId = sortedStops.find(s => s.id !== stopId)?.id || null;
														}
													}}
													title="Click to change color, drag to move"
												>
													<div
														class="w-5 h-5 rounded-full border-2 shadow-md transition-all {selectedStopId === stopId ? 'border-primary ring-2 ring-primary/50' : 'border-gray-300 dark:border-gray-600'}"
														style="background-color: {stop.color};"
													></div>
												</div>
												
												<!-- Connection Line -->
												<div
													class="w-0.5 h-3 mx-auto mt-0.5 {selectedStopId === stopId ? 'bg-primary' : 'bg-gray-400 dark:bg-gray-500'}"
												></div>
											</div>
											
											<!-- Delete button (for selected stop) -->
											{#if selectedStopId === stopId && gradientStops.length > 2}
												<button
													type="button"
													onclick={(e) => {
														e.stopPropagation();
														removeGradientStop(stopId);
														selectedStopId = sortedStops.find(s => s.id !== stopId)?.id || null;
													}}
													class="absolute -top-7 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-sm transition-colors z-20"
													title="Delete stop (or right-click)"
												>
													<X class="size-3" />
												</button>
											{/if}
										</div>
									{/each}
								</div>
								
								<!-- Gradient Bar (always horizontal linear for adjusting stops) -->
								<div
									bind:this={gradientBarRef}
									class="relative h-12 rounded border cursor-crosshair"
									style="background: {gradientBarString}; border-color: var(--theme-border);"
									onclick={handleGradientBarClick}
								>
								</div>
							</div>
							
							<!-- Color Stops Button (beside gradient bar) -->
							<Button
								size="sm"
								variant="outline"
								onclick={() => showDetailedStops = !showDetailedStops}
								class="h-12 px-3 text-xs whitespace-nowrap"
								title={showDetailedStops ? 'Hide color stops' : 'Show color stops'}
							>
								<Layers class="size-3 mr-1.5" />
								Stops ({gradientStops.length})
								{#if showDetailedStops}
									<ChevronUp class="size-3 ml-1.5" />
								{:else}
									<ChevronDown class="size-3 ml-1.5" />
								{/if}
							</Button>
						</div>
						
						<!-- All Stops List (Collapsible Detailed View) -->
						{#if showDetailedStops}
							<div class="pt-2 border-t space-y-2" style="border-color: var(--theme-border);">
									{#each sortedStops as stop (stop.id)}
								{@const stopId = stop.id}
								<div class="flex items-center gap-2 p-2 rounded border {selectedStopId === stopId ? 'border-primary bg-primary/5' : ''}" style="border-color: var(--theme-border); background-color: var(--theme-section-bg);">
									<!-- Color Picker -->
									<ColorisWrapper
										value={stop.color}
										onchange={(color) => {
											if (color) {
												updateStopColor(stop.id, color);
											}
										}}
									/>
									
									<!-- Position Slider -->
									<div class="flex-1">
										<div class="flex items-center gap-2">
											<span class="text-xs w-8" style="color: var(--theme-text-muted);">0%</span>
											<input
												type="range"
												min="0"
												max="100"
												step="1"
												value={stop.position}
												oninput={(e) => updateStopPosition(stop.id, parseFloat(e.currentTarget.value))}
												class="flex-1"
												style="accent-color: var(--theme-primary);"
											/>
											<span class="text-xs w-8 text-right" style="color: var(--theme-text-muted);">100%</span>
										</div>
									</div>
									
									<!-- Position Input -->
									<div class="flex items-center gap-1">
										<input
											type="number"
											min="0"
											max="100"
											value={stop.position}
											oninput={(e) => updateStopPosition(stop.id, parseFloat(e.currentTarget.value) || 0)}
											class="w-16 text-xs px-2 py-1 rounded border text-center"
											style="border-color: var(--theme-border); background-color: var(--theme-input-bg); color: var(--theme-foreground);"
										/>
										<span class="text-xs" style="color: var(--theme-text-muted);">%</span>
									</div>
									
									<!-- Color Hex Display -->
									<div class="w-20">
										<code class="text-xs font-mono px-2 py-1 rounded" style="background-color: var(--theme-card-bg); color: var(--theme-foreground);">
											{stop.color}
										</code>
									</div>
									
									<!-- Remove Button -->
									{#if gradientStops.length > 2}
										<Button
											size="sm"
											variant="ghost"
											onclick={() => {
												removeGradientStop(stop.id);
												if (selectedStopId === stop.id) {
													selectedStopId = sortedStops.find(s => s.id !== stop.id)?.id || null;
												}
											}}
											class="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
											title="Delete stop"
										>
											<X class="size-3" />
										</Button>
									{/if}
									</div>
									{/each}
							</div>
						{/if}
					</div>
					
					<!-- Gradient Code Output -->
					<div class="pt-2 border-t" style="border-color: var(--theme-border);">
						<code class="block text-xs font-mono p-2 rounded break-all" style="background-color: var(--theme-section-bg); color: var(--theme-text-muted);">
							{gradientString}
						</code>
					</div>
				</CardContent>
			</Card>

			<!-- Design Override Tests -->
			<Card>
				<CardHeader>
					<CardTitle>Design Override Tests</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<p class="text-sm" style="color: var(--theme-text-muted);">
						Use this section to test components where design is being overridden to ensure theme variables work correctly.
					</p>
					
					<!-- Button Variants -->
					<div>
						<label class="block mb-2 text-sm font-medium" style="color: var(--theme-foreground);">Button Variants:</label>
						<div class="flex flex-wrap gap-2">
							<Button>Default</Button>
							<Button variant="secondary">Secondary</Button>
							<Button variant="outline">Outline</Button>
							<Button variant="ghost">Ghost</Button>
							<Button variant="destructive">Destructive</Button>
							<Button disabled>Disabled</Button>
						</div>
					</div>
					
					<!-- Input States -->
					<div>
						<label class="block mb-2 text-sm font-medium" style="color: var(--theme-foreground);">Input States:</label>
						<div class="space-y-2 max-w-md">
							<input
								type="text"
								placeholder="Normal input"
								class="w-full px-3 py-2 rounded-md border text-sm"
								style="background-color: var(--theme-input-bg); border-color: var(--theme-border); color: var(--theme-foreground);"
							/>
							<input
								type="text"
								placeholder="Focused input"
								class="w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2"
								style="background-color: var(--theme-input-bg); border-color: var(--theme-focus); color: var(--theme-foreground); focus-ring-color: var(--theme-focus);"
							/>
							<input
								type="text"
								placeholder="Disabled input"
								disabled
								class="w-full px-3 py-2 rounded-md border text-sm opacity-50"
								style="background-color: var(--theme-input-bg); border-color: var(--theme-border); color: var(--theme-foreground);"
							/>
						</div>
					</div>
					
					<!-- Card Variations -->
					<div>
						<label class="block mb-2 text-sm font-medium" style="color: var(--theme-foreground);">Card Variations:</label>
						<div class="grid grid-cols-3 gap-4">
							<Card>
								<CardContent class="p-4">
									<p class="text-sm" style="color: var(--theme-foreground);">Default Card</p>
								</CardContent>
							</Card>
							<div class="rounded-lg border p-4" style="background-color: var(--theme-section-bg); border-color: var(--theme-border);">
								<p class="text-sm" style="color: var(--theme-foreground);">Section Background</p>
							</div>
							<div class="rounded-lg border p-4" style="background-color: var(--theme-card-bg); border-color: var(--theme-border);">
								<p class="text-sm" style="color: var(--theme-foreground);">Card Background</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<!-- Debug Info -->
			<Card>
				<CardHeader>
					<CardTitle>Debug Info</CardTitle>
				</CardHeader>
				<CardContent>
					<pre class="p-4 rounded text-xs overflow-auto" style="background-color: var(--theme-section-bg); color: var(--theme-foreground);">
{JSON.stringify({
	colorValue,
	colorValue2,
	wrapperValue1,
	wrapperValue2,
	wrapperValue3,
	wrapperValueCallback,
	gradientString,
	gradientStops,
	gradientType,
	gradientDirection
}, null, 2)}
					</pre>
				</CardContent>
			</Card>
		</div>
	</div>
</div>

