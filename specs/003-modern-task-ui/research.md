# Technical Research: Modern Task Management UI

**Date**: 2025-11-03  
**Feature**: 003-modern-task-ui  
**Purpose**: Resolve all technical unknowns before implementation

This document contains research findings and technology decisions for implementing the modern task UI. Each section addresses a specific unknown from the implementation plan.

---

## 1. Drag-and-Drop Library Selection

### Problem
Need Svelte 5-compatible drag-and-drop library for board view kanban columns and timeline date adjustments.

###

 Options Evaluated

**Option A: @dnd-kit/core with Svelte 5 wrapper**
- Pros: Battle-tested, excellent touch support, accessibility features, tree-shakeable
- Cons: React-first API, requires custom Svelte wrapper, larger bundle (~25KB)
- Svelte 5 Compatibility: Requires custom wrapper with Svelte 5 runes

**Option B: svelte-dnd-action**
- Pros: Native Svelte library, simple API, good documentation
- Cons: Built for Svelte 4 actions, uncertain Svelte 5 runes compatibility
- Svelte 5 Compatibility: **Needs investigation** - uses Svelte 4 action API

**Option C: Native HTML5 Drag and Drop API**
- Pros: Zero dependencies, built-in browser support, lightweight
- Cons: Poor touch support (needs polyfill), inconsistent browser behavior, complex event handling
- Svelte 5 Compatibility: ✅ Fully compatible (standard DOM events)

**Option D: svelte-french-toast + custom drag logic**
- Pros: Minimal, leverages existing animation patterns, full control
- Cons: Need to build drag logic from scratch, more maintenance
- Svelte 5 Compatibility: ✅ Compatible

### Decision: Native HTML5 Drag and Drop API with touch polyfill

**Rationale**:
1. **Zero dependencies**: No external library to maintain or worry about Svelte 5 compatibility
2. **Performance**: Direct DOM manipulation, no framework wrapper overhead
3. **Control**: Full control over drag behavior, animations, and interaction patterns
4. **Bundle size**: 0KB added (touch polyfill ~3KB if needed)
5. **Future-proof**: Standard web API, won't break with framework updates

**Implementation Pattern**:

```svelte
<script lang="ts">
  let draggedTaskId = $state<string | null>(null)
  
  function handleDragStart(event: DragEvent, taskId: string) {
    draggedTaskId = taskId
    event.dataTransfer!.effectAllowed = 'move'
    event.dataTransfer!.setData('text/plain', taskId)
    
    // Visual feedback: ghost image
    const target = event.currentTarget as HTMLElement
    event.dataTransfer!.setDragImage(target, 0, 0)
  }
  
  function handleDragOver(event: DragEvent) {
    event.preventDefault()
    event.dataTransfer!.dropEffect = 'move'
  }
  
  function handleDrop(event: DragEvent, targetStageId: string) {
    event.preventDefault()
    const taskId = event.dataTransfer!.getData('text/plain')
    
    if (taskId) {
      moveTaskToStage(taskId, targetStageId)
    }
    
    draggedTaskId = null
  }
</script>

<div
  draggable="true"
  ondragstart={(e) => handleDragStart(e, task.id)}
  class="task-card {draggedTaskId === task.id ? 'dragging' : ''}"
>
  <!-- Task content -->
</div>

<div
  ondragover={handleDragOver}
  ondrop={(e) => handleDrop(e, stage.id)}
  class="stage-column"
>
  <!-- Column content -->
</div>

<style>
  .task-card {
    cursor: grab;
    transition: opacity 0.2s;
  }
  
  .task-card.dragging {
    opacity: 0.5;
  }
  
  .task-card:active {
    cursor: grabbing;
  }
</style>
```

**Touch Support Strategy**:
- Use `touchstart`, `touchmove`, `touchend` events for mobile
- Polyfill library: [mobile-drag-drop](https://github.com/timruffles/mobile-drag-drop) (~3KB)
- Fallback: Long-press to enter "move mode" on touch devices

**Performance Considerations**:
- Use `will-change: transform` on dragged elements
- Throttle drag events to 16ms (60fps)
- Use CSS transforms instead of position changes

**Alternatives Considered and Rejected**:
- **@dnd-kit/core**: Overkill for our use case, adds unnecessary complexity
- **svelte-dnd-action**: Svelte 4 API uncertain with Svelte 5 runes
- **Custom library**: Not worth the maintenance burden

---

## 2. Virtual Scrolling Implementation

### Problem
Rendering 500+ tasks in list view causes performance degradation. Need efficient rendering of only visible items.

### Options Evaluated

**Option A: svelte-virtual-list**
- Pros: Purpose-built for Svelte, simple API
- Cons: Last update 2 years ago, Svelte 4 focused
- Svelte 5 Compatibility: **Unknown** - needs testing

**Option B: @sveltejs/svelte-virtual (if exists)**
- Pros: Official Svelte library, maintained by core team
- Cons: **Does not exist** - no official virtual list library

**Option C: Custom implementation with Intersection Observer**
- Pros: Full control, modern browser API, can optimize for specific needs
- Cons: More complex, need to handle edge cases (variable heights, scrolling)
- Svelte 5 Compatibility: ✅ Uses standard DOM APIs

**Option D: Tanstack Virtual (framework-agnostic)**
- Pros: Battle-tested, framework-agnostic, excellent documentation, active maintenance
- Cons: ~10KB, requires integration layer
- Svelte 5 Compatibility: ✅ Compatible (vanilla JS core)

### Decision: Tanstack Virtual with Svelte 5 wrapper

**Rationale**:
1. **Best-in-class**: Industry standard virtual scrolling library (used by React Query team)
2. **Framework-agnostic**: Works with any framework, won't break with Svelte updates
3. **Feature-complete**: Handles variable heights, sticky items, horizontal/vertical scrolling
4. **Active maintenance**: Regularly updated, large community
5. **Performance**: Highly optimized, minimal overhead

**Implementation Pattern**:

```svelte
<script lang="ts">
  import { createVirtualizer } from '@tanstack/virtual-core'
  import { onMount } from 'svelte'
  
  let scrollElement = $state<HTMLDivElement | null>(null)
  let tasks = $state<Task[]>([])
  
  const virtualizer = $derived(() => {
    if (!scrollElement) return null
    
    return createVirtualizer({
      count: tasks.length,
      getScrollElement: () => scrollElement,
      estimateSize: () => 72, // Estimated task card height
      overscan: 5, // Render 5 extra items above/below viewport
    })
  })
  
  const virtualItems = $derived(virtualizer()?.getVirtualItems() ?? [])
  const totalSize = $derived(virtualizer()?.getTotalSize() ?? 0)
</script>

<div bind:this={scrollElement} class="scroll-container">
  <div style="height: {totalSize}px; position: relative;">
    {#each virtualItems as virtualRow}
      <div
        style="
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: {virtualRow.size}px;
          transform: translateY({virtualRow.start}px);
        "
      >
        <TaskCard task={tasks[virtualRow.index]} />
      </div>
    {/each}
  </div>
</div>

<style>
  .scroll-container {
    height: 100%;
    overflow-y: auto;
    contain: strict; /* Performance optimization */
  }
</style>
```

**Variable Height Support**:
```typescript
// Measure actual heights after render
const virtualizer = createVirtualizer({
  count: tasks.length,
  getScrollElement: () => scrollElement,
  estimateSize: () => 72,
  measureElement: (el) => el.getBoundingClientRect().height,
})
```

**Performance Target**: Render 500 tasks in <2 seconds, scroll at 60fps

**Bundle Size**: ~10KB gzipped (acceptable for feature benefit)

**Alternatives Considered and Rejected**:
- **svelte-virtual-list**: Unmaintained, Svelte 4 focused
- **Custom Intersection Observer**: Too complex to build from scratch, reinventing wheel
- **No virtualization**: Unacceptable performance with 500+ tasks

---

## 3. Calendar View Library

### Problem
Need calendar component for visualizing tasks by due date with month/week/day views.

### Options Evaluated

**Option A: FullCalendar with Svelte adapter**
- Pros: Industry standard, feature-rich, excellent documentation
- Cons: Large bundle (~50KB), commercial license for some features, complex API
- Svelte 5 Compatibility: Adapter needs update

**Option B: Custom calendar grid with CSS Grid**
- Pros: Lightweight, full control, exactly what we need
- Cons: Need to build date logic, handle edge cases
- Svelte 5 Compatibility: ✅ Pure CSS + Svelte

**Option C: Flowbite Svelte Datepicker (extend)**
- Pros: Already in dependency tree, consistent styling
- Cons: Not designed for event display, limited to date picking
- Svelte 5 Compatibility: ✅ Flowbite Svelte 5 compatible

### Decision: Custom Calendar Grid with CSS Grid

**Rationale**:
1. **Lightweight**: ~5KB of custom code vs 50KB+ library
2. **Exact requirements**: Only need month view with task dots, not full calendar features
3. **Design control**: Can match existing app aesthetic perfectly
4. **Performance**: No library overhead, pure CSS Grid is fast
5. **Maintainability**: Simple code, easy to modify

**Implementation Pattern**:

```svelte
<script lang="ts">
  import { getDaysInMonth, startOfMonth, getDay } from 'date-fns'
  
  let currentMonth = $state(new Date())
  
  const calendarDays = $derived(() => {
    const firstDay = startOfMonth(currentMonth)
    const daysInMonth = getDaysInMonth(currentMonth)
    const startDayOfWeek = getDay(firstDay)
    
    // Previous month padding
    const prevMonthDays = Array.from({ length: startDayOfWeek }, (_, i) => ({
      date: new Date(firstDay.getTime() - (startDayOfWeek - i) * 86400000),
      currentMonth: false,
    }))
    
    // Current month days
    const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({
      date: new Date(firstDay.getTime() + i * 86400000),
      currentMonth: true,
    }))
    
    return [...prevMonthDays, ...currentMonthDays]
  })
  
  function getTasksForDay(date: Date) {
    return tasks.filter(t => 
      t.dueDate && isSameDay(new Date(t.dueDate), date)
    )
  }
</script>

<div class="calendar-grid">
  <!-- Header row -->
  <div class="weekday">Sun</div>
  <div class="weekday">Mon</div>
  <!-- ... other days ... -->
  
  <!-- Calendar days -->
  {#each calendarDays as day}
    <div class="calendar-day {day.currentMonth ? '' : 'other-month'}">
      <div class="day-number">{day.date.getDate()}</div>
      
      <div class="tasks">
        {#each getTasksForDay(day.date) as task}
          <div class="task-dot {task.priority}"></div>
        {/each}
      </div>
    </div>
  {/each}
</div>

<style>
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    background: var(--border);
  }
  
  .calendar-day {
    aspect-ratio: 1;
    background: white;
    padding: 0.5rem;
    position: relative;
  }
  
  .task-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    display: inline-block;
    margin: 1px;
  }
  
  .task-dot.high { background: red; }
  .task-dot.medium { background: blue; }
  .task-dot.low { background: gray; }
</style>
```

**Task Density Visualization** (per FR-004):
```svelte
{#if tasksForDay.length === 0}
  <!-- Empty day -->
{:else if tasksForDay.length <= 2}
  <!-- Show individual task dots -->
  {#each tasksForDay as task}
    <div class="task-dot {task.priority}"></div>
  {/each}
{:else if tasksForDay.length <= 5}
  <!-- Show compact dots + count -->
  <div class="task-dots-compact">
    {tasksForDay.length} tasks
  </div>
{:else}
  <!-- Show "6+" indicator -->
  <div class="task-dots-many">
    {tasksForDay.length}+ tasks
  </div>
{/if}
```

**Dependencies**: `date-fns` (already in project) for date utilities

**Alternatives Considered and Rejected**:
- **FullCalendar**: Overkill for simple task dots on calendar, too large
- **Flowbite Datepicker extension**: Not designed for event display

---

## 4. Timeline/Gantt Visualization

### Problem
Implement horizontal timeline view showing tasks as bars along date axis with drag-to-adjust dates.

### Options Evaluated

**Option A: D3.js custom timeline**
- Pros: Extremely flexible, can create any visualization
- Cons: Steep learning curve, large bundle (~75KB), overkill for simple timeline
- Svelte 5 Compatibility: ✅ Can integrate with Svelte

**Option B: Frappe Gantt**
- Pros: Purpose-built for Gantt charts, simple API
- Cons: Not actively maintained, jQuery dependency (removed in v2), limited customization
- Svelte 5 Compatibility: ✅ Vanilla JS library

**Option C: CSS Grid horizontal layout with task bars**
- Pros: Lightweight, leverages CSS for positioning, simple
- Cons: Need to calculate positions manually, limited zoom capabilities
- Svelte 5 Compatibility: ✅ Pure CSS + Svelte

### Decision: CSS Grid Horizontal Layout (Custom Implementation)

**Rationale**:
1. **Simplicity**: Timeline is relatively simple visualization (horizontal bars)
2. **Performance**: CSS Grid is highly optimized by browsers
3. **Control**: Full control over styling, interactions, zoom levels
4. **Bundle size**: ~3KB custom code vs 75KB D3 or 30KB Frappe Gantt
5. **Maintainability**: Easy to understand and modify

**Implementation Pattern**:

```svelte
<script lang="ts">
  import { addDays, differenceInDays, startOfWeek, endOfWeek } from 'date-fns'
  
  let timelineStart = $state(startOfWeek(new Date()))
  let timelineEnd = $state(endOfWeek(addDays(new Date(), 60))) // 2 months view
  let zoomLevel = $state<'day' | 'week' | 'month'>('week')
  
  const totalDays = $derived(differenceInDays(timelineEnd, timelineStart))
  const columnWidth = $derived(zoomLevel === 'day' ? 40 : zoomLevel === 'week' ? 100 : 200)
  
  function getTaskBarPosition(task: Task) {
    if (!task.dueDate) return null
    
    const startDate = task.createdAt ? new Date(task.createdAt) : timelineStart
    const endDate = new Date(task.dueDate)
    
    const startOffset = differenceInDays(startDate, timelineStart)
    const duration = differenceInDays(endDate, startDate) || 1
    
    return {
      left: `${startOffset * columnWidth}px`,
      width: `${duration * columnWidth}px`,
    }
  }
</script>

<div class="timeline-container">
  <!-- Date header -->
  <div class="timeline-header">
    {#each Array.from({ length: totalDays }, (_, i) => addDays(timelineStart, i)) as date}
      <div class="date-column" style="width: {columnWidth}px">
        {date.getDate()}
      </div>
    {/each}
  </div>
  
  <!-- Task bars -->
  <div class="timeline-tasks">
    {#each tasks.filter(t => t.dueDate) as task}
      {@const position = getTaskBarPosition(task)}
      {#if position}
        <div
          class="task-bar {task.priority}"
          style="left: {position.left}; width: {position.width}"
          draggable="true"
          ondragend={(e) => adjustTaskDate(task, e)}
        >
          <span class="task-title">{task.title}</span>
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
  .timeline-container {
    overflow-x: auto;
    position: relative;
  }
  
  .timeline-header {
    display: flex;
    position: sticky;
    top: 0;
    background: white;
    border-bottom: 2px solid var(--border);
  }
  
  .timeline-tasks {
    position: relative;
    height: 500px;
  }
  
  .task-bar {
    position: absolute;
    height: 32px;
    background: var(--primary);
    border-radius: 4px;
    padding: 0 8px;
    cursor: grab;
    white-space: nowrap;
    overflow: hidden;
  }
  
  .task-bar:active {
    cursor: grabbing;
  }
</style>
```

**Drag-to-Adjust Date**:
```typescript
function adjustTaskDate(task: Task, dragEvent: DragEvent) {
  const dragDistance = dragEvent.clientX - dragEvent.target.offsetLeft
  const daysMoved = Math.round(dragDistance / columnWidth)
  
  if (daysMoved !== 0 && task.dueDate) {
    const newDueDate = addDays(new Date(task.dueDate), daysMoved)
    updateTask(task.id, { dueDate: newDueDate.toISOString() })
  }
}
```

**Zoom Controls**:
```svelte
<div class="zoom-controls">
  <button onclick={() => zoomLevel = 'day'}>Day</button>
  <button onclick={() => zoomLevel = 'week'}>Week</button>
  <button onclick={() => zoomLevel = 'month'}>Month</button>
</div>
```

**Performance Consideration**:
- Only render tasks with due dates (filter out null)
- Use CSS `transform` for dragging (not position changes)
- Virtual scrolling for 500+ tasks (reuse Tanstack Virtual)

**Alternatives Considered and Rejected**:
- **D3.js**: Too complex for relatively simple timeline
- **Frappe Gantt**: Not actively maintained, limited flexibility

---

## 5. Rich Text Editor for Comments

### Problem
Need editor for task comments with @mentions, basic formatting (bold, italic, links), lightweight.

### Options Evaluated

**Option A: Tiptap Editor**
- Pros: Extensible, excellent documentation, active maintenance, mention plugin
- Cons: ~50KB bundle, React-first (has Vue adapter, need Svelte adapter)
- Svelte 5 Compatibility: Needs custom Svelte 5 adapter

**Option B: Lexical with Svelte bindings**
- Pros: Facebook-backed, modern architecture, extensible
- Cons: No official Svelte adapter, ~60KB, steep learning curve
- Svelte 5 Compatibility: Requires custom bindings

**Option C: Simple textarea with Markdown support**
- Pros: Lightweight (~2KB), simple, no external dependencies
- Cons: No WYSIWYG, markdown syntax may be unfamiliar to some users
- Svelte 5 Compatibility: ✅ Pure Svelte

**Option D: Contenteditable div with custom toolbar**
- Pros: Native browser editing, full control, lightweight
- Cons: Browser inconsistencies, need to handle formatting commands manually
- Svelte 5 Compatibility: ✅ Standard DOM APIs

### Decision: Contenteditable Div with Custom Toolbar + Markdown Fallback

**Rationale**:
1. **Lightweight**: ~5KB custom code vs 50KB+ library
2. **Sufficient features**: Only need bold, italic, links, @mentions (not full rich text)
3. **Native browser support**: `document.execCommand` handles basic formatting
4. **Markdown fallback**: Users can type markdown syntax if they prefer
5. **Bundle size**: Critical for performance

**Implementation Pattern**:

```svelte
<script lang="ts">
  let editor = $state<HTMLDivElement | null>(null)
  let content = $state('')
  let showMentionDropdown = $state(false)
  let mentionQuery = $state('')
  
  function handleInput(event: Event) {
    const text = editor.textContent || ''
    content = text
    
    // Detect @mention trigger
    const cursorPos = window.getSelection()?.focusOffset || 0
    const lastAtIndex = text.lastIndexOf('@', cursorPos)
    
    if (lastAtIndex !== -1 && cursorPos - lastAtIndex <= 20) {
      mentionQuery = text.slice(lastAtIndex + 1, cursorPos)
      showMentionDropdown = true
    } else {
      showMentionDropdown = false
    }
  }
  
  function applyFormatting(command: string) {
    document.execCommand(command, false)
    editor?.focus()
  }
  
  function insertMention(user: User) {
    const mention = `@${user.name}`
    const selection = window.getSelection()
    
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      range.deleteContents()
      
      const mentionEl = document.createElement('span')
      mentionEl.className = 'mention'
      mentionEl.dataset.userId = user.id
      mentionEl.textContent = mention
      
      range.insertNode(mentionEl)
      range.collapse(false)
    }
    
    showMentionDropdown = false
  }
</script>

<div class="editor-container">
  <!-- Toolbar -->
  <div class="toolbar">
    <button onclick={() => applyFormatting('bold')} title="Bold (Ctrl+B)">
      <strong>B</strong>
    </button>
    <button onclick={() => applyFormatting('italic')} title="Italic (Ctrl+I)">
      <em>I</em>
    </button>
    <button onclick={() => applyFormatting('createLink')} title="Link">
      🔗
    </button>
  </div>
  
  <!-- Editor -->
  <div
    bind:this={editor}
    contenteditable="true"
    oninput={handleInput}
    class="editor-content"
    placeholder="Add a comment... Use @ to mention someone"
  ></div>
  
  <!-- Mention dropdown -->
  {#if showMentionDropdown}
    <div class="mention-dropdown">
      {#each filteredTeamMembers(mentionQuery) as user}
        <button onclick={() => insertMention(user)}>
          <Avatar {user} />
          {user.name}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .editor-content {
    min-height: 100px;
    padding: 12px;
    border: 1px solid var(--border);
    border-radius: 4px;
    outline: none;
  }
  
  .editor-content:focus {
    border-color: var(--primary);
  }
  
  .editor-content[contenteditable]:empty:before {
    content: attr(placeholder);
    color: var(--muted);
  }
  
  .mention {
    color: var(--primary);
    background: var(--primary-light);
    padding: 2px 4px;
    border-radius: 3px;
    font-weight: 500;
  }
  
  .toolbar {
    display: flex;
    gap: 4px;
    padding: 4px;
    border-bottom: 1px solid var(--border);
  }
</style>
```

**Markdown Fallback**:
```typescript
function parseMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // **bold**
    .replace(/\*(.*?)\*/g, '<em>$1</em>')              // *italic*
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>') // [text](url)
}
```

**Keyboard Shortcuts**:
- Ctrl+B: Bold
- Ctrl+I: Italic
- Ctrl+K: Insert link
- @: Trigger mention dropdown
- Enter: Submit comment (Shift+Enter for new line)

**Alternatives Considered and Rejected**:
- **Tiptap**: Too large for our needs, complex setup
- **Lexical**: No Svelte support, overkill
- **Textarea + Markdown only**: No WYSIWYG, worse UX

---

## 6. Natural Language Parsing Strategy

### Problem
Parse task titles to extract metadata: dates ("by Friday"), priorities ("#high"), project mentions ("for Project X").

### Options Evaluated

**Option A: chrono-node for date parsing**
- Pros: Excellent natural language date parsing, supports many formats
- Cons: ~100KB bundle, overkill for simple parsing
- Accuracy: Very high (90%+)

**Option B: Regex patterns + simple keyword extraction**
- Pros: Lightweight (~1KB), full control, fast
- Cons: Limited accuracy, doesn't handle ambiguous phrases
- Accuracy: Medium (60-70%)

**Option C: date-fns + custom regex patterns**
- Pros: date-fns already in project, regex for other metadata
- Cons: date-fns doesn't do natural language parsing, need custom logic
- Accuracy: Medium-High (70-80%)

### Decision: Custom Regex Patterns + date-fns for date validation

**Rationale**:
1. **Lightweight**: ~2KB custom code
2. **Sufficient accuracy**: Common patterns cover 70% of use cases
3. **No new dependencies**: Uses existing date-fns
4. **Fast**: Regex is very fast, no complex parsing
5. **Extensible**: Easy to add new patterns as needed

**Implementation Pattern**:

```typescript
// src/lib/utils/natural-language.ts

import { parse, isValid, addDays, nextFriday, nextMonday } from 'date-fns'

export interface ParsedTaskMetadata {
  title: string           // Cleaned title (metadata removed)
  priority?: 'low' | 'medium' | 'high'
  dueDate?: string        // ISO date string
  projectMention?: string // Project name extracted
  tags?: string[]
}

export function parseTaskTitle(rawTitle: string): ParsedTaskMetadata {
  let title = rawTitle
  const metadata: ParsedTaskMetadata = { title }
  
  // Extract priority (#high, #medium, #low)
  const priorityMatch = title.match(/#(high|medium|low)\b/i)
  if (priorityMatch) {
    metadata.priority = priorityMatch[1].toLowerCase() as any
    title = title.replace(priorityMatch[0], '').trim()
  }
  
  // Extract due date
  // Pattern: "by Friday", "due Friday", "by 11/30", "due Nov 30"
  const datePatterns = [
    /\b(by|due|until)\s+(today|tomorrow|friday|monday|tuesday|wednesday|thursday|saturday|sunday)\b/i,
    /\b(by|due|until)\s+(\d{1,2}\/\d{1,2})\b/,
    /\b(by|due|until)\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})\b/i,
  ]
  
  for (const pattern of datePatterns) {
    const match = title.match(pattern)
    if (match) {
      const dateStr = match[2] + (match[3] ? ` ${match[3]}` : '')
      const parsedDate = parseDateString(dateStr)
      
      if (parsedDate) {
        metadata.dueDate = parsedDate.toISOString()
        title = title.replace(match[0], '').trim()
      }
      break
    }
  }
  
  // Extract project mention ("for Project X", "in Project X")
  const projectMatch = title.match(/\b(for|in)\s+([A-Z][a-zA-Z\s]+)\b/)
  if (projectMatch) {
    metadata.projectMention = projectMatch[2].trim()
    title = title.replace(projectMatch[0], '').trim()
  }
  
  // Extract tags (#tag1 #tag2)
  const tagMatches = title.match(/#([a-zA-Z0-9_-]+)/g)
  if (tagMatches) {
    metadata.tags = tagMatches.map(t => t.slice(1)) // Remove #
    title = title.replace(/#[a-zA-Z0-9_-]+/g, '').trim()
  }
  
  metadata.title = title
  return metadata
}

function parseDateString(dateStr: string): Date | null {
  const today = new Date()
  
  // Relative dates
  if (dateStr.toLowerCase() === 'today') {
    return today
  }
  if (dateStr.toLowerCase() === 'tomorrow') {
    return addDays(today, 1)
  }
  
  // Next day of week
  const dayMapping: Record<string, () => Date> = {
    monday: nextMonday,
    tuesday: () => addDays(nextMonday(today), 1),
    wednesday: () => addDays(nextMonday(today), 2),
    thursday: () => addDays(nextMonday(today), 3),
    friday: nextFriday,
    saturday: () => addDays(nextFriday(today), 1),
    sunday: () => addDays(nextFriday(today), 2),
  }
  
  const dayFn = dayMapping[dateStr.toLowerCase()]
  if (dayFn) {
    return dayFn()
  }
  
  // Parse MM/DD or "Month Day"
  const parsed = parse(dateStr, 'M/d', today)
  if (isValid(parsed)) {
    return parsed
  }
  
  const parsedMonth = parse(dateStr, 'MMM d', today)
  if (isValid(parsedMonth)) {
    return parsedMonth
  }
  
  return null
}
```

**Usage Example**:

```typescript
const input = "buy fabric for Cosplay X by Friday #high"
const parsed = parseTaskTitle(input)

// Result:
// {
//   title: "buy fabric",
//   priority: "high",
//   dueDate: "2025-11-07T00:00:00.000Z",  // Next Friday
//   projectMention: "Cosplay X"
// }
```

**Accuracy Targets**:
- Date parsing: 70% success rate on common patterns
- Priority extraction: 95% (simple regex)
- Project mention: 60% (depends on user writing style)

**Future Enhancements** (if needed):
- Add more date patterns based on user feedback
- Integrate chrono-node if accuracy becomes critical (acceptable trade-off for 100KB)

**Alternatives Considered and Rejected**:
- **chrono-node**: Too large for MVP, can add later if needed
- **No parsing**: Worse UX, forces users to fill forms

---

## 7. Email Notification Service

### Problem
Send email notifications for task assignments, @mentions, comments, status changes.

### Current Setup Investigation

**Existing Supabase Auth Email**: Supabase has built-in email service for auth (password reset, email verification).

**Options for Custom Notifications**:

**Option A: Supabase Edge Functions + Resend**
- Pros: Serverless, auto-scales, Resend has generous free tier (3000 emails/month)
- Cons: Need to write Edge Function, additional service dependency
- Cost: Free tier sufficient for MVP

**Option B: Supabase Edge Functions + SendGrid**
- Pros: Established service, good deliverability
- Cons: More complex API, smaller free tier (100 emails/day)
- Cost: Free tier may be limiting

**Option C: Direct SMTP integration (Nodemailer)**
- Pros: Full control, no external service
- Cons: Need SMTP server, deliverability issues, maintenance overhead
- Cost: Varies

**Option D: Supabase built-in custom emails (if available)**
- Pros: No additional service, integrated with Supabase
- Cons: Limited to Supabase email templates, may not support custom content
- Cost: Included with Supabase

### Decision: Supabase Edge Function + Resend

**Rationale**:
1. **Generous free tier**: 3000 emails/month covers early users
2. **Modern API**: Simple REST API, excellent DX
3. **Good deliverability**: Resend focuses on transactional emails
4. **Serverless**: No infrastructure to maintain
5. **Cost-effective**: Free tier, then $20/month for 50K emails

**Implementation Pattern**:

```typescript
// supabase/functions/send-notification-email/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  const { userId, notificationType, taskId, actorName, message } = await req.json()
  
  // Get user email from Supabase
  const supabase = createClient(/* ... */)
  const { data: user } = await supabase
    .from('users')
    .select('email, notification_preferences')
    .eq('id', userId)
    .single()
  
  // Check if user has email notifications enabled
  if (!user.notification_preferences?.email) {
    return new Response(JSON.stringify({ skipped: true }), { status: 200 })
  }
  
  // Send email via Resend
  const emailContent = generateEmailContent(notificationType, taskId, actorName, message)
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Cosplay Tracker <notifications@cosplaytracker.app>',
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
    }),
  })
  
  return response
})

function generateEmailContent(type: string, taskId: string, actor: string, message: string) {
  const templates = {
    assignment: {
      subject: `${actor} assigned you a task`,
      html: `
        <h2>You've been assigned a task</h2>
        <p>${actor} assigned you to a task:</p>
        <blockquote>${message}</blockquote>
        <a href="https://app.cosplaytracker.com/tasks?detail=${taskId}">View Task</a>
      `,
    },
    mention: {
      subject: `${actor} mentioned you in a comment`,
      html: `
        <h2>You were mentioned</h2>
        <p>${actor} mentioned you:</p>
        <blockquote>${message}</blockquote>
        <a href="https://app.cosplaytracker.com/tasks?detail=${taskId}">View Task</a>
      `,
    },
    comment: {
      subject: `New comment on your task`,
      html: `
        <h2>New comment</h2>
        <p>${actor} commented on your task:</p>
        <blockquote>${message}</blockquote>
        <a href="https://app.cosplaytracker.com/tasks?detail=${taskId}">View Task</a>
      `,
    },
  }
  
  return templates[type] || templates.comment
}
```

**Triggering Emails from App**:

```typescript
// src/lib/api/services/taskNotificationService.ts

async function sendTaskAssignmentNotification(
  userId: string,
  taskId: string,
  actorName: string,
  taskTitle: string
) {
  // Create notification record (in-app)
  await supabase.from('task_notifications').insert({
    user_id: userId,
    task_id: taskId,
    event_type: 'assignment',
    message: `${actorName} assigned you to "${taskTitle}"`,
    actor_user_id: currentUser.id,
  })
  
  // Trigger email via Edge Function
  await supabase.functions.invoke('send-notification-email', {
    body: {
      userId,
      notificationType: 'assignment',
      taskId,
      actorName,
      message: taskTitle,
    },
  })
}
```

**Email Template Design**:
- Plain text + HTML versions
- Unsubscribe link in footer (required by law)
- Clear call-to-action (View Task button)
- Sender: `notifications@cosplaytracker.app`

**Deliverability Best Practices**:
- Set up SPF, DKIM, DMARC records
- Use Resend's domain verification
- Monitor bounce/complaint rates
- Include plain text version

**Alternatives Considered and Rejected**:
- **SendGrid**: Smaller free tier, more complex setup
- **Direct SMTP**: Deliverability issues, maintenance burden
- **Supabase built-in**: Too limited for custom notifications

---

## 8. File Attachment Storage

### Problem
Handle file uploads for task attachments, store in Cloudflare R2, generate signed URLs for access control.

### Current Setup Investigation

Looking at existing codebase for image upload patterns...

**Existing Pattern** (from inline-image-upload.svelte):
```typescript
// Already using Cloudflare R2 for image uploads
// Pattern: Upload to Supabase storage bucket, which proxies to R2
```

### Decision: Reuse Existing Supabase Storage + R2 Pattern

**Rationale**:
1. **Already implemented**: Image upload infrastructure exists
2. **Consistent pattern**: Same approach for all file types
3. **Access control**: Supabase storage handles signed URLs
4. **Cost-effective**: R2 free tier (10GB storage)

**Implementation Pattern**:

```typescript
// src/lib/api/services/taskAttachmentService.ts

import { supabase } from '$lib/api/supabase'
import type { TaskAttachment } from '$lib/types/domain/task'

export const taskAttachmentService = {
  async uploadAttachment(
    taskId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<TaskAttachment> {
    const fileName = `${taskId}/${Date.now()}-${file.name}`
    const bucket = 'task-attachments'
    
    // Upload to Supabase Storage (proxies to R2)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })
    
    if (uploadError) throw uploadError
    
    // Get public URL (signed)
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName, {
        download: false,
      })
    
    // Create attachment record
    const { data, error } = await supabase
      .from('task_attachments')
      .insert({
        task_id: taskId,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        storage_url: urlData.publicUrl,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },
  
  async getAttachments(taskId: string): Promise<TaskAttachment[]> {
    const { data, error } = await supabase
      .from('task_attachments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },
  
  async deleteAttachment(attachmentId: string): Promise<void> {
    // Get attachment to find storage path
    const { data: attachment } = await supabase
      .from('task_attachments')
      .select('storage_url')
      .eq('id', attachmentId)
      .single()
    
    if (attachment) {
      // Delete from storage
      const fileName = attachment.storage_url.split('/').slice(-2).join('/')
      await supabase.storage.from('task-attachments').remove([fileName])
    }
    
    // Delete record
    const { error } = await supabase
      .from('task_attachments')
      .delete()
      .eq('id', attachmentId)
    
    if (error) throw error
  },
  
  async getSignedUrl(storageUrl: string, expiresIn: number = 3600): Promise<string> {
    // Generate signed URL for secure download
    const fileName = storageUrl.split('/').slice(-2).join('/')
    
    const { data, error } = await supabase.storage
      .from('task-attachments')
      .createSignedUrl(fileName, expiresIn)
    
    if (error) throw error
    return data.signedUrl
  },
}
```

**Upload Component**:

```svelte
<script lang="ts">
  import { taskAttachmentService } from '$lib/api/services/taskAttachmentService'
  
  let dragOver = $state(false)
  let uploading = $state(false)
  let progress = $state(0)
  
  async function handleFileDrop(event: DragEvent) {
    event.preventDefault()
    dragOver = false
    
    const files = Array.from(event.dataTransfer?.files || [])
    await uploadFiles(files)
  }
  
  async function handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement
    const files = Array.from(input.files || [])
    await uploadFiles(files)
  }
  
  async function uploadFiles(files: File[]) {
    uploading = true
    
    for (const file of files) {
      try {
        await taskAttachmentService.uploadAttachment(taskId, file, (p) => {
          progress = p
        })
      } catch (error) {
        showError(`Failed to upload ${file.name}`)
      }
    }
    
    uploading = false
    progress = 0
  }
</script>

<div
  class="upload-dropzone {dragOver ? 'drag-over' : ''}"
  ondragover={(e) => { e.preventDefault(); dragOver = true }}
  ondragleave={() => dragOver = false}
  ondrop={handleFileDrop}
>
  {#if uploading}
    <div class="progress-bar">
      <div class="progress-fill" style="width: {progress}%"></div>
    </div>
  {:else}
    <input
      type="file"
      multiple
      onchange={handleFileInput}
      style="display: none"
      bind:this={fileInput}
    />
    <button onclick={() => fileInput?.click()}>
      📎 Attach Files
    </button>
    <p>or drag and drop here</p>
  {/if}
</div>
```

**File Size Limits**:
- Max file size: 25MB (per assumption in spec)
- Enforce limit in client before upload
- Server-side validation in Edge Function (if needed)

**Supported File Types**:
- Documents: PDF, DOCX, TXT
- Images: JPG, PNG, GIF, WEBP
- Archives: ZIP
- Other: Allow most MIME types, scan for security

**Security Considerations**:
- Validate file types (MIME check)
- Signed URLs expire after 1 hour
- RLS policies restrict access to team members
- Virus scanning (future enhancement, not MVP)

**Alternatives Considered and Rejected**:
- **Direct R2 upload**: More complex, need presigned URLs from backend
- **Different storage provider**: Inconsistent with existing pattern

---

## 9. Real-time Notification Delivery

### Problem
Deliver in-app notifications instantly without polling.

### Options Evaluated

**Option A: Supabase Realtime subscriptions**
- Pros: Built-in, WebSocket-based, automatically handles reconnection
- Cons: Requires Supabase plan with Realtime enabled (free tier has limited connections)
- Compatibility: ✅ Works with Supabase

**Option B: Server-Sent Events (SSE)**
- Pros: Simple, one-way server-to-client, good browser support
- Cons: Need to set up SSE endpoint, doesn't work with Supabase out-of-box
- Compatibility: ✅ Standard browser API

**Option C: Short polling (fallback)**
- Pros: Simple, works everywhere, no special server support
- Cons: Increased server load, delayed notifications (30s-60s poll interval)
- Compatibility: ✅ Always works

**Option D: WebSocket (custom)**
- Pros: Full duplex, efficient
- Cons: Need to implement server, more complex than Supabase Realtime
- Compatibility: ✅ Standard

### Decision: Supabase Realtime + Short Polling Fallback

**Rationale**:
1. **Built-in**: Supabase Realtime already available
2. **Easy integration**: Single subscribe() call
3. **Reliable**: Automatic reconnection, presence tracking
4. **Graceful degradation**: Fall back to polling if Realtime unavailable
5. **Cost**: Free tier sufficient for MVP (<200 concurrent connections)

**Implementation Pattern**:

```typescript
// src/lib/stores/notifications.ts

import { writable, derived } from 'svelte/store'
import { supabase } from '$lib/api/supabase'
import type { TaskNotification } from '$lib/types/domain/notification'

export const notifications = writable<TaskNotification[]>([])
export const unreadCount = derived(
  notifications,
  $n => $n.filter(n => !n.read).length
)

let realtimeSubscription: any = null
let pollingInterval: any = null

export async function initNotifications(userId: string) {
  // Load initial notifications
  await loadNotifications(userId)
  
  // Try Supabase Realtime first
  try {
    realtimeSubscription = supabase
      .channel('task-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'task_notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          notifications.update(n => [payload.new as TaskNotification, ...n])
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime notifications enabled')
        } else if (status === 'CHANNEL_ERROR') {
          // Fall back to polling
          startPolling(userId)
        }
      })
  } catch (error) {
    // Realtime not available, use polling
    startPolling(userId)
  }
}

async function loadNotifications(userId: string) {
  const { data } = await supabase
    .from('task_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
  
  if (data) {
    notifications.set(data)
  }
}

function startPolling(userId: string) {
  console.log('Falling back to polling for notifications')
  
  pollingInterval = setInterval(async () => {
    const lastNotification = get(notifications)[0]
    const lastTimestamp = lastNotification?.created_at || new Date().toISOString()
    
    const { data } = await supabase
      .from('task_notifications')
      .select('*')
      .eq('user_id', userId)
      .gt('created_at', lastTimestamp)
      .order('created_at', { ascending: false })
    
    if (data && data.length > 0) {
      notifications.update(n => [...data, ...n])
    }
  }, 30000) // Poll every 30 seconds
}

export function cleanupNotifications() {
  if (realtimeSubscription) {
    supabase.removeChannel(realtimeSubscription)
  }
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }
}
```

**Notification Center Component**:

```svelte
<script lang="ts">
  import { notifications, unreadCount, initNotifications } from '$lib/stores/notifications'
  import { onMount } from 'svelte'
  
  onMount(() => {
    initNotifications(currentUser.id)
    
    return () => {
      cleanupNotifications()
    }
  })
  
  async function markAsRead(notificationId: string) {
    await supabase
      .from('task_notifications')
      .update({ read: true })
      .eq('id', notificationId)
    
    notifications.update(list =>
      list.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }
  
  async function markAllAsRead() {
    const unreadIds = $notifications.filter(n => !n.read).map(n => n.id)
    
    await supabase
      .from('task_notifications')
      .update({ read: true })
      .in('id', unreadIds)
    
    notifications.update(list => list.map(n => ({ ...n, read: true })))
  }
</script>

<div class="notification-center">
  <button class="notification-bell">
    🔔
    {#if $unreadCount > 0}
      <span class="badge">{$unreadCount}</span>
    {/if}
  </button>
  
  <div class="dropdown">
    <div class="header">
      <h3>Notifications</h3>
      <button onclick={markAllAsRead}>Mark all read</button>
    </div>
    
    <div class="list">
      {#each $notifications.slice(0, 20) as notification}
        <div
          class="notification-item {notification.read ? 'read' : 'unread'}"
          onclick={() => {
            markAsRead(notification.id)
            goto(`/tasks?detail=${notification.taskId}`)
          }}
        >
          <div class="content">
            {notification.message}
          </div>
          <div class="timestamp">
            {formatRelativeTime(notification.createdAt)}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
```

**Performance Considerations**:
- Limit to 50 most recent notifications in memory
- Lazy load older notifications on scroll
- Debounce mark-as-read updates (batch requests)

**Fallback Behavior**:
- Primary: Supabase Realtime (instant)
- Fallback: Polling every 30 seconds
- User sees notifications within 30 seconds worst-case

**Alternatives Considered and Rejected**:
- **Custom WebSocket server**: Too complex for MVP
- **SSE**: Requires custom endpoint setup
- **Polling only**: Works but delays are annoying

---

## 10. State Management for View Modes

### Problem
Manage complex filter/grouping/view state with requirements: URL shareability, persistence across sessions, state restoration.

### Options Evaluated

**Option A: Svelte stores only**
- Pros: Simple, reactive, existing pattern
- Cons: Not shareable via URL, lost on page refresh
- URL Support: ❌ No

**Option B: URL query parameters**
- Pros: Shareable links, browser back/forward works
- Cons: Verbose URLs, state size limited, no persistence across sessions
- URL Support: ✅ Yes

**Option C: LocalStorage**
- Pros: Persists across sessions, unlimited size (within limits)
- Cons: Not shareable, per-browser only
- URL Support: ❌ No

**Option D: Combination: URL + LocalStorage + Svelte Stores**
- Pros: Best of all approaches, shareable + persistent + reactive
- Cons: More complex, need synchronization logic
- URL Support: ✅ Yes

### Decision: Hybrid Approach (URL + LocalStorage + Svelte Stores)

**Rationale**:
1. **URL for shareability**: Filters encoded in URL for sharing
2. **LocalStorage for preferences**: View mode, column widths persist
3. **Stores for reactivity**: UI updates automatically
4. **Layered precedence**: URL > LocalStorage > defaults

**State Categories**:

| State | Storage | Shareable | Persists |
|-------|---------|-----------|----------|
| Active filters | URL | ✅ Yes | No (intentional) |
| Search query | URL | ✅ Yes | No |
| View mode (list/board/etc) | LocalStorage | ❌ No | ✅ Yes |
| Grouping option | URL | ✅ Yes | No |
| Saved views | Supabase DB | ✅ Yes | ✅ Yes |
| Detail panel state | URL param | ✅ Yes | No |
| Selected tasks | Component state | ❌ No | ❌ No |

**Implementation Pattern**:

```typescript
// src/lib/stores/taskFilters.ts

import { writable, derived } from 'svelte/store'
import { goto } from '$app/navigation'
import { page } from '$app/stores'

export interface TaskFilters {
  stages: string[]
  priorities: ('low' | 'medium' | 'high')[]
  assignees: string[]
  projects: string[]
  dateRange: { start: string; end: string } | null
  tags: string[]
  includeArchived: boolean
}

export const activeFilters = writable<TaskFilters>({
  stages: [],
  priorities: [],
  assignees: [],
  projects: [],
  dateRange: null,
  tags: [],
  includeArchived: false,
})

export const searchQuery = writable<string>('')
export const activeGrouping = writable<'stage' | 'priority' | 'project' | 'assignee' | 'dueDate'>('stage')

// View mode persisted in LocalStorage
export const currentViewMode = writable<'list' | 'board' | 'calendar' | 'timeline'>(
  (typeof localStorage !== 'undefined' && localStorage.getItem('taskViewMode')) as any || 'list'
)

currentViewMode.subscribe(mode => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('taskViewMode', mode)
  }
})

// Sync filters to URL
export function syncFiltersToURL(filters: TaskFilters, search: string, grouping: string) {
  const params = new URLSearchParams()
  
  if (Object.values(filters).some(v => v.length > 0 || v !== null)) {
    params.set('filter', JSON.stringify(filters))
  }
  
  if (search) {
    params.set('q', search)
  }
  
  if (grouping !== 'stage') {
    params.set('groupBy', grouping)
  }
  
  const query = params.toString()
  goto(`/tasks${query ? `?${query}` : ''}`, { replaceState: true, noScroll: true })
}

// Restore filters from URL
export function restoreFiltersFromURL(searchParams: URLSearchParams) {
  const filterParam = searchParams.get('filter')
  if (filterParam) {
    try {
      const filters = JSON.parse(filterParam)
      activeFilters.set(filters)
    } catch (e) {
      console.error('Failed to parse filters from URL')
    }
  }
  
  const searchParam = searchParams.get('q')
  if (searchParam) {
    searchQuery.set(searchParam)
  }
  
  const groupByParam = searchParams.get('groupBy')
  if (groupByParam) {
    activeGrouping.set(groupByParam as any)
  }
}

// Debounced URL sync
let syncTimeout: any = null
export function debouncedSyncToURL() {
  clearTimeout(syncTimeout)
  syncTimeout = setTimeout(() => {
    syncFiltersToURL(get(activeFilters), get(searchQuery), get(activeGrouping))
  }, 500)
}
```

**Usage in Page Component**:

```svelte
<script lang="ts">
  import { onMount } from 'svelte'
  import { page } from '$app/stores'
  import { restoreFiltersFromURL, activeFilters, currentViewMode } from '$lib/stores/taskFilters'
  
  onMount(() => {
    // Restore state from URL on mount
    restoreFiltersFromURL($page.url.searchParams)
  })
  
  // Watch for URL changes (browser back/forward)
  $effect(() => {
    restoreFiltersFromURL($page.url.searchParams)
  })
</script>
```

**Saved Views (Supabase)**:

```typescript
// src/lib/stores/taskViews.ts

export interface SavedTaskView {
  id: string
  teamId: string
  userId: string
  name: string
  filters: TaskFilters
  grouping: string
  viewMode: string
  createdAt: string
}

export const savedViews = writable<SavedTaskView[]>([])

export async function saveCurrentView(name: string) {
  const view = {
    team_id: currentTeamId,
    user_id: currentUserId,
    name,
    filters: get(activeFilters),
    grouping: get(activeGrouping),
    view_mode: get(currentViewMode),
  }
  
  const { data, error } = await supabase
    .from('saved_task_views')
    .insert(view)
    .select()
    .single()
  
  if (error) throw error
  
  savedViews.update(views => [...views, data])
}

export async function loadSavedView(viewId: string) {
  const view = get(savedViews).find(v => v.id === viewId)
  if (!view) return
  
  activeFilters.set(view.filters)
  activeGrouping.set(view.grouping)
  currentViewMode.set(view.viewMode)
  
  // Sync to URL for shareability
  debouncedSyncToURL()
}
```

**URL Format Examples**:

```
# Basic filter
/tasks?filter={"stages":["abc123"],"priorities":["high"]}

# With search
/tasks?filter={"stages":["abc123"]}&q=fabric

# With grouping
/tasks?filter={"priorities":["high"]}&groupBy=priority

# Open detail panel
/tasks?detail=task-id-123

# Combined
/tasks?filter={"stages":["abc123"]}&q=fabric&detail=task-id-123
```

**Performance Considerations**:
- Debounce URL updates (500ms) to avoid excessive history entries
- Use `replaceState` instead of `pushState` for filter changes
- Compress filter JSON if URL becomes too long (future enhancement)

**Alternatives Considered and Rejected**:
- **Stores only**: Not shareable, big limitation
- **URL only**: View preferences lost on refresh
- **LocalStorage only**: Not shareable

---

## Summary of Decisions

| Research Area | Decision | Key Benefit |
|---------------|----------|-------------|
| 1. Drag-and-Drop | Native HTML5 DnD API | Zero dependencies, 0KB bundle |
| 2. Virtual Scrolling | Tanstack Virtual | Best-in-class, framework-agnostic |
| 3. Calendar View | Custom CSS Grid | Lightweight (5KB), full control |
| 4. Timeline View | Custom CSS Grid | Simple, efficient, 3KB |
| 5. Rich Text Editor | Contenteditable + Toolbar | Lightweight (5KB), sufficient features |
| 6. Natural Language | Custom Regex + date-fns | 2KB, 70% accuracy, fast |
| 7. Email Service | Supabase Edge + Resend | 3000 free emails/month, modern API |
| 8. File Storage | Existing Supabase + R2 | Reuse infrastructure, consistent |
| 9. Realtime Notifications | Supabase Realtime + Polling | Instant delivery, graceful fallback |
| 10. State Management | URL + LocalStorage + Stores | Shareable + persistent + reactive |

**Total New Dependencies**:
- `@tanstack/virtual-core` (~10KB)
- Resend API (server-side only, no client bundle impact)
- Mobile-drag-drop polyfill (~3KB, optional)

**Total Bundle Size Impact**: ~18KB (acceptable for feature richness)

**All Technical Unknowns Resolved**: ✅ Ready for Phase 1 (Data Model & Contracts)

---

**Next Steps**:
1. Generate data-model.md with full database schema
2. Generate contracts/api-schema.yaml with API endpoints
3. Generate contracts/types.ts with TypeScript interfaces
4. Generate quickstart.md for developer onboarding
5. Update agent context files

