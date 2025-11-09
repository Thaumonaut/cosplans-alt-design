<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Slider } from '@svar-ui/svelte-core';
	import { Input, Label, Button } from '$lib/components/ui';
	import ColorisWrapper from '$lib/components/ui/coloris-wrapper.svelte';
	import { getVariableVariations, isBaseVariable, generateAllVariations, getBaseVariable } from '$lib/utils/theme-variations';
	import { Sparkles, Info, Palette, Layers, RotateCw, Plus, X, ChevronDown, ChevronUp, ArrowLeftRight, Maximize2, Minimize2 } from 'lucide-svelte';
	import { closeColorisPicker } from '$lib/utils/coloris';

	interface Props {
		varName: string;
		value: string;
		mode: 'light' | 'dark';
		autoGenerateVariations?: boolean;
		isVariationBroken?: boolean; // Whether this variation is manually overridden
	}

	let {
		varName,
		value = $bindable(),
		mode,
		autoGenerateVariations = false,
		isVariationBroken = false
	}: Props = $props();

	const dispatch = createEventDispatcher<{
		change: { varName: string; value: string };
		variationsGenerated: Record<string, string>;
		variationBroken: { varName: string }; // Emitted when a variation is manually changed
		variationRelinked: { varName: string }; // Emitted when a variation is relinked to base
		select: { varName: string };
	}>();

	let tempValue = $state(value);
	let colorMode = $state<'solid' | 'gradient'>('solid'); // Tab selection: solid or gradient
	
	// Gradient state
	let gradientType = $state<'linear' | 'radial'>('linear');
	let gradientDirection = $state('to right');
	let gradientAngle = $state(0);
	let gradientStops = $state<Array<{ id: string; color: string; position: number }>>([
		{ id: '1', color: '#000000', position: 0 },
		{ id: '2', color: '#ffffff', position: 100 }
	]);
	let draggingStop = $state<string | null>(null);
	let gradientBarRef = $state<HTMLDivElement | null>(null);
	let selectedStopId = $state<string | null>(null);
	let showDetailedStops = $state(false);
	let showDetailsPanel = $state(false); // Controls preview + detailed stops
	let stopColorPickerRefs = $state<Record<string, any>>({});
	let mouseDownPos = $state<{ x: number; y: number; stopId: string } | null>(null);
	const DRAG_THRESHOLD = 5;
	let isPreviewExpanded = $state(false);
	
	// Rotation dial state
	let angleDialRef = $state<HTMLDivElement | null>(null);
	let isDraggingDial = $state(false);
	let unwrappedAngle = $state(0);

	// Detect variable type - now uses both name and value
	const varType = $derived(() => {
		if (isPatternVariable(varName)) {
			// Pattern variables can be gradients or images
			if (isGradientValue(tempValue)) return 'gradient';
			// Could add image detection here later
			return 'pattern';
		}
		if (isGradientValue(tempValue)) return 'gradient';
		if (isColorVariable(varName, tempValue)) return 'color';
		if (isOpacityVariable(varName)) return 'opacity';
		if (isShadowVariable(varName)) return 'shadow';
		return 'text';
	});

	// Get variations for this variable
	const variations = $derived(getVariableVariations(varName));
	const hasVariations = $derived(variations.length > 0);
	const isBase = $derived(isBaseVariable(varName));
	
	// Check if this variable is a variation of another base variable
	const baseVar = $derived(getBaseVariable(varName));
	const isVariation = $derived(baseVar !== undefined);
	const supportsGradient = $derived(isBackgroundVariable(varName) || isPatternVariable(varName));

	function isNonColorVariable(name: string): boolean {
		// Variables that should NOT be color inputs
		const nonColorKeywords = [
			'radius', 'size', 'position', 'repeat', 'blend', 
			'opacity', 'blur', 'width', 'height', 'spacing',
			'gap', 'padding', 'margin', 'shadow-sm', 'shadow-md', 'shadow-lg'
		];
		return nonColorKeywords.some(keyword => name.includes(keyword));
	}
	
	function isColorVariable(name: string, value?: string): boolean {
		// First check if it's explicitly a non-color variable
		if (isNonColorVariable(name)) {
			return false;
		}
		
		// Check if the value looks like a color
		if (value) {
			const trimmed = value.trim().toLowerCase();
			// If it's already a color format, it's definitely a color
			if (trimmed.match(/^(#[0-9a-f]{3,8}|rgb|rgba|hsl|hsla|transparent)/)) {
				return true;
			}
			// If it's a gradient, it's a color
			if (trimmed.includes('gradient') || trimmed.includes('url(')) {
				return true;
			}
			// If it's a number or percentage (like "50%", "10px", "0.9"), it's NOT a color
			if (trimmed.match(/^[\d.]+(px|%|rem|em|deg|vh|vw)?$/)) {
				return false;
			}
		}
		
		// Check variable name patterns
		return name.includes('color') ||
			(name.includes('bg') && !name.includes('size') && !name.includes('position') && !name.includes('repeat') && !name.includes('blend')) ||
			(name.includes('background') && !name.includes('size') && !name.includes('position') && !name.includes('repeat') && !name.includes('blend')) ||
			name.includes('text') ||
			(name.includes('border') && !name.includes('radius')) ||
			name.includes('primary') ||
			name.includes('accent') ||
			name.includes('success') ||
			name.includes('error') ||
			name.includes('warning') ||
			name.includes('info') ||
			name.includes('foreground') ||
			name.includes('muted') ||
			name.includes('shadow-color') ||
			name.includes('hover') ||
			name.includes('active') ||
			name.includes('focus');
	}
	
	function isPatternVariable(name: string): boolean {
		// Pattern variables should use gradient builder or image input
		return name.includes('pattern') || name.includes('image');
	}

	function isBackgroundVariable(name: string): boolean {
		return name.includes('background') || name.includes('bg');
	}

	function isOpacityVariable(name: string): boolean {
		return name.includes('opacity');
	}

	function supportsAlpha(name: string, value: string): boolean {
		// Variables that should support opacity/alpha
		const alphaVariables = [
			'background', 'bg', 'overlay', 'modal', 'border', 
			'hover', 'active', 'focus', 'shadow-color', 'section',
			'card', 'content', 'input', 'sidebar', 'header'
		];
		
		// Check if variable name suggests it should support alpha
		const nameSupportsAlpha = alphaVariables.some(keyword => name.includes(keyword));
		
		// Also check if current value already has alpha (rgba/hsla)
		const valueHasAlpha = value && (value.includes('rgba') || value.includes('hsla'));
		
		return nameSupportsAlpha || valueHasAlpha;
	}
	
	function getPlaceholder(name: string, varType: string): string {
		// If there's a value, don't show placeholder
		if (tempValue && tempValue.trim()) {
			return '';
		}
		
		// Generate placeholder based on variable type and name
		if (varType === 'color' || isColorVariable(name)) {
			if (supportsAlpha(name, '')) {
				return 'rgba(128, 128, 128, 0.9)';
			}
			return '#808080';
		}
		
		if (varType === 'gradient' || isPatternVariable(name)) {
			return 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)';
		}
		
		if (varType === 'opacity') {
			return '0.9';
		}
		
		// Non-color variables - generate examples based on name
		if (name.includes('size')) {
			return 'cover';
		}
		if (name.includes('position')) {
			return 'center';
		}
		if (name.includes('repeat')) {
			return 'no-repeat';
		}
		if (name.includes('blend')) {
			return 'normal';
		}
		if (name.includes('radius')) {
			return '8px';
		}
		if (name.includes('blur')) {
			return '10px';
		}
		if (name.includes('shadow')) {
			return '0 2px 4px rgba(0, 0, 0, 0.1)';
		}
		if (name.includes('spacing') || name.includes('gap') || name.includes('padding') || name.includes('margin')) {
			return '8px';
		}
		
		// Default placeholder
		return 'Enter value...';
	}

	function isShadowVariable(name: string): boolean {
		return name.includes('shadow') && !name.includes('shadow-color');
	}

	function isGradientValue(val: string): boolean {
		if (!val) return false;
		return val.includes('gradient') || val.includes('linear-gradient') || val.includes('radial-gradient');
	}

	function parseGradient(gradientStr: string): { type: 'linear' | 'radial'; direction: string; angle: number; stops: Array<{ id: string; color: string; position: number }> } | null {
		if (!isGradientValue(gradientStr)) return null;

		const linearMatch = gradientStr.match(/linear-gradient\(([^)]+)\)/);
		const radialMatch = gradientStr.match(/radial-gradient\(([^)]+)\)/);

		if (linearMatch) {
			const parts = linearMatch[1].split(',').map(s => s.trim());
			const direction = parts[0];
			let angle = 0;
			if (direction.includes('deg')) {
				angle = parseFloat(direction) || 0;
			}
			const stops = parts.slice(1).map((stop, idx) => {
				const match = stop.match(/(.+?)\s+(\d+)%/);
				if (match) {
					return { id: (idx + 1).toString(), color: match[1].trim(), position: parseInt(match[2]) };
				}
				return { id: (idx + 1).toString(), color: stop.trim(), position: 0 };
			});
			return { type: 'linear', direction, angle, stops };
		}

		if (radialMatch) {
			const parts = radialMatch[1].split(',').map(s => s.trim());
			const stops = parts.map((stop, idx) => {
				const match = stop.match(/(.+?)\s+(\d+)%/);
				if (match) {
					return { id: (idx + 1).toString(), color: match[1].trim(), position: parseInt(match[2]) };
				}
				return { id: (idx + 1).toString(), color: stop.trim(), position: 0 };
			});
			return { type: 'radial', direction: 'circle', angle: 0, stops };
		}

		return null;
	}

	// Sorted gradient stops
	const sortedStops = $derived([...gradientStops].sort((a, b) => a.position - b.position));
	
	// Build gradient string for the bar (always linear horizontal)
	const gradientBarString = $derived.by(() => {
		const stopsStr = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ');
		return `linear-gradient(to right, ${stopsStr})`;
	});
	
	// Build actual gradient string (for preview and output)
	const gradientString = $derived.by(() => {
		const stopsStr = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ');
		if (gradientType === 'radial') {
			return `radial-gradient(circle, ${stopsStr})`;
		}
		if (gradientDirection.includes('deg')) {
			return `linear-gradient(${gradientAngle}deg, ${stopsStr})`;
		}
		return `linear-gradient(${gradientDirection}, ${stopsStr})`;
	});

	function handleValueChange(newValue: string) {
		// Validate the new value before proceeding
		if (newValue && (newValue.includes('NaN') || newValue.includes('undefined') || newValue.includes('null'))) {
			console.warn(`[VariableEditor] Invalid value detected for ${varName}:`, newValue);
			return; // Don't update if value is invalid
		}
		
		tempValue = newValue;
		value = newValue;
		dispatch('change', { varName, value: newValue });

		// If this is a variation being manually changed, mark it as broken
		if (isVariation && baseVar) {
			// Mark this variation as broken (manually overridden)
			dispatch('variationBroken', { varName });
		}

		// Auto-generate variations if enabled and this is a base variable
		// Only generate if the value is valid and not a variation itself
		// IMPORTANT: Don't generate variations if this variable is itself a variation of another base
		if (autoGenerateVariations && isBase && !isVariation && isColorVariable(varName, newValue) && !isGradientValue(newValue) && newValue && newValue.trim()) {
			try {
				const generated = generateAllVariations(varName, newValue, mode);
				// Validate generated variations before dispatching
				const validGenerated: Record<string, string> = {};
				for (const [key, val] of Object.entries(generated)) {
					if (val && !val.includes('NaN') && !val.includes('undefined') && !val.includes('null')) {
						validGenerated[key] = val;
					} else {
						console.warn(`[VariableEditor] Skipping invalid variation ${key}:`, val);
					}
				}
				if (Object.keys(validGenerated).length > 0) {
					dispatch('variationsGenerated', validGenerated);
				}
			} catch (error) {
				console.error(`[VariableEditor] Failed to generate variations for ${varName}:`, error);
			}
		}
	}
	
	// Function to relink variation to base
	function relinkVariation() {
		if (!baseVar || !isVariation) return;
		// Dispatch event to request relinking - parent will handle regeneration
		dispatch('variationRelinked', { varName });
	}

	function handleColorChange(ev: CustomEvent<string> | { value: string }) {
		const value = typeof ev === 'object' && 'detail' in ev ? ev.detail : ev.value;
		handleValueChange(value);
	}

	function handleOpacityChange(ev: { value: number }) {
		handleValueChange(ev.value.toString());
	}

	function handleGradientChange() {
		const gradientStr = gradientString;
		handleValueChange(gradientStr);
	}

	function addGradientStop() {
		const newStop = {
			id: Date.now().toString(),
			color: '#808080',
			position: 50
		};
		gradientStops = [...gradientStops, newStop];
		handleGradientChange();
	}

	function removeGradientStop(id: string) {
		if (gradientStops.length > 2) {
			gradientStops = gradientStops.filter(s => s.id !== id);
			if (selectedStopId === id) {
				selectedStopId = sortedStops.find(s => s.id !== id)?.id || null;
			}
			handleGradientChange();
		}
	}

	function updateStopColor(id: string, color: string) {
		if (!color) return;
		gradientStops = gradientStops.map(s => s.id === id ? { ...s, color } : s);
		handleGradientChange();
	}

	function updateStopPosition(id: string, position: number) {
		const clampedPosition = Math.max(0, Math.min(100, position));
		gradientStops = gradientStops.map(s => s.id === id ? { ...s, position: clampedPosition } : s);
		handleGradientChange();
	}

	function handleGradientBarClick(e: MouseEvent) {
		if (!gradientBarRef) return;
		const rect = gradientBarRef.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const percentage = Math.round((x / rect.width) * 100);
		const clampedPercentage = Math.max(0, Math.min(100, percentage));
		const newStop = {
			id: Date.now().toString(),
			color: '#000000',
			position: clampedPercentage
		};
		gradientStops = [...gradientStops, newStop];
		selectedStopId = newStop.id;
		handleGradientChange();
	}

	function handleStopDrag(e: MouseEvent, stopId: string) {
		if (!gradientBarRef) return;
		e.preventDefault();
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
		
		function onDocumentMouseMove(moveEvent: MouseEvent) {
			if (!mouseDownPos || mouseDownPos.stopId !== stopId || draggingStop) return;
			const deltaX = Math.abs(moveEvent.clientX - mouseDownPos.x);
			const deltaY = Math.abs(moveEvent.clientY - mouseDownPos.y);
			const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
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
			if (distance < DRAG_THRESHOLD && !draggingStop) {
				async function openStopColorPicker(stopId: string) {
					const ref = stopColorPickerRefs[stopId];
					if (ref && typeof ref.openPicker === 'function') {
						await ref.openPicker();
					}
				}
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
		let normalizedAngle = angle % 360;
		if (normalizedAngle < 0) normalizedAngle += 360;
		gradientAngle = normalizedAngle;
		gradientDirection = `${normalizedAngle}deg`;
		handleGradientChange();
	}

	function handleDialMouseDown(e: MouseEvent) {
		if (!angleDialRef) return;
		e.preventDefault();
		isDraggingDial = true;
		const startY = e.clientY;
		const startAngle = gradientAngle;
		unwrappedAngle = startAngle;
		const sensitivity = 1.5;
		let cumulativeDeltaY = 0;
		let lastClientY = startY;
		const element = angleDialRef;
		if (element && element.requestPointerLock) {
			element.requestPointerLock();
		}
		
		function onMouseMove(moveEvent: MouseEvent) {
			if (!isDraggingDial) return;
			let deltaY: number;
			if (document.pointerLockElement === element && moveEvent.movementY !== undefined) {
				deltaY = -moveEvent.movementY;
				cumulativeDeltaY += deltaY;
			} else {
				deltaY = lastClientY - moveEvent.clientY;
				lastClientY = moveEvent.clientY;
				cumulativeDeltaY += deltaY;
			}
			const angleDelta = cumulativeDeltaY * sensitivity;
			unwrappedAngle = startAngle + angleDelta;
			let normalizedAngle = unwrappedAngle % 360;
			if (normalizedAngle < 0) normalizedAngle += 360;
			gradientAngle = normalizedAngle;
			gradientDirection = `${normalizedAngle}deg`;
			handleGradientChange();
		}
		
		function onMouseUp() {
			isDraggingDial = false;
			if (document.exitPointerLock) {
				document.exitPointerLock();
			}
			let finalAngle = unwrappedAngle % 360;
			if (finalAngle < 0) finalAngle += 360;
			unwrappedAngle = finalAngle;
			updateAngle(finalAngle);
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
			document.removeEventListener('pointerlockchange', onPointerLockChange);
			document.removeEventListener('pointerlockerror', onPointerLockError);
		}
		
		function onPointerLockChange() {
			if (!document.pointerLockElement && isDraggingDial) {
				onMouseUp();
			}
		}
		
		function onPointerLockError() {
			console.warn('Pointer lock failed, using normal mouse tracking');
		}
		
		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
		document.addEventListener('pointerlockchange', onPointerLockChange);
		document.addEventListener('pointerlockerror', onPointerLockError);
	}

	function invertGradient() {
		gradientStops = gradientStops.map(stop => ({
			...stop,
			position: 100 - stop.position
		})).reverse();
		handleGradientChange();
	}

	const selectedStop = $derived(gradientStops.find(s => s.id === selectedStopId) || sortedStops[0]);
	
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

	// Sync tempValue with value prop and initialize state
	$effect(() => {
		tempValue = value;
		
		// Determine if we should show gradient or solid
		if (isGradientValue(value)) {
			colorMode = 'gradient';
			const parsed = parseGradient(value);
			if (parsed) {
				gradientType = parsed.type;
				gradientDirection = parsed.direction;
				gradientAngle = parsed.angle || 0;
				if (parsed.direction.includes('deg')) {
					gradientAngle = parsed.angle || parseFloat(parsed.direction) || 0;
				}
				gradientStops = parsed.stops;
			}
		} else if (isPatternVariable(varName)) {
			// Pattern variables default to solid (text/image mode)
			colorMode = 'solid';
		} else if (isColorVariable(varName, value) && supportsGradient) {
			// For color variables that support gradients, default to solid
			colorMode = 'solid';
		}
	});
</script>

<div class="variable-editor-row p-2.5 rounded-md border transition-colors" style="border-color: var(--theme-border); background-color: var(--theme-card-bg);">
	<!-- Variable Name -->
	<div class="mb-2">
		<div class="flex items-center gap-1.5 mb-0.5">
			<code 
				class="text-xs font-mono cursor-pointer hover:underline transition-all" 
				style="color: var(--theme-primary);"
				onclick={() => dispatch('select', { varName })}
				title="Click to highlight usage in preview"
			>{varName.replace('--theme-', '')}</code>
			{#if isBase}
				<Sparkles class="size-3" style="color: var(--theme-accent);" title="Base variable with variations" />
			{/if}
			{#if isVariation && isVariationBroken}
				<Button
					size="sm"
					variant="outline"
					onclick={relinkVariation}
					class="h-6 px-2 text-xs ml-auto"
					title="Relink to base variable ({baseVar})"
				>
					<ArrowLeftRight class="size-3 mr-1" />
					Relink
				</Button>
			{/if}
		</div>
		{#if hasVariations}
			<div class="flex items-center gap-1 text-xs" style="color: var(--theme-text-muted);">
				<Info class="size-2.5" />
				<span>Affects {variations.length} related variable{variations.length !== 1 ? 's' : ''}</span>
			</div>
		{/if}
		{#if isVariation && isVariationBroken}
			<div class="flex items-center gap-1 text-xs" style="color: var(--theme-warning);">
				<Info class="size-2.5" />
				<span>Manually overridden - not linked to {baseVar?.replace('--theme-', '')}</span>
			</div>
		{/if}
	</div>

	<!-- Value Editor -->
	<div class="space-y-2">
		{#if isColorVariable(varName, tempValue) && supportsGradient}
			<!-- Tab Selection: Solid or Gradient -->
			<div class="flex items-center gap-1 border rounded-md p-1" style="border-color: var(--theme-border);">
				<Button
					size="sm"
					variant={colorMode === 'solid' ? 'default' : 'ghost'}
					onclick={() => {
						colorMode = 'solid';
						if (isGradientValue(tempValue)) {
							// Extract first color from gradient or use default
							const parsed = parseGradient(tempValue);
							const firstColor = parsed?.stops[0]?.color || tempValue.split(',')[0] || '#000000';
							handleValueChange(firstColor);
						}
					}}
					class="h-7 px-2 text-xs"
				>
					<Palette class="size-3 mr-1" />
					Solid
				</Button>
				<Button
					size="sm"
					variant={colorMode === 'gradient' ? 'default' : 'ghost'}
					onclick={() => {
						colorMode = 'gradient';
						if (!isGradientValue(tempValue)) {
							// Convert solid color to gradient
							const solidColor = tempValue || '#000000';
							gradientStops = [
								{ id: '1', color: solidColor, position: 0 },
								{ id: '2', color: solidColor, position: 100 }
							];
							handleGradientChange();
						}
					}}
					class="h-7 px-2 text-xs"
				>
					<Layers class="size-3 mr-1" />
					Gradient
				</Button>
			</div>
		{/if}
		
		{#if (isColorVariable(varName, tempValue) && supportsGradient && colorMode === 'gradient') || (varType === 'gradient') || (isPatternVariable(varName) && colorMode === 'gradient')}
			<!-- New Gradient Builder UI -->
			<div class="space-y-2 p-2 rounded border" style="border-color: var(--theme-border); background-color: var(--theme-section-bg);">
				<!-- Top Row: Controls (no preview by default) -->
				<div class="flex items-center gap-2 flex-wrap">
					<!-- Type Toggle -->
					<div class="flex items-center gap-0.5 border rounded-md p-0.5" style="border-color: var(--theme-border);">
						<Button
							size="sm"
							variant={gradientType === 'linear' ? 'default' : 'ghost'}
							onclick={() => {
								gradientType = 'linear';
								handleGradientChange();
							}}
							class="h-6 px-1.5 text-xs"
						>
							Linear
						</Button>
						<Button
							size="sm"
							variant={gradientType === 'radial' ? 'default' : 'ghost'}
							onclick={() => {
								gradientType = 'radial';
								handleGradientChange();
							}}
							class="h-6 px-1.5 text-xs"
						>
							Radial
						</Button>
					</div>
					
					<!-- Angle Control (for linear) -->
					{#if gradientType === 'linear'}
						<div class="flex items-center gap-1.5">
							<RotateCw class="size-3.5" style="color: var(--theme-text-muted);" />
							<div class="relative flex items-center gap-1">
								<div
									bind:this={angleDialRef}
									class="relative w-10 h-10 rounded-full border-2 cursor-grab active:cursor-grabbing transition-all hover:scale-105"
									style="border-color: var(--theme-border); background-color: var(--theme-section-bg);"
									onmousedown={handleDialMouseDown}
									title="Drag to rotate (0-360°)"
								>
									<div
										class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
										style="background-color: var(--theme-foreground);"
									></div>
									<div
										class="absolute top-1/2 left-1/2 w-0.5 origin-bottom {isDraggingDial ? '' : 'transition-transform duration-75'}"
										style="height: 40%; transform: translate(-50%, -100%) rotate({(isDraggingDial ? unwrappedAngle : gradientAngle) - 90}deg); background-color: var(--theme-primary);"
									></div>
									<div
										class="absolute top-full left-1/2 -translate-x-1/2 mt-0.5 text-[10px] font-mono leading-tight"
										style="color: var(--theme-text-muted);"
									>
										{Math.round(gradientAngle)}°
									</div>
								</div>
							</div>
						</div>
					{/if}
					
					<!-- Invert Button -->
					<Button
						size="sm"
						variant="outline"
						onclick={invertGradient}
						class="h-6 px-1.5 text-xs"
						title="Invert gradient"
					>
						<ArrowLeftRight class="size-3" />
					</Button>
					
					<!-- Add Stop Button -->
					<Button size="sm" variant="outline" onclick={addGradientStop} class="h-6 px-1.5 text-xs" title="Add stop">
						<Plus class="size-3" />
					</Button>
				</div>
				
				<!-- Gradient Bar with Handles -->
				<div class="space-y-2">
					<div class="flex items-center gap-1.5">
						<div class="relative flex-1">
							<!-- Stop Handles -->
							<div class="relative h-6 w-full">
								{#each sortedStops as stop (stop.id)}
									{@const stopId = stop.id}
									<div
										class="absolute -translate-x-1/2 {selectedStopId === stopId ? 'z-10' : 'z-0'}"
										style="left: {stop.position}%;"
									>
										<div class="absolute opacity-0 pointer-events-none">
											<ColorisWrapper
												bind:this={stopColorPickerRefs[stopId]}
												value={stop.color}
												id={`gradient-stop-${stopId}`}
												alpha={true}
												onchange={(color) => {
													if (color) {
														updateStopColor(stop.id, color);
													}
												}}
											/>
										</div>
										<div class="relative">
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
												class="w-4 h-4 rounded-full border-2 shadow-sm transition-all {selectedStopId === stopId ? 'border-primary ring-1 ring-primary/50' : 'border-gray-300 dark:border-gray-600'}"
												style="background-color: {stop.color};"
											></div>
										</div>
										<div
											class="w-0.5 h-2 mx-auto mt-0.5 {selectedStopId === stopId ? 'bg-primary' : 'bg-gray-400 dark:bg-gray-500'}"
										></div>
										</div>
										{#if selectedStopId === stopId && gradientStops.length > 2}
											<button
												type="button"
												onclick={(e) => {
													e.stopPropagation();
													removeGradientStop(stopId);
													selectedStopId = sortedStops.find(s => s.id !== stopId)?.id || null;
												}}
												class="absolute -top-5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-sm transition-colors z-20"
												title="Delete stop (or right-click)"
											>
												<X class="size-2.5" />
											</button>
										{/if}
									</div>
								{/each}
							</div>
							<!-- Gradient Bar -->
							<div
								bind:this={gradientBarRef}
								class="relative h-8 rounded border cursor-crosshair"
								style="background: {gradientBarString}; border-color: var(--theme-border);"
								onclick={handleGradientBarClick}
							></div>
						</div>
					</div>
					
					<!-- More Details Button (shows preview + detailed stops) -->
					<Button
						size="sm"
						variant="ghost"
						onclick={() => {
							showDetailsPanel = !showDetailsPanel;
							// Show detailed stops by default when opening details panel
							if (showDetailsPanel && !showDetailedStops) {
								showDetailedStops = true;
							}
						}}
						class="w-full h-7 text-xs justify-center"
						title={showDetailsPanel ? 'Hide details' : 'Show preview and detailed controls'}
					>
						{#if showDetailsPanel}
							<ChevronUp class="size-3 mr-1" />
						{:else}
							<ChevronDown class="size-3 mr-1" />
						{/if}
						More Details
					</Button>
					
					<!-- Details Panel: Preview + Detailed Stops -->
					{#if showDetailsPanel}
						<div class="pt-2 border-t space-y-3" style="border-color: var(--theme-border);">
							<!-- Preview Section -->
							<div class="flex items-center justify-center">
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
										class="relative w-full max-w-md h-20 rounded border overflow-hidden transition-all hover:shadow-sm group"
										style="border-color: var(--theme-border); background: {gradientString};"
										title="Expand preview"
									>
										<div class="absolute inset-0 flex items-center justify-center bg-background/0 group-hover:bg-background/5 transition-colors">
											<Maximize2 class="size-4 opacity-0 group-hover:opacity-100 transition-opacity" style="color: var(--theme-foreground);" />
										</div>
									</button>
								{/if}
							</div>
							
							<!-- Detailed Stops Section -->
							<div class="space-y-2">
								<div class="flex items-center justify-between">
									<Label class="text-xs font-medium">Color Stops ({gradientStops.length})</Label>
									<Button
										size="sm"
										variant="ghost"
										onclick={() => showDetailedStops = !showDetailedStops}
										class="h-6 px-2 text-xs"
										title={showDetailedStops ? 'Hide color stops' : 'Show color stops'}
									>
										{#if showDetailedStops}
											<ChevronUp class="size-3 mr-1" />
										{:else}
											<ChevronDown class="size-3 mr-1" />
										{/if}
										{showDetailedStops ? 'Hide' : 'Show'}
									</Button>
								</div>
								
								{#if showDetailedStops}
									<div class="space-y-1.5 max-h-64 overflow-y-auto">
										{#each sortedStops as stop (stop.id)}
											{@const stopId = stop.id}
											<div class="flex items-center gap-1.5 p-1.5 rounded border {selectedStopId === stopId ? 'border-primary bg-primary/5' : ''}" style="border-color: var(--theme-border); background-color: var(--theme-section-bg);">
												<!-- Color Picker -->
												<ColorisWrapper
													value={stop.color}
													alpha={true}
													onchange={(color) => {
														if (color) {
															updateStopColor(stop.id, color);
														}
													}}
												/>
												
												<!-- Position Slider -->
												<div class="flex-1 min-w-0">
													<div class="flex items-center gap-1">
														<span class="text-[10px] w-6 shrink-0" style="color: var(--theme-text-muted);">0%</span>
														<input
															type="range"
															min="0"
															max="100"
															step="1"
															value={stop.position}
															oninput={(e) => updateStopPosition(stop.id, parseFloat(e.currentTarget.value))}
															class="flex-1 min-w-0"
															style="accent-color: var(--theme-primary);"
														/>
														<span class="text-[10px] w-6 shrink-0 text-right" style="color: var(--theme-text-muted);">100%</span>
													</div>
												</div>
												
												<!-- Position Input -->
												<div class="flex items-center gap-0.5 shrink-0">
													<input
														type="number"
														min="0"
														max="100"
														value={stop.position}
														oninput={(e) => updateStopPosition(stop.id, parseFloat(e.currentTarget.value) || 0)}
														class="w-12 text-xs px-1 py-0.5 rounded border text-center"
														style="border-color: var(--theme-border); background-color: var(--theme-input-bg); color: var(--theme-foreground);"
													/>
													<span class="text-[10px] shrink-0" style="color: var(--theme-text-muted);">%</span>
												</div>
												
												<!-- Color Code (compact) -->
												<code class="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 max-w-[80px] truncate" style="background-color: var(--theme-card-bg); color: var(--theme-foreground);" title={stop.color}>
													{stop.color}
												</code>
												
												<!-- Delete Button -->
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
														class="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 shrink-0"
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
						</div>
					{/if}
				</div>
			</div>
		{:else if isPatternVariable(varName) && !isGradientValue(tempValue) && colorMode === 'solid'}
			<!-- Pattern variable - show text input with option to switch to gradient -->
			<div class="space-y-3 p-3 rounded border" style="border-color: var(--theme-border); background-color: var(--theme-section-bg);">
				<div class="flex items-center gap-2">
					<Label class="text-xs">Pattern Type:</Label>
					<div class="flex items-center gap-1 border rounded-md p-1" style="border-color: var(--theme-border);">
						<Button
							size="sm"
							variant={colorMode === 'solid' ? 'default' : 'ghost'}
							onclick={() => colorMode = 'solid'}
							class="h-7 px-2 text-xs"
						>
							Text/Image
						</Button>
						<Button
							size="sm"
							variant={colorMode === 'gradient' ? 'default' : 'ghost'}
							onclick={() => {
								colorMode = 'gradient';
								if (!isGradientValue(tempValue)) {
									const solidColor = tempValue || '#000000';
									gradientStops = [
										{ id: '1', color: solidColor, position: 0 },
										{ id: '2', color: solidColor, position: 100 }
									];
									handleGradientChange();
								}
							}}
							class="h-7 px-2 text-xs"
						>
							<Layers class="size-3 mr-1" />
							Gradient
						</Button>
					</div>
				</div>
				{#if colorMode === 'solid'}
				<Input
					type="text"
					bind:value={tempValue}
					onchange={(e) => handleValueChange(e.currentTarget.value)}
					class="flex-1 text-xs"
					placeholder={getPlaceholder(varName, 'pattern') || 'linear-gradient(...) or url(...)'}
				/>
				{/if}
			</div>
		{:else if (isColorVariable(varName, tempValue) && (!supportsGradient || colorMode === 'solid'))}
			<!-- Solid Color Editor -->
			<div class="flex items-center gap-2">
				<ColorisWrapper
					value={tempValue || '#000000'}
					alpha={supportsAlpha(varName, tempValue)}
					onchange={(newValue) => {
						if (newValue) {
							handleValueChange(newValue);
						}
					}}
				/>
				<Input
					type="text"
					bind:value={tempValue}
					onchange={(e) => handleValueChange(e.currentTarget.value)}
					class="flex-1 text-xs"
					placeholder={getPlaceholder(varName, 'color') || '#808080'}
				/>
			</div>
		{:else if varType === 'opacity'}
			{@const opacityValue = parseFloat(tempValue) || 0}
			<!-- Opacity Slider -->
			<div class="flex items-center gap-2">
				<Slider
					min={0}
					max={1}
					step={0.01}
					value={opacityValue}
					onchange={(ev) => {
						const newValue = (ev as any)?.detail || (ev as any)?.value || opacityValue;
						handleOpacityChange({ value: typeof newValue === 'number' ? newValue : parseFloat(newValue) || 0 });
					}}
					width="100%"
				/>
				<Input
					type="number"
					min="0"
					max="1"
					step="0.01"
					bind:value={tempValue}
					onchange={(e) => handleValueChange(e.currentTarget.value)}
					class="w-20 text-xs"
					placeholder={getPlaceholder(varName, 'opacity') || '0.9'}
				/>
			</div>
		{:else if isColorVariable(varName, tempValue)}
			<!-- Color Editor (for non-gradient color variables) -->
			<div class="flex items-center gap-2">
				<ColorisWrapper
					value={tempValue || '#000000'}
					alpha={supportsAlpha(varName, tempValue)}
					onchange={(newValue) => {
						if (newValue) {
							handleValueChange(newValue);
						}
					}}
				/>
				<Input
					type="text"
					bind:value={tempValue}
					onchange={(e) => handleValueChange(e.currentTarget.value)}
					class="flex-1 text-xs"
					placeholder={getPlaceholder(varName, 'color') || '#808080'}
				/>
			</div>
		{:else}
			<!-- Text Input -->
			<Input
				type="text"
				bind:value={tempValue}
				onchange={(e) => handleValueChange(e.currentTarget.value)}
				class="flex-1 text-xs"
				placeholder={getPlaceholder(varName, varType)}
			/>
		{/if}
	</div>
</div>

<style>
	.variable-editor-row {
		cursor: pointer;
	}
</style>
