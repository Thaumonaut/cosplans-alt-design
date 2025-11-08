/**
 * Drag and Drop Utilities
 * 
 * Native HTML5 drag-and-drop utilities for task manipulation.
 * Provides type-safe event handling and data transfer.
 */

export interface DragData {
	type: string;
	id: string;
	data?: any;
}

/**
 * Serialize data for drag transfer
 */
export function setDragData(event: DragEvent, data: DragData): void {
	if (!event.dataTransfer) return;
	
	event.dataTransfer.effectAllowed = 'move';
	event.dataTransfer.setData('application/json', JSON.stringify(data));
	
	// Set visual feedback
	if (event.dataTransfer.setDragImage && event.target instanceof HTMLElement) {
		const ghost = event.target.cloneNode(true) as HTMLElement;
		ghost.style.opacity = '0.5';
		document.body.appendChild(ghost);
		event.dataTransfer.setDragImage(ghost, 0, 0);
		setTimeout(() => document.body.removeChild(ghost), 0);
	}
}

/**
 * Deserialize data from drag transfer
 */
export function getDragData(event: DragEvent): DragData | null {
	if (!event.dataTransfer) return null;
	
	try {
		const json = event.dataTransfer.getData('application/json');
		return json ? JSON.parse(json) : null;
	} catch (error) {
		console.error('Failed to parse drag data:', error);
		return null;
	}
}

/**
 * Check if drag data matches expected type
 */
export function isDragType(event: DragEvent, expectedType: string): boolean {
	const data = getDragData(event);
	return data?.type === expectedType;
}

/**
 * Handle drag start
 */
export function handleDragStart(
	event: DragEvent,
	data: DragData,
	onStart?: (data: DragData) => void
): void {
	setDragData(event, data);
	
	if (event.target instanceof HTMLElement) {
		event.target.classList.add('dragging');
	}
	
	onStart?.(data);
}

/**
 * Handle drag end
 */
export function handleDragEnd(
	event: DragEvent,
	onEnd?: () => void
): void {
	if (event.target instanceof HTMLElement) {
		event.target.classList.remove('dragging');
	}
	
	// Remove any drag-over classes from drop zones
	document.querySelectorAll('.drag-over').forEach(el => {
		el.classList.remove('drag-over');
	});
	
	onEnd?.();
}

/**
 * Handle drag over (for drop zones)
 */
export function handleDragOver(
	event: DragEvent,
	acceptedTypes: string[],
	onValidDragOver?: (data: DragData) => void
): void {
	const data = getDragData(event);
	if (!data || !acceptedTypes.includes(data.type)) {
		return;
	}
	
	event.preventDefault();
	event.stopPropagation();
	
	// Find the drop zone element (the node that has the dropzone action)
	if (event.currentTarget instanceof HTMLElement) {
		event.currentTarget.classList.add('drag-over');
	}
	
	if (event.dataTransfer) {
		event.dataTransfer.dropEffect = 'move';
	}
	
	onValidDragOver?.(data);
}

/**
 * Handle drag leave (for drop zones)
 */
export function handleDragLeave(event: DragEvent): void {
	// Only remove drag-over class if we're leaving the drop zone itself, not just a child element
	if (event.currentTarget instanceof HTMLElement) {
		const rect = event.currentTarget.getBoundingClientRect();
		const x = event.clientX;
		const y = event.clientY;
		
		// Check if we're actually leaving the drop zone bounds
		if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
			event.currentTarget.classList.remove('drag-over');
		}
	}
}

/**
 * Handle drop
 */
export function handleDrop(
	event: DragEvent,
	acceptedTypes: string[],
	onDrop: (data: DragData) => void | Promise<void>
): void {
	event.preventDefault();
	event.stopPropagation();
	
	const data = getDragData(event);
	if (!data || !acceptedTypes.includes(data.type)) {
		return;
	}
	
	// Remove drag-over class from the drop zone
	if (event.currentTarget instanceof HTMLElement) {
		event.currentTarget.classList.remove('drag-over');
	}
	
	onDrop(data);
}

/**
 * Create drag handlers for a draggable element
 */
export function createDraggable(data: DragData, callbacks?: {
	onStart?: (data: DragData) => void;
	onEnd?: () => void;
}) {
	return {
		draggable: true,
		ondragstart: (event: DragEvent) => handleDragStart(event, data, callbacks?.onStart),
		ondragend: (event: DragEvent) => handleDragEnd(event, callbacks?.onEnd),
	};
}

/**
 * Create drag handlers for a drop zone
 */
export function createDropZone(
	acceptedTypes: string[],
	onDrop: (data: DragData) => void | Promise<void>,
	callbacks?: {
		onDragOver?: (data: DragData) => void;
	}
) {
	return {
		ondragover: (event: DragEvent) => handleDragOver(event, acceptedTypes, callbacks?.onDragOver),
		ondragleave: (event: DragEvent) => handleDragLeave(event),
		ondrop: (event: DragEvent) => handleDrop(event, acceptedTypes, onDrop),
	};
}

/**
 * Get drop position within a vertical list
 */
export function getDropPosition(
	event: DragEvent,
	container: HTMLElement
): { index: number; insertBefore: boolean } {
	const items = Array.from(container.children) as HTMLElement[];
	let index = items.length;
	let insertBefore = false;
	
	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		const rect = item.getBoundingClientRect();
		const midpoint = rect.top + rect.height / 2;
		
		if (event.clientY < midpoint) {
			index = i;
			insertBefore = true;
			break;
		}
	}
	
	return { index, insertBefore };
}

/**
 * Get drop column in a horizontal board view
 */
export function getDropColumn(
	event: DragEvent,
	container: HTMLElement
): number | null {
	const columns = Array.from(container.children) as HTMLElement[];
	
	for (let i = 0; i < columns.length; i++) {
		const column = columns[i];
		const rect = column.getBoundingClientRect();
		
		if (
			event.clientX >= rect.left &&
			event.clientX <= rect.right &&
			event.clientY >= rect.top &&
			event.clientY <= rect.bottom
		) {
			return i;
		}
	}
	
	return null;
}

/**
 * Svelte action for draggable elements
 */
export function draggable(node: HTMLElement, data: DragData) {
	node.draggable = true;
	
	const handleStart = (event: DragEvent) => handleDragStart(event, data);
	const handleEnd = (event: DragEvent) => handleDragEnd(event);
	
	node.addEventListener('dragstart', handleStart);
	node.addEventListener('dragend', handleEnd);
	
	return {
		destroy() {
			node.removeEventListener('dragstart', handleStart);
			node.removeEventListener('dragend', handleEnd);
		},
		update(newData: DragData) {
			data = newData;
		},
	};
}

/**
 * Svelte action for drop zones
 */
export function dropzone(
	node: HTMLElement,
	config: {
		acceptedTypes: string[];
		onDrop: (data: DragData) => void | Promise<void>;
		onDragOver?: (data: DragData) => void;
	}
) {
	const handleOver = (event: DragEvent) => handleDragOver(event, config.acceptedTypes, config.onDragOver);
	const handleLeave = (event: DragEvent) => handleDragLeave(event);
	const handleDropEvent = (event: DragEvent) => handleDrop(event, config.acceptedTypes, config.onDrop);
	
	node.addEventListener('dragover', handleOver);
	node.addEventListener('dragleave', handleLeave);
	node.addEventListener('drop', handleDropEvent);
	
	return {
		destroy() {
			node.removeEventListener('dragover', handleOver);
			node.removeEventListener('dragleave', handleLeave);
			node.removeEventListener('drop', handleDropEvent);
		},
		update(newConfig: typeof config) {
			config = newConfig;
		},
	};
}

