/**
 * Drag and Drop Utilities
 * Feature: 003-modern-task-ui
 * Purpose: Helper functions for native HTML5 drag-and-drop operations
 */

export interface DragData {
  type: string
  id: string
  data?: Record<string, any>
}

/**
 * Create drag data string for dataTransfer
 */
export function createDragData(type: string, id: string, data?: Record<string, any>): string {
  const dragData: DragData = { type, id, data }
  return JSON.stringify(dragData)
}

/**
 * Parse drag data from dataTransfer
 */
export function parseDragData(dataTransferData: string): DragData | null {
  try {
    const parsed = JSON.parse(dataTransferData)
    if (parsed && typeof parsed.type === 'string' && typeof parsed.id === 'string') {
      return parsed as DragData
    }
    return null
  } catch {
    return null
  }
}

/**
 * Handle dragstart event for task cards
 */
export function handleTaskDragStart(
  event: DragEvent,
  taskId: string,
  additionalData?: Record<string, any>
) {
  if (!event.dataTransfer) return

  // Set drag data
  const dragData = createDragData('task', taskId, additionalData)
  event.dataTransfer.setData('application/json', dragData)
  event.dataTransfer.effectAllowed = 'move'

  // Add visual feedback
  const target = event.target as HTMLElement
  target.classList.add('dragging')
  
  // Set drag image (optional)
  event.dataTransfer.setDragImage(target, 0, 0)
}

/**
 * Handle dragend event for task cards
 */
export function handleTaskDragEnd(event: DragEvent) {
  const target = event.target as HTMLElement
  target.classList.remove('dragging')
}

/**
 * Handle dragover event for drop zones
 */
export function handleDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  
  // Add visual feedback to drop zone
  const target = event.currentTarget as HTMLElement
  target.classList.add('drag-over')
}

/**
 * Handle dragleave event for drop zones
 */
export function handleDragLeave(event: DragEvent) {
  const target = event.currentTarget as HTMLElement
  target.classList.remove('drag-over')
}

/**
 * Handle drop event for drop zones
 */
export function handleDrop(
  event: DragEvent,
  onDrop: (dragData: DragData) => void | Promise<void>
) {
  event.preventDefault()
  
  // Remove visual feedback
  const target = event.currentTarget as HTMLElement
  target.classList.remove('drag-over')

  if (!event.dataTransfer) return

  // Parse drag data
  const data = event.dataTransfer.getData('application/json')
  const dragData = parseDragData(data)

  if (dragData) {
    onDrop(dragData)
  }
}

/**
 * Make element draggable with standard task drag handlers
 */
export function makeTaskDraggable(
  element: HTMLElement,
  taskId: string,
  additionalData?: Record<string, any>
) {
  element.draggable = true
  element.setAttribute('draggable', 'true')

  element.addEventListener('dragstart', (e) => {
    handleTaskDragStart(e as DragEvent, taskId, additionalData)
  })

  element.addEventListener('dragend', (e) => {
    handleTaskDragEnd(e as DragEvent)
  })
}

/**
 * Make element a drop zone with standard handlers
 */
export function makeDropZone(
  element: HTMLElement,
  onDrop: (dragData: DragData) => void | Promise<void>
) {
  element.addEventListener('dragover', (e) => {
    handleDragOver(e as DragEvent)
  })

  element.addEventListener('dragleave', (e) => {
    handleDragLeave(e as DragEvent)
  })

  element.addEventListener('drop', (e) => {
    handleDrop(e as DragEvent, onDrop)
  })
}

/**
 * Calculate reorder position based on drop location
 * Returns index where item should be inserted
 */
export function calculateReorderPosition(
  dropY: number,
  items: Array<{ element: HTMLElement; id: string }>,
  draggedId: string
): number {
  let insertIndex = 0

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.id === draggedId) continue

    const rect = item.element.getBoundingClientRect()
    const middle = rect.top + rect.height / 2

    if (dropY > middle) {
      insertIndex = i + 1
    }
  }

  return insertIndex
}

/**
 * Smooth animation for drag operations
 */
export function animateDragSuccess(element: HTMLElement) {
  element.classList.add('drag-success')
  setTimeout(() => {
    element.classList.remove('drag-success')
  }, 300)
}

/**
 * Show error feedback for failed drag operation
 */
export function animateDragError(element: HTMLElement) {
  element.classList.add('drag-error')
  setTimeout(() => {
    element.classList.remove('drag-error')
  }, 300)
}

