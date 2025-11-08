/**
 * Shopify Draggable Wrapper for Svelte 5
 * 
 * Provides Svelte 5-compatible actions and utilities for using @shopify/draggable
 * Dynamically loads on client-side only to avoid SSR issues
 */

import { browser } from '$app/environment';

export interface SortableConfig {
	onSort?: (event: { oldIndex: number; newIndex: number; element: HTMLElement; container: HTMLElement }) => void | Promise<void>;
	onStart?: (event: { element: HTMLElement }) => void;
	onStop?: (event: { element: HTMLElement }) => void;
	handle?: string;
	disabled?: boolean;
	animation?: number;
	dragClass?: string;
	ghostClass?: string;
	chosenClass?: string;
	filter?: string;
	swapThreshold?: number;
	invertSwap?: boolean;
	invertedSwapThreshold?: number;
	direction?: 'vertical' | 'horizontal';
	removeOnSpill?: boolean;
	preventOnFilter?: boolean;
	// For multiple containers (e.g., kanban boards)
	containers?: HTMLElement[];
	// Custom draggable selector (defaults to '.draggable-item')
	draggable?: string;
}

// Lazy-loaded types
type SortableType = typeof import('@shopify/draggable').Sortable;
type DraggableType = typeof import('@shopify/draggable').Draggable;
type DroppableType = typeof import('@shopify/draggable').Droppable;

let SortableClass: SortableType | null = null;
let DraggableClass: DraggableType | null = null;
let DroppableClass: DroppableType | null = null;

// Load draggable library dynamically
async function loadDraggable() {
	if (!browser) return;
	
	if (!SortableClass) {
		try {
			const draggableModule = await import('@shopify/draggable');
			SortableClass = draggableModule.Sortable as any;
			DraggableClass = draggableModule.Draggable as any;
			DroppableClass = draggableModule.Droppable as any;
		} catch (error) {
			console.error('Failed to load @shopify/draggable:', error);
		}
	}
}

/**
 * Svelte 5 action for sortable lists
 */
export function sortable(node: HTMLElement, config: SortableConfig = {}) {
	let sortableInstance: any = null;
	let isInitializing = false;

	function initialize() {
		if (!browser || config.disabled || isInitializing) return;
		
		isInitializing = true;
		
		// Load and initialize asynchronously
		loadDraggable().then(() => {
			if (!SortableClass || !browser) {
				isInitializing = false;
				return;
			}

			const containers = config.containers || [node];
			const options: any = {
				draggable: config.draggable || '.draggable-item',
				...(config.handle && { handle: config.handle }),
				...(config.swapThreshold !== undefined && { swapThreshold: config.swapThreshold }),
				...(config.invertSwap !== undefined && { invertSwap: config.invertSwap }),
				...(config.invertedSwapThreshold !== undefined && { invertedSwapThreshold: config.invertedSwapThreshold }),
				...(config.direction && { direction: config.direction }),
				...(config.removeOnSpill !== undefined && { removeOnSpill: config.removeOnSpill }),
				...(config.preventOnFilter !== undefined && { preventOnFilter: config.preventOnFilter }),
				...(config.dragClass && { dragClass: config.dragClass }),
				...(config.ghostClass && { ghostClass: config.ghostClass }),
				...(config.chosenClass && { chosenClass: config.chosenClass }),
				...(config.filter && { filter: config.filter }),
			};
			
			sortableInstance = new SortableClass(containers, options);

			if (config.onSort) {
				// Track the original index when drag starts
				let startIndex: number | null = null;
				let draggedElement: HTMLElement | null = null;
				
				// Listen to start event to capture initial position
				sortableInstance.on('sortable:start', (event: any) => {
					const source = event.data?.dragEvent?.data?.source || event.data?.source || event.source;
					const container = event.data?.dragEvent?.data?.container || event.data?.container || node;
					
					if (source && container) {
						draggedElement = source as HTMLElement;
						const children = Array.from(container.children).filter((child: any) => 
							child.classList.contains(config.draggable?.replace('.', '') || 'draggable-item')
						);
						startIndex = children.indexOf(draggedElement);
						console.log('[draggable] Drag started:', { startIndex, element: draggedElement });
					}
				});
				
				// Listen to stop event to get final position
				sortableInstance.on('sortable:stop', (event: any) => {
					if (startIndex === null || !draggedElement) {
						console.warn('[draggable] No start index or element, cannot determine sort');
						return;
					}
					
					const container = event.data?.dragEvent?.data?.container || event.data?.container || node;
					
					if (container && draggedElement) {
						// Calculate new index from DOM position
						const children = Array.from(container.children).filter((child: any) => 
							child.classList.contains(config.draggable?.replace('.', '') || 'draggable-item')
						);
						const newIndex = children.indexOf(draggedElement);
						
						console.log('[draggable] Drag stopped:', { 
							startIndex, 
							newIndex, 
							changed: startIndex !== newIndex,
							childrenCount: children.length
						});
						
						if (startIndex !== newIndex && newIndex >= 0) {
							const source = event.data?.dragEvent?.data?.source || event.data?.source || draggedElement;
							config.onSort?.({
								oldIndex: startIndex,
								newIndex: newIndex,
								element: source as HTMLElement,
								container: container as HTMLElement,
							});
						}
						
						// Reset tracking
						startIndex = null;
						draggedElement = null;
					}
				});
			}

			if (config.onStart) {
				sortableInstance.on('sortable:start', (event: any) => {
					config.onStart?.({
						element: event.data?.dragEvent?.data?.source || event.data?.source || event.source as HTMLElement,
					});
				});
			}

			if (config.onStop) {
				sortableInstance.on('sortable:stop', (event: any) => {
					config.onStop?.({
						element: event.data?.dragEvent?.data?.source || event.data?.source || event.source as HTMLElement,
					});
				});
			}
			
			isInitializing = false;
		}).catch((error) => {
			console.error('Failed to initialize Sortable:', error);
			isInitializing = false;
		});
	}

	function destroy() {
		if (sortableInstance) {
			sortableInstance.destroy();
			sortableInstance = null;
		}
		isInitializing = false;
	}

	initialize();

	return {
		update(newConfig: SortableConfig) {
			config = newConfig;
			destroy();
			initialize();
		},
		destroy,
	};
}

export interface DroppableConfig {
	onDrop?: (event: { dragEvent: { source: HTMLElement; over: HTMLElement | null } }) => void | Promise<void>;
	onDroppableStart?: (event: { element: HTMLElement }) => void;
	onDroppableStop?: (event: { element: HTMLElement }) => void;
	dropzone?: string;
	disabled?: boolean;
}

/**
 * Svelte 5 action for drop zones (for dragging between containers)
 */
export function droppable(node: HTMLElement, config: DroppableConfig = {}) {
	let droppableInstance: any = null;
	let isInitializing = false;

	function initialize() {
		if (!browser || config.disabled || isInitializing) return;
		
		isInitializing = true;
		
		loadDraggable().then(() => {
			if (!DroppableClass || !browser) {
				isInitializing = false;
				return;
			}

			droppableInstance = new DroppableClass(node, {
				dropzone: config.dropzone ?? '.droppable',
			});

			if (config.onDrop) {
				droppableInstance.on('droppable:dropped', (event: any) => {
					config.onDrop?.({
						dragEvent: {
							source: event.data.dragEvent.data.source as HTMLElement,
							over: event.data.dragEvent.data.over as HTMLElement | null,
						},
					});
				});
			}

			if (config.onDroppableStart) {
				droppableInstance.on('droppable:start', (event: any) => {
					config.onDroppableStart?.({
						element: event.data.dragEvent.data.source as HTMLElement,
					});
				});
			}

			if (config.onDroppableStop) {
				droppableInstance.on('droppable:stop', (event: any) => {
					config.onDroppableStop?.({
						element: event.data.dragEvent.data.source as HTMLElement,
					});
				});
			}
			
			isInitializing = false;
		}).catch((error) => {
			console.error('Failed to initialize Droppable:', error);
			isInitializing = false;
		});
	}

	function destroy() {
		if (droppableInstance) {
			droppableInstance.destroy();
			droppableInstance = null;
		}
	}

	initialize();

	return {
		update(newConfig: DroppableConfig) {
			config = newConfig;
			destroy();
			initialize();
		},
		destroy,
	};
}

/**
 * Svelte 5 action for draggable elements (for dragging to droppable zones)
 */
export function draggable(node: HTMLElement, config: { disabled?: boolean } = {}) {
	let draggableInstance: any = null;
	let isInitializing = false;

	function initialize() {
		if (!browser || config.disabled || isInitializing) return;
		
		isInitializing = true;
		
		loadDraggable().then(() => {
			if (!DraggableClass || !browser) {
				isInitializing = false;
				return;
			}

			draggableInstance = new DraggableClass([node]);
			
			isInitializing = false;
		}).catch((error) => {
			console.error('Failed to initialize Draggable:', error);
			isInitializing = false;
		});
	}

	function destroy() {
		if (draggableInstance) {
			draggableInstance.destroy();
			draggableInstance = null;
		}
	}

	initialize();

	return {
		update(newConfig: { disabled?: boolean }) {
			config = newConfig;
			destroy();
			initialize();
		},
		destroy,
	};
}

