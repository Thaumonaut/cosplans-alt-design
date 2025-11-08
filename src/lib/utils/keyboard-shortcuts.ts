/**
 * Keyboard shortcuts utility
 * Handles global keyboard shortcuts like Ctrl+K for search
 */

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  meta?: boolean // Command key on Mac
  shift?: boolean
  alt?: boolean
  callback: () => void
  description?: string
}

class KeyboardShortcutsManager {
  private shortcuts: Map<string, KeyboardShortcut[]> = new Map()
  private isEnabled = true

  /**
   * Register a keyboard shortcut
   */
  register(shortcut: KeyboardShortcut) {
    const key = this.getShortcutKey(shortcut)
    if (!this.shortcuts.has(key)) {
      this.shortcuts.set(key, [])
    }
    this.shortcuts.get(key)!.push(shortcut)
  }

  /**
   * Unregister a keyboard shortcut
   */
  unregister(shortcut: KeyboardShortcut) {
    const key = this.getShortcutKey(shortcut)
    const shortcuts = this.shortcuts.get(key)
    if (shortcuts) {
      const index = shortcuts.findIndex(s => s.callback === shortcut.callback)
      if (index >= 0) {
        shortcuts.splice(index, 1)
      }
      if (shortcuts.length === 0) {
        this.shortcuts.delete(key)
      }
    }
  }

  /**
   * Handle keyboard event
   */
  handleKeyDown(event: KeyboardEvent) {
    if (!this.isEnabled) return

    // Ignore if user is typing in an input, textarea, or contenteditable
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return
    }

    const key = this.getEventKey(event)
    const shortcuts = this.shortcuts.get(key)
    
    if (shortcuts && shortcuts.length > 0) {
      // Execute the first matching shortcut
      event.preventDefault()
      event.stopPropagation()
      shortcuts[0].callback()
    }
  }

  /**
   * Get shortcut key string from shortcut definition
   */
  private getShortcutKey(shortcut: KeyboardShortcut): string {
    const parts: string[] = []
    if (shortcut.ctrl) parts.push('ctrl')
    if (shortcut.meta) parts.push('meta')
    if (shortcut.shift) parts.push('shift')
    if (shortcut.alt) parts.push('alt')
    parts.push(shortcut.key.toLowerCase())
    return parts.join('+')
  }

  /**
   * Get key string from keyboard event
   */
  private getEventKey(event: KeyboardEvent): string {
    const parts: string[] = []
    if (event.ctrlKey) parts.push('ctrl')
    if (event.metaKey) parts.push('meta')
    if (event.shiftKey) parts.push('shift')
    if (event.altKey) parts.push('alt')
    parts.push(event.key.toLowerCase())
    return parts.join('+')
  }

  /**
   * Enable keyboard shortcuts
   */
  enable() {
    this.isEnabled = true
  }

  /**
   * Disable keyboard shortcuts
   */
  disable() {
    this.isEnabled = false
  }

  /**
   * Initialize keyboard shortcuts manager
   */
  init() {
    if (typeof window === 'undefined') return

    window.addEventListener('keydown', (e) => this.handleKeyDown(e))
  }

  /**
   * Cleanup keyboard shortcuts manager
   */
  destroy() {
    if (typeof window === 'undefined') return

    window.removeEventListener('keydown', (e) => this.handleKeyDown(e))
    this.shortcuts.clear()
  }
}

// Singleton instance
export const keyboardShortcuts = new KeyboardShortcutsManager()

// Initialize on module load (browser only)
if (typeof window !== 'undefined') {
  keyboardShortcuts.init()
}

