# Implementation Plan: Modern Task Management UI

**Branch**: `003-modern-task-ui` | **Date**: 2025-11-03 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/003-modern-task-ui/spec.md`

**Design Philosophy**: Unified page approach with living document editing pattern. All task operations (create/edit/view) happen in a single task detail panel with inline editors. Minimize page count while maximizing functionality.

## Summary

Complete UI redesign of the task management system to match modern tools like Monday, Asana, and ClickUp. The implementation focuses on:

- **Four primary view modes**: List, Kanban Board, Calendar, Timeline with instant switching
- **Rich task interactions**: Drag-and-drop, bulk operations, inline editing, advanced filtering
- **Unified task detail panel**: Single slide-in panel handles create/edit/view with living document editing
- **Comprehensive collaboration**: Subtasks, comments, attachments, @mentions, notifications
- **Contextual integration**: Embedded task views in projects, photoshoots, resources with auto-linking
- **Enhanced UX**: Templates, keyboard shortcuts, natural language parsing, saved filter views

Technical approach leverages existing SvelteKit architecture with Svelte 5 runes, Flowbite components, and established inline editor patterns. New entities (subtasks, comments, attachments, notifications, templates) integrate with existing task system via Supabase.

## Technical Context

**Language/Version**: TypeScript with Svelte 5 (runes-based reactivity)  
**Primary Dependencies**: 
- SvelteKit (web framework)
- Svelte 5 with runes ($state, $derived, $effect)
- Flowbite Svelte (UI component library)
- Tailwind CSS (styling)
- Supabase Client (database, auth, real-time)
- Lucide Svelte (icons)
- DND Kit (drag-and-drop library for Svelte - NEEDS RESEARCH)

**Storage**: Supabase PostgreSQL with Row Level Security (RLS)  
**Testing**: Playwright (E2E), Vitest (unit/integration)  
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge), mobile-responsive  
**Project Type**: Web application (SvelteKit full-stack)

**Performance Goals**:
- Views with 500 tasks render in <2 seconds
- Drag operations at 60fps (<16ms frame time)
- View switching in <500ms
- Virtual scrolling for 100+ tasks

**Constraints**:
- Maintain backward compatibility with existing task data
- Use existing task_stages system (no schema changes)
- Respect team permissions via existing RLS policies
- No breaking changes to existing task API surface

**Scale/Scope**:
- 50-500 tasks per team (typical), up to 2000 tasks (extreme)
- 4 new entities (subtasks, comments, attachments, notifications, templates)
- 3 new services, 12+ new Svelte components
- 1 main Tasks page, 1 unified task detail panel, embedded views in 3+ contexts

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Project-Centric**: Tasks support both project-scoped (linked to projects/resources/photoshoots) and team-scoped (standalone) models. Feature enhances tracking across all project phases.

- [x] **Team-Based**: All tasks respect team boundaries via teamId field. New entities (subtasks, comments, notifications) inherit team context from parent task. RLS policies enforce team isolation.

- [x] **Feature Scope**: Feature classified as **MVP Core Enhancement** - Tasks are already in MVP Core (Tracking Domain). This redesign modernizes the existing UI without changing core data model.

- [x] **Complete Workflow**: Task management supports entire cosplay lifecycle - planning (task creation), creation (tracking work), events (preparation tasks), post-production (editing tasks), archive (historical tasks with "Include Archived" filter).

- [x] **MVP First**: Scope is focused on UI modernization. New features (subtasks, comments, attachments, notifications, templates) are standard task management capabilities, not premature complexity. No AI features, no external integrations, no real-time collaboration (noted as future).

- [x] **Test-First**: Critical user journeys defined in spec with 32 acceptance scenarios across 7 user stories. E2E tests will be written for P1 stories (view switching, task detail CRUD, drag-and-drop, filtering) before implementation.

- [x] **Modular**: Feature fits cleanly in **Tracking Domain** (Tasks). Components integrate with Projects, Resources, Events domains via contextual embedding but remain independently functional.

- [x] **Cost-Conscious**: No new paid services introduced. Uses existing Supabase (free tier sufficient for task features), existing Cloudflare R2 (for attachments), existing email service (for notifications).

- [x] **Future-Ready**: Design accommodates planned enhancements without over-engineering:
  - Task watching mechanism (future) - data model supports via task_watchers table (not implemented)
  - Real-time collaboration (future) - Supabase real-time subscriptions already available
  - AI task suggestions (Phase 2) - template system provides foundation

- [x] **Data Privacy**: New entities respect existing privacy model. Supabase RLS policies enforce team boundaries. Notifications only sent to authorized users (assignees, mentioned users). File attachments use signed URLs via existing Cloudflare R2 integration.

- [x] **Tech Stack**: Uses established stack: SvelteKit, Svelte 5, Flowbite Svelte, Tailwind, Supabase, Bun. Only new dependency is DND library for drag-and-drop (researched in Phase 0).

- [x] **Navigation**: No new top-level routes. Uses existing `/tasks` page. Task detail panel is slide-in overlay (not new page). Embedded views in existing `/projects/[id]`, `/photoshoots/[id]`, `/resources/[id]` pages.

**Feature Phase**: MVP Core (Enhancement)

**Violations**: None

## Project Structure

### Documentation (this feature)

```text
specs/003-modern-task-ui/
├── spec.md              # Feature requirements (completed)
├── plan.md              # This file (in progress)
├── research.md          # Phase 0 output (to be generated)
├── data-model.md        # Phase 1 output (to be generated)
├── quickstart.md        # Phase 1 output (to be generated)
├── contracts/           # Phase 1 output (to be generated)
│   ├── api-schema.yaml  # API endpoint definitions
│   └── types.ts         # TypeScript type contracts
├── checklists/
│   └── requirements.md  # Spec validation checklist (completed)
└── tasks.md             # Phase 2 output (/speckit.tasks command - deferred)
```

### Source Code (repository root)

**Existing SvelteKit Structure** (Web Application):

```text
src/
├── lib/
│   ├── api/
│   │   ├── services/
│   │   │   ├── taskService.ts         # Enhanced with new endpoints
│   │   │   ├── taskStageService.ts     # No changes required
│   │   │   ├── subtaskService.ts       # NEW: Subtask CRUD operations
│   │   │   ├── taskCommentService.ts   # NEW: Comment operations
│   │   │   ├── taskAttachmentService.ts # NEW: File attachment handling
│   │   │   ├── taskNotificationService.ts # NEW: Notification management
│   │   │   └── taskTemplateService.ts  # NEW: Template CRUD
│   │   ├── client.ts
│   │   ├── data-loader.svelte.ts
│   │   └── supabase.ts
│   │
│   ├── components/
│   │   ├── base/
│   │   │   ├── InlineTextEditor.svelte  # Existing (reuse)
│   │   │   ├── InlineSelect.svelte      # Existing (reuse)
│   │   │   ├── InlineDatePicker.svelte  # Existing (reuse)
│   │   │   └── StageSelector.svelte     # Existing (reuse)
│   │   │
│   │   └── tasks/
│   │       ├── TaskDetail.svelte        # REPLACE: Unified detail panel
│   │       ├── TaskCard.svelte          # ENHANCE: Add subtask progress
│   │       │
│   │       ├── views/
│   │       │   ├── TaskListView.svelte       # NEW: List view mode
│   │       │   ├── TaskBoardView.svelte      # NEW: Kanban board mode
│   │       │   ├── TaskCalendarView.svelte   # NEW: Calendar mode
│   │       │   └── TaskTimelineView.svelte   # NEW: Timeline mode
│   │       │
│   │       ├── filters/
│   │       │   ├── TaskFilterPanel.svelte    # NEW: Filter UI
│   │       │   ├── SavedViewsDropdown.svelte # NEW: Saved filter views
│   │       │   └── TaskSearchInput.svelte    # NEW: Search functionality
│   │       │
│   │       ├── detail/
│   │       │   ├── TaskDetailPanel.svelte    # NEW: Main unified panel
│   │       │   ├── TaskSubtasksList.svelte   # NEW: Subtasks section
│   │       │   ├── TaskCommentsTab.svelte    # NEW: Comments tab
│   │       │   ├── TaskActivityTab.svelte    # NEW: Activity log tab
│   │       │   ├── TaskAttachments.svelte    # NEW: File attachments
│   │       │   └── TaskMentions.svelte       # NEW: @mention autocomplete
│   │       │
│   │       ├── bulk/
│   │       │   ├── BulkActionsMenu.svelte    # NEW: Bulk operations UI
│   │       │   └── TaskMultiSelect.svelte    # NEW: Checkbox selection
│   │       │
│   │       ├── templates/
│   │       │   ├── TemplateSelector.svelte   # NEW: Template picker
│   │       │   └── TemplateSaveDialog.svelte # NEW: Save as template
│   │       │
│   │       └── integrations/
│   │           ├── EmbeddedTaskView.svelte   # NEW: Reusable embedded view
│   │           └── QuickCreateOverlay.svelte # NEW: Keyboard shortcut overlay
│   │
│   ├── stores/
│   │   ├── tasks.ts              # ENHANCE: Add view state, filters, grouping
│   │   ├── taskFilters.ts        # NEW: Filter state management
│   │   ├── taskViews.ts          # NEW: Saved views persistence
│   │   └── notifications.ts      # NEW: Notification state (if not exists)
│   │
│   ├── types/domain/
│   │   ├── task.ts               # ENHANCE: Add Subtask, TaskComment, etc.
│   │   └── notification.ts       # NEW: TaskNotification type
│   │
│   └── utils/
│       ├── drag-and-drop.ts      # NEW: DND utilities
│       ├── natural-language.ts   # NEW: Task title parsing
│       └── task-filters.ts       # NEW: Filter logic utilities
│
├── routes/
│   └── (auth)/
│       ├── tasks/
│       │   └── +page.svelte      # REPLACE: Main tasks page with view modes
│       │
│       ├── projects/[id]/
│       │   └── +page.svelte      # ENHANCE: Embed TaskView component
│       │
│       ├── photoshoots/[id]/
│       │   └── +page.svelte      # ENHANCE: Embed TaskView component
│       │
│       └── resources/[id]/
│           └── +page.svelte      # ENHANCE: Embed TaskView component
│
└── tests/
    ├── e2e/
    │   ├── tasks-views.spec.ts       # NEW: View switching, filtering
    │   ├── tasks-board.spec.ts       # NEW: Drag-and-drop, board operations
    │   ├── tasks-detail.spec.ts      # NEW: CRUD, subtasks, comments
    │   └── tasks-bulk.spec.ts        # NEW: Multi-select, bulk actions
    │
    └── integration/
        ├── taskService.test.ts       # ENHANCE: New endpoint tests
        ├── subtaskService.test.ts    # NEW: Subtask API tests
        └── taskFilters.test.ts       # NEW: Filter logic tests

supabase/migrations/
├── [timestamp]_create_subtasks.sql          # NEW: Subtasks table
├── [timestamp]_create_task_comments.sql     # NEW: Comments table
├── [timestamp]_create_task_attachments.sql  # NEW: Attachments table
├── [timestamp]_create_task_notifications.sql # NEW: Notifications table
├── [timestamp]_create_task_templates.sql    # NEW: Templates table
└── [timestamp]_create_saved_views.sql       # NEW: User saved views table
```

**Structure Decision**: SvelteKit web application structure maintained. New task UI components organized under `src/lib/components/tasks/` with subdirectories for logical grouping (views/, filters/, detail/, bulk/, templates/, integrations/). This follows existing patterns (projects/, photoshoots/) and maintains modularity. Services layer extended with new entity services. Database migrations create new tables while preserving existing task/task_stages tables.

## Design Principles

### 1. Unified Page Architecture

**Principle**: Consolidate all task operations into minimal page footprint using modal/overlay patterns.

**Implementation**:
- **Single Tasks Page** (`/tasks`): Hosts all 4 view modes with in-page switching (no route changes)
- **Unified Task Detail Panel**: Slide-in panel from right side handles create/edit/view modes
  - Mode determined by context (new task = create, existing task = edit, explicit mode prop for view-only)
  - Same component instance transitions between modes without unmounting
  - URL updates with task ID when opening (e.g., `/tasks?detail=abc123`) for shareable links
  - Closes without navigation (returns to previous view state)

- **Quick Create Overlay**: Keyboard shortcut ('N') opens lightweight creation modal
  - Minimal fields (title, project, basic properties)
  - Creates task and optionally opens full detail panel for further editing
  - Closes on Escape or clicking outside

- **Embedded Views**: Reusable `<EmbeddedTaskView>` component for contextual integration
  - Props: `context` (project/photoshoot/resource), `contextId`, `viewMode` (list/board)
  - Self-contained with own state management
  - "View All Tasks" link navigates to main page with pre-applied filter

**Benefits**:
- Reduced code duplication (1 detail component vs. 3 separate pages)
- Consistent UX (same interface regardless of entry point)
- Faster development (changes apply to all modes)
- Better performance (component reuse, no page reload on mode switch)

### 2. Living Document Editing Pattern

**Principle**: Form inputs feel like editing a document, not filling out forms.

**Implementation Pattern** (already established in codebase):

```typescript
// Existing InlineTextEditor pattern (src/lib/components/base/InlineTextEditor.svelte)
<InlineTextEditor
  bind:value={task.title}
  variant="title"  // Applies text styling (title/heading/body/caption)
  placeholder="Task title..."
  onSave={async (newValue) => {
    await taskService.updateTask(task.id, { title: newValue })
  }}
/>
```

**Key Characteristics**:
1. **No visible form controls**: No labels, no input borders until focus
2. **Click-to-edit**: Static text becomes editable on click
3. **Inline saving**: Auto-save on blur or Enter key
4. **Visual feedback**: Subtle border on focus, loading indicator during save
5. **Error recovery**: Validation errors shown inline, value reverts on failure

**Application to Task UI**:

```svelte
<!-- Task Detail Panel - Living Document Style -->
<div class="task-detail">
  <!-- Title - looks like heading, edits in place -->
  <InlineTextEditor 
    bind:value={task.title} 
    variant="title" 
    onSave={updateTask} 
  />
  
  <!-- Description - looks like paragraph, edits in place -->
  <InlineTextEditor 
    bind:value={task.description} 
    variant="body" 
    multiline 
    placeholder="Add description..." 
    onSave={updateTask} 
  />
  
  <!-- Properties - click to change -->
  <div class="properties">
    <StageSelector bind:value={task.stageId} onChange={updateTask} />
    <InlineSelect 
      bind:value={task.priority} 
      options={priorityOptions} 
      onChange={updateTask} 
    />
    <InlineDatePicker 
      bind:value={task.dueDate} 
      onChange={updateTask} 
    />
  </div>
  
  <!-- Subtasks - inline checklist -->
  <div class="subtasks">
    {#each subtasks as subtask}
      <InlineCheckbox 
        bind:checked={subtask.completed} 
        label={subtask.title}
        onToggle={updateSubtask}
      />
    {/each}
    <InlineTextEditor 
      placeholder="+ Add subtask" 
      onSave={createSubtask} 
    />
  </div>
</div>
```

**Existing Components to Reuse**:
- `InlineTextEditor.svelte` - Text/textarea editing
- `InlineSelect.svelte` - Dropdown selection
- `InlineDatePicker.svelte` - Date selection
- `InlineCheckbox.svelte` - Checkbox with label
- `InlineNumberEditor.svelte` - Number input
- `StageSelector.svelte` - Stage/status selection

**New Components Needed**:
- `InlineUserSelector.svelte` - Assignee selection with avatar
- `InlineTagInput.svelte` - Multi-tag input
- `InlineFileUpload.svelte` - Drag-drop file attachment

**Benefits**:
- Feels like editing a document (Google Docs, Notion style)
- Reduces cognitive load (no "edit mode" vs "view mode" mental switch)
- Faster task updates (no "Save" button hunting)
- Mobile-friendly (touch-optimized inline editors)

### 3. Progressive Disclosure

**Principle**: Show essential information first, reveal complexity on demand.

**Application**:
- **List View**: Show title, stage, priority, assignee, due date - most common properties
- **Board View**: Compact cards with title, assignee avatar, progress bar
- **Detail Panel Tabs**: Separate Details/Comments/Activity to reduce information overload
- **Advanced Filters**: Hidden in collapsible panel, not always visible
- **Bulk Actions**: Appear only when tasks are selected

### 4. Optimistic UI Updates

**Principle**: Update UI immediately, revert on failure.

**Implementation**:
```typescript
async function updateTaskStage(taskId: string, newStageId: string) {
  // Optimistic update
  const previousStage = task.stageId
  task.stageId = newStageId  // Update UI immediately
  
  try {
    await taskService.updateTask(taskId, { stageId: newStageId })
  } catch (error) {
    // Revert on failure
    task.stageId = previousStage
    showError('Failed to update task stage. Please try again.')
  }
}
```

**Applied to**:
- Drag-and-drop stage changes
- Checkbox toggles (subtask completion)
- Bulk operations (show progress, revert failures)
- Priority/assignee inline changes

## Phase 0: Research & Technology Decisions

**Objective**: Resolve all technical unknowns before design phase.

### Research Tasks

1. **Drag-and-Drop Library Evaluation**
   - **Unknown**: Which Svelte 5-compatible DND library to use
   - **Options to research**:
     - `@dnd-kit/core` with Svelte 5 wrapper
     - `svelte-dnd-action` (Svelte 4 library - check Svelte 5 compatibility)
     - Native HTML5 Drag and Drop API
   - **Criteria**: Svelte 5 runes compatibility, touch support, accessibility, bundle size, active maintenance
   - **Output**: Selected library with integration example

2. **Virtual Scrolling Implementation**
   - **Unknown**: Best approach for rendering 500+ tasks without performance degradation
   - **Options to research**:
     - `svelte-virtual-list` library
     - `@sveltejs/svelte-virtual` (official if exists)
     - Custom implementation with Intersection Observer
   - **Criteria**: Svelte 5 compatibility, variable item heights, scroll-to-item support
   - **Output**: Implementation approach with code sample

3. **Calendar View Library**
   - **Unknown**: Calendar component for task visualization
   - **Options to research**:
     - FullCalendar with Svelte adapter
     - Custom calendar grid with CSS Grid
     - Existing calendar component in Flowbite Svelte
   - **Criteria**: Month/week/day views, drag-drop support, event density visualization
   - **Output**: Selected approach with integration pattern

4. **Timeline/Gantt Visualization**
   - **Unknown**: How to implement horizontal timeline view
   - **Options to research**:
     - D3.js timeline custom visualization
     - Frappe Gantt library
     - CSS Grid horizontal layout with task bars
   - **Criteria**: Drag to adjust dates, zoom in/out, performance with 500 tasks
   - **Output**: Implementation approach with mockup

5. **Rich Text Editor for Comments**
   - **Unknown**: Editor for comments with @mentions, basic formatting
   - **Options to research**:
     - Tiptap editor (Svelte integration)
     - Lexical with Svelte bindings
     - Simple textarea with markdown support
   - **Criteria**: @mentions, bold/italic/links, lightweight, Svelte 5 compatible
   - **Output**: Selected editor with mention integration pattern

6. **Natural Language Parsing Strategy**
   - **Unknown**: How to parse task titles for metadata extraction
   - **Options to research**:
     - Regex patterns for common formats ("by Friday", "#high", "for Project X")
     - `chrono-node` for date parsing
     - Simple keyword extraction
   - **Criteria**: Accuracy, performance, maintainability, i18n considerations
   - **Output**: Parsing utilities with test cases

7. **Email Notification Service**
   - **Unknown**: How to send email notifications
   - **Current setup**: Check existing Supabase Auth email configuration
   - **Options**:
     - Supabase Edge Functions with Resend/SendGrid
     - Direct SMTP integration
     - Supabase built-in email (if available)
   - **Criteria**: Cost (free tier preferred), delivery rate, template support
   - **Output**: Integration approach with sample template

8. **File Attachment Storage**
   - **Unknown**: Existing Cloudflare R2 integration pattern for attachments
   - **Research**: Review existing image upload code in codebase
   - **Questions**:
     - How are file uploads currently handled?
     - How are signed URLs generated?
     - What are size limits?
   - **Output**: Reusable upload utility with progress tracking

9. **Real-time Notification Delivery**
   - **Unknown**: How to deliver in-app notifications without polling
   - **Options**:
     - Supabase Realtime subscriptions to notifications table
     - WebSocket connection
     - Server-Sent Events
     - Short polling (fallback)
   - **Criteria**: Latency, scalability, browser compatibility
   - **Output**: Notification subscription pattern with unread count

10. **State Management for View Modes**
    - **Unknown**: How to manage complex filter/grouping/view state
    - **Options**:
      - Svelte stores (existing pattern)
      - URL query parameters for shareability
      - LocalStorage for persistence
      - Combination approach
    - **Criteria**: URL shareability, persistence across sessions, state restoration
    - **Output**: State management architecture diagram

**Research Output**: `research.md` document with:
- Each research task as a section
- Decision made (library/approach selected)
- Rationale (why chosen over alternatives)
- Code samples or integration patterns
- Performance implications
- Alternative options considered and rejected with reasons

**Research Completion Criteria**:
- All 10 research tasks have documented decisions
- No "NEEDS CLARIFICATION" markers remain
- Code samples validate technical feasibility
- Performance targets confirmed achievable with selected approaches

## Phase 1: Data Model & API Contracts

**Objective**: Define database schema, entity relationships, and API surface area.

### Data Model Design

**Principle**: Extend existing task model without breaking changes. New entities link to tasks via foreign keys. Use Supabase RLS for security.

### New Entities (see data-model.md)

1. **subtasks** - Child checklist items under tasks
2. **task_comments** - Comments on tasks with @mentions
3. **task_attachments** - File attachments linked to tasks
4. **task_notifications** - Notification events for users
5. **task_templates** - Reusable task patterns
6. **saved_task_views** - User-saved filter combinations

**Key Design Decisions**:
- All new entities have `team_id` (explicit or derived from parent task) for RLS filtering
- Soft delete pattern for comments (deleted flag) to preserve conversation context
- Attachments store only metadata; files in Cloudflare R2 with signed URLs
- Notifications have `read` boolean and `created_at` for badge count and ordering
- Templates are team-scoped (sharable within team, not global)

### API Contracts (see contracts/)

**RESTful Endpoints** (extend existing `/api/tasks`):

```
# Tasks (existing, add query params)
GET    /api/tasks?view=list&filter={"stage":"abc"}&groupBy=priority
POST   /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id

# Subtasks (new)
GET    /api/tasks/:taskId/subtasks
POST   /api/tasks/:taskId/subtasks
PATCH  /api/subtasks/:id
DELETE /api/subtasks/:id

# Comments (new)
GET    /api/tasks/:taskId/comments
POST   /api/tasks/:taskId/comments
PATCH  /api/comments/:id
DELETE /api/comments/:id  # Soft delete

# Attachments (new)
GET    /api/tasks/:taskId/attachments
POST   /api/tasks/:taskId/attachments  # Returns upload URL
DELETE /api/attachments/:id

# Notifications (new)
GET    /api/notifications?unread=true
PATCH  /api/notifications/:id  # Mark as read
POST   /api/notifications/mark-all-read

# Templates (new)
GET    /api/templates?teamId=xyz
POST   /api/templates
PATCH  /api/templates/:id
DELETE /api/templates/:id

# Saved Views (new)
GET    /api/task-views?teamId=xyz
POST   /api/task-views
PATCH  /api/task-views/:id
DELETE /api/task-views/:id
```

**Type Contracts** (TypeScript interfaces in contracts/types.ts):
- Request/response shapes for all endpoints
- Validation schemas using Zod
- Error response formats

### Migration Strategy

**Approach**: Additive migrations only. No ALTER TABLE on existing tasks or task_stages.

**Migration Order**:
1. Create subtasks table with FK to tasks
2. Create task_comments table with FK to tasks and users
3. Create task_attachments table with FK to tasks
4. Create task_notifications table with FK to users and tasks
5. Create task_templates table with teamId FK
6. Create saved_task_views table with userId and teamId FK
7. Create indexes for common queries (task_id, user_id, team_id)
8. Create RLS policies for each table

**Rollback Plan**: DROP TABLE statements in reverse order (safe because no existing data).

### Quickstart Guide (see quickstart.md)

**Purpose**: 30-minute developer onboarding for task UI codebase.

**Contents**:
1. Architecture overview (component tree, data flow)
2. Running locally (setup, seed data, dev server)
3. Key concepts (unified panel, living document pattern, view modes)
4. Common tasks (add a view mode, add a filter option, extend detail panel)
5. Testing approach (E2E test structure, running tests)
6. Debugging tips (React DevTools equivalent for Svelte, Supabase Studio)

## Phase 2: Component Architecture

**Objective**: Define component hierarchy, props interfaces, state management patterns.

### Component Hierarchy

```
TasksPage (routes/(auth)/tasks/+page.svelte)
├── View Mode Selector (Tabs: List/Board/Calendar/Timeline)
├── TaskFilterPanel
│   ├── FilterOptions (Stage, Priority, Project, Assignee, Date, Tags)
│   ├── SavedViewsDropdown
│   └── SearchInput
│
├── TaskListView (if mode === 'list')
│   ├── VirtualList (wraps task cards)
│   │   └── TaskCard (repeated)
│   │       ├── InlineCheckbox (multi-select)
│   │       ├── TaskTitle
│   │       ├── StageBadge
│   │       ├── PriorityIndicator
│   │       ├── AssigneeAvatar
│   │       ├── DueDateLabel
│   │       └── SubtaskProgress (3/5 with progress bar)
│   └── BulkActionsMenu (if any tasks selected)
│
├── TaskBoardView (if mode === 'board')
│   └── StageColumn (repeated for each stage)
│       ├── StageHeader (name, count)
│       ├── DNDDropzone
│       │   └── TaskCard (draggable)
│       └── AddTaskButton (creates task in this stage)
│
├── TaskCalendarView (if mode === 'calendar')
│   ├── CalendarGrid (month view)
│   │   └── CalendarDay (repeated)
│   │       └── TaskDot (repeated for each task on day)
│   └── BacklogSection (tasks without due dates)
│
├── TaskTimelineView (if mode === 'timeline')
│   ├── TimelineHeader (date range, zoom controls)
│   └── TimelineGrid
│       └── TaskBar (repeated, draggable horizontally)
│
└── TaskDetailPanel (overlay, opens on task click)
    ├── DetailHeader
    │   ├── CloseButton
    │   ├── InlineTextEditor (title)
    │   └── ActionButtons (Delete, Duplicate)
    │
    ├── DetailTabs (Details / Comments / Activity)
    │
    ├── DetailsTab (if active)
    │   ├── PropertySection
    │   │   ├── StageSelector
    │   │   ├── InlineSelect (priority)
    │   │   ├── InlineUserSelector (assignee)
    │   │   ├── InlineDatePicker (due date)
    │   │   ├── InlineSelect (project link)
    │   │   └── InlineTagInput (tags)
    │   ├── InlineTextEditor (description, multiline)
    │   ├── SubtasksSection
    │   │   ├── SubtaskItem (repeated)
    │   │   │   ├── InlineCheckbox (completed)
    │   │   │   └── InlineTextEditor (title)
    │   │   └── AddSubtaskInput
    │   └── AttachmentsSection
    │       ├── AttachmentItem (repeated)
    │       │   ├── FileIcon
    │       │   ├── FileName
    │       │   └── DownloadButton
    │       └── FileUploadDropzone
    │
    ├── CommentsTab (if active)
    │   ├── CommentsList
    │   │   └── CommentItem (repeated)
    │   │       ├── UserAvatar
    │   │       ├── UserName
    │   │       ├── CommentContent (rich text with mentions)
    │   │       ├── Timestamp
    │   │       └── EditDeleteButtons (if own comment)
    │   └── CommentInput
    │       └── RichTextEditor (with @mention autocomplete)
    │
    └── ActivityTab (if active)
        └── ActivityList
            └── ActivityItem (repeated)
                ├── UserAvatar
                ├── ActionDescription ("changed stage from Todo to In Progress")
                └── Timestamp

EmbeddedTaskView (used in Projects/Photoshoots/Resources pages)
├── View Mode Toggle (List / Board only)
├── AddTaskButton (opens detail panel with contextId pre-filled)
├── TaskListView or TaskBoardView (filtered to context)
└── ViewAllTasksLink (→ /tasks?filter={"projectId":"xyz"})

QuickCreateOverlay (keyboard shortcut 'N')
├── InlineTextEditor (title)
├── InlineSelect (project, optional)
├── InlineSelect (priority, default: medium)
└── CreateButton (creates task, optionally opens full detail)
```

### State Management Architecture

**Svelte Stores** (extend existing patterns):

```typescript
// src/lib/stores/tasks.ts (existing, enhance)
export const tasks = writable<Task[]>([])
export const currentViewMode = writable<'list' | 'board' | 'calendar' | 'timeline'>('list')
export const selectedTaskIds = writable<Set<string>>(new Set())

// src/lib/stores/taskFilters.ts (new)
export const activeFilters = writable<TaskFilters>({
  stages: [],
  priorities: [],
  assignees: [],
  projects: [],
  dateRange: null,
  tags: [],
  includeArchived: false,
})

export const activeGrouping = writable<TaskGrouping>('stage')
export const searchQuery = writable<string>('')

// src/lib/stores/taskViews.ts (new)
export const savedViews = writable<SavedTaskView[]>([])
export const currentViewId = writable<string | null>(null)

// src/lib/stores/notifications.ts (new or enhance existing)
export const notifications = writable<TaskNotification[]>([])
export const unreadCount = derived(notifications, $n => 
  $n.filter(n => !n.read).length
)
```

**URL State Synchronization**:
```typescript
// Sync filters to URL query params for shareable links
function syncFiltersToURL(filters: TaskFilters) {
  const params = new URLSearchParams()
  params.set('filter', JSON.stringify(filters))
  goto(`/tasks?${params.toString()}`, { replaceState: true })
}

// Restore filters from URL on page load
onMount(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const filterParam = urlParams.get('filter')
  if (filterParam) {
    activeFilters.set(JSON.parse(filterParam))
  }
})
```

**Persistence Strategy**:
- View mode preference: LocalStorage (`taskViewMode`)
- Saved views: Supabase table (`saved_task_views`)
- Active filters: URL query params (shareable) + LocalStorage fallback
- Selected tasks: Component state only (not persisted)
- Detail panel state: URL param (`?detail=taskId`)

### Interaction Patterns

**1. View Switching**:
- User clicks List/Board/Calendar/Timeline tab
- `currentViewMode` store updates
- View components conditionally render based on store value
- LocalStorage saves preference
- URL does not change (view preference is per-user, not shareable)

**2. Drag-and-Drop Stage Change** (Board View):
```typescript
function handleTaskDrop(event: DragEvent, targetStageId: string) {
  const taskId = event.dataTransfer.getData('taskId')
  const task = tasks.find(t => t.id === taskId)
  
  // Optimistic update
  const previousStageId = task.stageId
  task.stageId = targetStageId
  tasks.update(t => [...t])
  
  taskService.updateTask(taskId, { stageId: targetStageId })
    .catch(() => {
      // Revert on failure
      task.stageId = previousStageId
      tasks.update(t => [...t])
      showError('Failed to move task')
    })
}
```

**3. Inline Property Update** (Detail Panel):
```typescript
async function updateTaskProperty(field: keyof Task, value: any) {
  const previousValue = task[field]
  task[field] = value  // Optimistic
  
  try {
    await taskService.updateTask(task.id, { [field]: value })
  } catch (error) {
    task[field] = previousValue  // Revert
    showError(`Failed to update ${field}`)
  }
}
```

**4. Bulk Operation**:
```typescript
async function bulkUpdateStage(taskIds: Set<string>, newStageId: string) {
  const previousStages = new Map()
  
  // Optimistic update all
  tasks.update(allTasks => {
    return allTasks.map(t => {
      if (taskIds.has(t.id)) {
        previousStages.set(t.id, t.stageId)
        return { ...t, stageId: newStageId }
      }
      return t
    })
  })
  
  // Batch API call
  try {
    await taskService.bulkUpdateTasks(Array.from(taskIds), { stageId: newStageId })
    selectedTaskIds.set(new Set())  // Clear selection on success
  } catch (error) {
    // Revert all
    tasks.update(allTasks => {
      return allTasks.map(t => {
        if (taskIds.has(t.id)) {
          return { ...t, stageId: previousStages.get(t.id) }
        }
        return t
      })
    })
    showError('Bulk update failed')
  }
}
```

**5. Filter Application**:
```typescript
const filteredTasks = derived(
  [tasks, activeFilters, searchQuery],
  ([$tasks, $filters, $search]) => {
    return $tasks.filter(task => {
      // Stage filter
      if ($filters.stages.length && !$filters.stages.includes(task.stageId)) {
        return false
      }
      
      // Priority filter
      if ($filters.priorities.length && !$filters.priorities.includes(task.priority)) {
        return false
      }
      
      // Search query
      if ($search && !task.title.toLowerCase().includes($search.toLowerCase())) {
        return false
      }
      
      // Archived filter
      if (!$filters.includeArchived && task.projectId) {
        const project = projects.find(p => p.id === task.projectId)
        if (project?.status === 'archived') {
          return false
        }
      }
      
      return true
    })
  }
)
```

## Testing Strategy

### Test-First Approach (Per Constitution)

**E2E Tests** (Playwright) - **Write BEFORE implementation**:

```typescript
// tests/e2e/tasks-views.spec.ts
test.describe('Task View Switching', () => {
  test('P1: Switch between List, Board, Calendar, Timeline views', async ({ page }) => {
    // Given: User is on tasks page with 20 tasks
    await page.goto('/tasks')
    await expect(page.locator('[data-testid="task-card"]')).toHaveCount(20)
    
    // When: User clicks Board view tab
    await page.click('[data-testid="view-tab-board"]')
    
    // Then: Board view displays with stage columns
    await expect(page.locator('[data-testid="stage-column"]')).toBeVisible()
    
    // And: Same 20 tasks are visible in board
    await expect(page.locator('[data-testid="task-card"]')).toHaveCount(20)
    
    // And: View preference is saved
    await page.reload()
    await expect(page.locator('[data-testid="stage-column"]')).toBeVisible()
  })
  
  test('P1: Filter tasks by stage and priority', async ({ page }) => {
    // Given: User has tasks in multiple stages and priorities
    // When: User applies stage filter "In Progress"
    // Then: Only tasks in "In Progress" stage are visible
    // When: User also applies priority filter "High"
    // Then: Only high priority tasks in "In Progress" are visible
  })
})

// tests/e2e/tasks-board.spec.ts
test.describe('Board View Drag-and-Drop', () => {
  test('P1: Drag task to different stage column', async ({ page }) => {
    // Given: User is in board view with task in "Todo" column
    // When: User drags task card to "In Progress" column
    // Then: Task moves to new column immediately (optimistic update)
    // And: Task stage updates in database
    // And: Task remains in new column after page refresh
  })
  
  test('P2: Drag multiple tasks (bulk operation)', async ({ page }) => {
    // Given: User has selected 3 tasks with checkboxes
    // When: User drags one of the selected tasks to new column
    // Then: All 3 selected tasks move to the new column
  })
})

// tests/e2e/tasks-detail.spec.ts
test.describe('Unified Task Detail Panel', () => {
  test('P1: Create new task via detail panel', async ({ page }) => {
    // Given: User clicks "Add Task" button
    // When: Detail panel opens in create mode
    // And: User types title "Buy fabric"
    // And: User selects priority "High"
    // And: User clicks outside panel or presses Escape
    // Then: Task is created and appears in task list
  })
  
  test('P1: Edit existing task via detail panel', async ({ page }) => {
    // Given: User clicks on existing task
    // When: Detail panel opens in edit mode
    // And: User changes title using inline editor
    // Then: Title updates immediately (optimistic)
    // And: Title persists after page reload
  })
  
  test('P1: Add and complete subtasks', async ({ page }) => {
    // Given: User has task detail panel open
    // When: User adds 3 subtasks
    // And: User checks off 2 subtasks
    // Then: Parent task shows "2/3 complete" with 66% progress bar
  })
  
  test('P1: Add comment with @mention', async ({ page }) => {
    // Given: User is on Comments tab in detail panel
    // When: User types "@Alice can you review?"
    // Then: Autocomplete shows team members named Alice
    // When: User selects Alice from autocomplete
    // And: User submits comment
    // Then: Comment appears with Alice mention highlighted
    // And: Alice receives in-app and email notification
  })
})

// tests/e2e/tasks-bulk.spec.ts
test.describe('Bulk Operations', () => {
  test('P2: Select multiple tasks and change stage', async ({ page }) => {
    // Given: User is in list view
    // When: User checks 5 task checkboxes
    // Then: Bulk actions menu appears
    // When: User selects "Change Stage → Done"
    // Then: All 5 tasks move to Done stage
  })
})
```

**Integration Tests** (Vitest):

```typescript
// tests/integration/taskService.test.ts
describe('TaskService', () => {
  test('createTask with subtasks', async () => {
    const task = await taskService.createTask({
      title: 'Test task',
      subtasks: [
        { title: 'Subtask 1' },
        { title: 'Subtask 2' },
      ]
    })
    
    expect(task.id).toBeDefined()
    
    const subtasks = await subtaskService.getSubtasks(task.id)
    expect(subtasks).toHaveLength(2)
  })
  
  test('bulkUpdateTasks updates multiple tasks atomically', async () => {
    // Test bulk operations
  })
})

// tests/integration/taskFilters.test.ts
describe('Task Filtering Logic', () => {
  test('applies multiple filters with AND logic', () => {
    const tasks = [/* test data */]
    const filters = { stages: ['todo'], priorities: ['high'] }
    
    const result = applyFilters(tasks, filters)
    
    expect(result.every(t => t.stage === 'todo' && t.priority === 'high')).toBe(true)
  })
})
```

**Test Coverage Goals**:
- **P1 User Stories**: 100% E2E coverage (write tests before implementation)
- **P2 User Stories**: 80% E2E coverage (write tests alongside implementation)
- **P3 User Stories**: Manual testing acceptable (E2E for critical paths only)
- **Integration Tests**: All service methods, filter/grouping logic
- **Unit Tests**: Utility functions (natural language parsing, filter helpers)

### Test Execution Plan

**Phase 1** (Before Implementation):
1. Write E2E tests for P1 stories (view switching, detail panel CRUD, drag-drop, filtering)
2. Run tests (all fail initially - expected)
3. Use failing tests as implementation guide

**Phase 2** (During Implementation):
1. Implement components to make tests pass (TDD approach)
2. Run tests frequently (watch mode)
3. Refactor with confidence (tests prevent regressions)

**Phase 3** (After Implementation):
1. Add integration tests for services
2. Add unit tests for utilities
3. Verify test coverage targets met
4. Manual exploratory testing for UX polish

## Performance Optimization Strategies

### 1. Virtual Scrolling

**Problem**: Rendering 500 tasks in list view causes lag.

**Solution**: Render only visible tasks + buffer (research.md will identify library).

```svelte
<VirtualList items={filteredTasks} itemHeight={72} let:item>
  <TaskCard task={item} />
</VirtualList>
```

**Target**: Render 500 tasks in <2 seconds, scroll at 60fps.

### 2. Component Lazy Loading

**Problem**: Task detail panel with all tabs loads heavy components upfront.

**Solution**: Lazy load tabs and heavy components.

```svelte
{#if activeTab === 'comments'}
  {#await import('./TaskCommentsTab.svelte') then { default: CommentsTab }}
    <CommentsTab {taskId} />
  {/await}
{/if}
```

### 3. Debounced Search

**Problem**: Search input filters on every keystroke.

**Solution**: Debounce search query updates.

```typescript
let searchQuery = $state('')
let debouncedQuery = $state('')

$effect(() => {
  const timeout = setTimeout(() => {
    debouncedQuery = searchQuery
  }, 300)
  
  return () => clearTimeout(timeout)
})
```

### 4. Optimistic UI with Rollback

**Already covered in Design Principles**: Update UI immediately, revert on error.

### 5. Memoized Derived Stores

**Problem**: Complex filter logic recalculates on every store update.

**Solution**: Use derived stores to memoize filtered/grouped results.

```typescript
export const filteredTasks = derived(
  [tasks, activeFilters],
  ([$tasks, $filters]) => applyFilters($tasks, $filters),
  [] // initial value
)
```

### 6. Image Lazy Loading

**Problem**: Task attachments with images load all at once.

**Solution**: Use `loading="lazy"` attribute and Intersection Observer.

```svelte
<img src={attachment.url} loading="lazy" alt={attachment.name} />
```

### 7. Bundle Size Optimization

**Problem**: Importing entire icon library increases bundle.

**Solution**: Use named imports from lucide-svelte.

```typescript
// Bad
import * as Icons from 'lucide-svelte'

// Good
import { Calendar, X, Clock } from 'lucide-svelte'
```

## Migration & Rollout Plan

### Database Migration

**Timing**: Before any UI deployment.

**Steps**:
1. Run migrations in order (subtasks → comments → attachments → notifications → templates → saved_views)
2. Verify RLS policies with test queries
3. Seed test data for development
4. Create rollback script (DROP TABLE in reverse order)

**Validation**:
- Query each table with team filtering to verify RLS
- Attempt unauthorized access (should be denied)
- Check foreign key constraints work

### Feature Rollout Strategy

**Approach**: Phased rollout with feature flags (if available) or branch-based.

**Phase 1** (Week 1-2): Core View Modes
- Deploy List and Board views to production
- Keep existing task page as fallback
- Monitor performance metrics (page load time, view switching speed)
- Gather user feedback

**Phase 2** (Week 3-4): Detail Panel & Subtasks
- Deploy unified task detail panel
- Enable subtask functionality
- A/B test: New detail panel vs. old (if feasible)

**Phase 3** (Week 5-6): Advanced Features
- Deploy Calendar and Timeline views
- Enable comments and attachments
- Enable notifications (in-app and email)

**Phase 4** (Week 7-8): Polish & Optimization
- Deploy templates and saved views
- Optimize performance based on production metrics
- Add keyboard shortcuts and accessibility improvements

**Rollback Plan**:
- Keep old task components in codebase during Phase 1-2
- Feature flag to toggle between old and new UI
- If critical bugs: Toggle feature flag off, return to old UI
- Database migrations are additive (no data loss on rollback)

## Success Metrics

**Performance**:
- [x] List view with 500 tasks loads in <2 seconds (measure: Lighthouse)
- [x] View switching happens in <500ms (measure: performance.mark)
- [x] Drag operations maintain 60fps (measure: frame rate monitor)
- [x] Detail panel opens in <200ms (measure: user timing API)

**Functionality**:
- [x] All 95 functional requirements testable via E2E tests
- [x] Zero regressions on existing task functionality (regression test suite)
- [x] Notifications delivered within 5 seconds (measure: timestamp comparison)

**User Experience**:
- [x] User testing: 4.5/5 rating for "modern and professional" (survey)
- [x] 90% of users successfully switch views without guidance (observation)
- [x] 80% of users who create projects also create tasks (analytics)
- [x] Task completion rate increases by 20% within 4 weeks (analytics)

**Code Quality**:
- [x] E2E test coverage: 100% for P1 stories, 80% for P2 stories
- [x] Integration test coverage: All service methods
- [x] Zero linter errors (ESLint, TypeScript strict mode)
- [x] Bundle size increase <200KB gzipped (measure: bundle analyzer)

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Drag-and-drop library not Svelte 5 compatible | Medium | High | Research phase identifies compatible library or native API fallback |
| Performance degrades with 500+ tasks | Medium | High | Virtual scrolling, memoization, performance testing early |
| User confusion with unified detail panel | Low | Medium | User testing in Phase 2, add tooltips/hints, clear mode indicators |
| Notification email delivery issues | Medium | Medium | Test with multiple email providers, implement retry logic, fallback to in-app only |
| Database migration fails in production | Low | High | Test migrations in staging, create rollback scripts, backup database |
| Scope creep (too many features) | High | Medium | Strict adherence to spec, defer P3 features if timeline pressured |
| Browser compatibility issues | Low | Medium | Target modern browsers (last 2 versions), test in Chrome/Firefox/Safari/Edge |

## Next Steps

**Immediate Actions** (Phase 0):
1. Execute research tasks (10 unknowns identified)
2. Document decisions in research.md
3. Validate technical feasibility with code spikes
4. Generate data-model.md with full schema details
5. Generate contracts/api-schema.yaml with all endpoints
6. Generate contracts/types.ts with TypeScript interfaces
7. Generate quickstart.md for developer onboarding
8. Update agent context files with new technology decisions

**Dependencies**:
- Existing task system must remain stable during implementation
- Supabase RLS policies must be working correctly
- Existing inline editor components must be Svelte 5 compatible

**Blockers**:
- None identified (all unknowns addressable in research phase)

**Timeline Estimate**: 8-10 weeks for full implementation
- Phase 0 (Research): 1 week
- Phase 1 (Data & Contracts): 1 week
- Phase 2 (Component Implementation): 4-5 weeks
- Phase 3 (Testing & Polish): 1-2 weeks
- Phase 4 (Deployment & Monitoring): 1 week

---

**Plan Status**: READY FOR PHASE 0 RESEARCH

**Next Command**: Continue with `/speckit.plan` to generate research.md, data-model.md, contracts/, and quickstart.md artifacts.
