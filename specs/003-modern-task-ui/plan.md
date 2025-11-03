# Implementation Plan: Modern Task Management UI

**Branch**: `003-modern-task-ui` | **Date**: 2025-11-03 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/003-modern-task-ui/spec.md`

## Summary

This feature implements a complete UI redesign of the task management system to match modern task applications like Monday, Asana, Trello, and ClickUp. The redesign includes:

- **Four View Modes**: List, Kanban Board, Calendar, Timeline
- **Rich Task Details**: Subtasks, comments with @mentions, file attachments, activity logs
- **Custom Fields**: Team-specific custom fields with 10 field types (text, textarea, number, currency, dropdown, multi-select, checkbox, date, URL, email)
- **Task Labels**: Color-coded flexible categorization with multi-label support
- **ADHD-Friendly Features**: 
  - "What should I do now?" task suggestion algorithm
  - Focus Mode for distraction-free work
  - Celebration animations and streak tracking
  - Stage-level deadlines to break down long projects
  - Progress visibility everywhere
  - AI-assisted task breakdown suggestions
- **Contextual Integration**: Tasks embedded in project, photoshoot, and resource pages
- **Advanced Filtering**: Multi-criteria filters, saved views, grouping options
- **Standalone Tasks**: Tasks not tied to specific projects (shopping lists, general planning)
- **Templates**: Reusable task patterns with custom field values
- **Real-time Notifications**: In-app and email notifications for assignments, comments, @mentions, status changes

The technical approach uses native HTML5 drag-and-drop, Tanstack Virtual for large lists, and Contenteditable for rich text. The "living document" design philosophy provides inline editing throughout, making task management feel fluid and natural.

**Accessibility Focus**: This implementation prioritizes neurodivergent users, particularly those with ADHD, by addressing executive function challenges like decision paralysis, task initiation difficulty, time blindness, and motivation issues. Features are designed by someone with ADHD for users with ADHD.

---

## Technical Context

**Language/Version**: TypeScript with Svelte 5 (runes-based reactivity)  
**Primary Dependencies**: SvelteKit, Flowbite Svelte, Tanstack Virtual, Supabase Client  
**Storage**: Supabase PostgreSQL with Row Level Security (RLS)  
**Testing**: Playwright (E2E), Vitest (unit/integration)  
**Target Platform**: Web (desktop + mobile responsive), Cloudflare Pages  
**Project Type**: Web application (SvelteKit)  
**Performance Goals**: 
- Render 500 tasks < 2 seconds
- Drag operations < 100ms
- View switching < 500ms
- Virtual scrolling for 100+ tasks
  
**Constraints**: 
- No changes to existing `tasks` or `task_stages` tables
- Backward compatible with existing task data
- < 50KB bundle size increase for core features
- Support mobile devices (responsive design)
  
**Scale/Scope**: 
- 11 User Stories (P1-P3 priorities)
- 159 Functional Requirements
- 13 new database tables total:
  - 6 core tables (subtasks, comments, attachments, notifications, templates, saved_views)
  - 2 custom fields tables (custom_field_definitions, task_custom_field_values)
  - 5 ADHD/label tables (task_labels, task_label_assignments, task_stage_deadlines, user_task_stats, task_breakdown_patterns)
- 29 new indexes
- 52 RLS policies
- 35+ API endpoints (REST-style over Supabase)
- 20+ new Svelte components

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

Verify compliance with `.specify/memory/constitution.md`:

- [X] **Project-Centric**: Tasks are project-scoped (linked to projects/resources) or team-scoped (standalone tasks)
- [X] **Team-Based**: All tasks respect team boundaries via existing `team_id` and RLS policies
- [X] **Feature Scope**: Feature classified as **MVP Core - Tracking Domain** enhancement
- [X] **Complete Workflow**: Tasks support planning → creation → events → post-production phases
- [X] **MVP First**: Scope is focused on UI redesign with essential collaborative features (comments, notifications)
- [X] **Test-First**: Critical user journeys tested (task CRUD, view switching, drag-and-drop, filtering)
- [X] **Modular**: Feature fits cleanly into **Tracking Domain**, integrates with Projects, Events, Resources
- [X] **Cost-Conscious**: No new paid services; uses existing Supabase, Cloudflare R2, Resend (email)
- [X] **Future-Ready**: Data model accommodates custom fields, templates, real-time collaboration
- [X] **Data Privacy**: RLS policies enforce team isolation; task attachments use signed URLs
- [X] **Tech Stack**: Uses SvelteKit, Svelte 5, Flowbite, Tailwind, Supabase, Cloudflare (✅ compliant)
- [X] **Navigation**: No new top-level routes; tasks accessible via existing `/tasks` route

**Feature Phase**: MVP Core (Tracking Domain enhancement)

**Violations**: None

---

## Project Structure

### Documentation (this feature)

```
specs/003-modern-task-ui/
├── spec.md              # Feature specification with 8 user stories
├── plan.md              # This file
├── research.md          # Technical research (drag-and-drop, virtual scrolling, rich text, etc.)
├── data-model.md        # Database schema for 8 new tables
├── quickstart.md        # Developer onboarding guide
├── contracts/
│   ├── api-schema.yaml  # OpenAPI 3.0 spec for 30+ endpoints
│   └── types.ts         # TypeScript type definitions (40+ interfaces)
├── checklists/
│   └── requirements.md  # Specification quality checklist
└── tasks.md             # Implementation task breakdown (153 tasks, 4 phases)
```

### Source Code (repository root)

```
src/lib/
├── types/
│   └── domain/
│       └── task.ts                         # Enhanced with Subtask, TaskComment, TaskAttachment, 
│                                           # TaskNotification, TaskTemplate, SavedTaskView, 
│                                           # CustomFieldDefinition, TaskCustomFieldValue interfaces
├── api/
│   └── services/
│       ├── subtaskService.ts               # NEW: Subtask CRUD
│       ├── taskCommentService.ts           # NEW: Comment CRUD with @mentions
│       ├── taskAttachmentService.ts        # NEW: File upload/download
│       ├── taskNotificationService.ts      # NEW: Notification management
│       ├── taskTemplateService.ts          # NEW: Template CRUD and application
│       ├── customFieldService.ts           # NEW: Custom field definition management
│       ├── taskCustomFieldValueService.ts  # NEW: Custom field value management
│       └── taskService.ts                  # ENHANCED: listWithFilters, bulkUpdate, bulkDelete
├── stores/
│   ├── taskFilters.ts                      # NEW: Filter state management
│   ├── taskViews.ts                        # NEW: Saved views management
│   └── notifications.ts                    # NEW: In-app notification state
├── utils/
│   ├── drag-and-drop.ts                    # NEW: Native HTML5 DnD helpers
│   ├── task-filters.ts                     # NEW: Client-side filtering logic
│   └── natural-language.ts                 # NEW: Task input parsing
├── components/
│   ├── base/
│   │   ├── InlineTextEditor.svelte         # EXISTING: Used for task title/description
│   │   ├── InlineUserSelector.svelte       # NEW: Assignee selection
│   │   ├── InlineTagInput.svelte           # NEW: Tag management
│   │   ├── InlineFileUpload.svelte         # NEW: File attachment
│   │   └── InlineCustomFieldInput.svelte   # NEW: Custom field input widgets
│   └── tasks/
│       ├── views/
│       │   ├── TaskListView.svelte         # NEW: List view with virtual scrolling
│       │   ├── TaskBoardView.svelte        # NEW: Kanban board with DnD
│       │   ├── TaskCalendarView.svelte     # NEW: Calendar view with date picker
│       │   └── TaskTimelineView.svelte     # NEW: Timeline/Gantt view
│       ├── TaskDetail.svelte               # REFACTORED: Unified create/edit/view panel
│       ├── TaskCard.svelte                 # ENHANCED: Card component for list/board
│       ├── TaskFilterPanel.svelte          # NEW: Advanced filter UI
│       ├── TaskBulkActions.svelte          # NEW: Multi-select operations
│       ├── TaskQuickCreate.svelte          # NEW: Quick-create overlay (keyboard shortcut)
│       ├── SubtaskList.svelte              # NEW: Subtask management
│       ├── TaskComments.svelte             # NEW: Comment thread with @mentions
│       ├── TaskAttachments.svelte          # NEW: File upload/display
│       ├── TaskActivityLog.svelte          # NEW: Change history display
│       ├── TaskTemplateSelector.svelte     # NEW: Template picker
│       └── CustomFieldSection.svelte       # NEW: Custom fields display/edit

src/routes/
└── (app)/
    └── tasks/
        └── +page.svelte                    # ENHANCED: Main task page with view switching

supabase/
└── migrations/
    ├── 20251103150000_create_subtasks.sql
    ├── 20251103150001_create_task_comments.sql
    ├── 20251103150002_create_task_attachments.sql
    ├── 20251103150003_create_task_notifications.sql
    ├── 20251103150004_create_task_templates.sql
    ├── 20251103150005_create_saved_task_views.sql
    ├── 20251103150006_create_custom_field_definitions.sql
    └── 20251103150007_create_task_custom_field_values.sql

tests/
└── e2e/
    ├── tasks-list-view.spec.ts             # NEW: List view tests
    ├── tasks-board-view.spec.ts            # NEW: Board view with DnD tests
    ├── tasks-filtering.spec.ts             # NEW: Advanced filtering tests
    ├── tasks-detail-panel.spec.ts          # NEW: Unified panel tests
    ├── tasks-custom-fields.spec.ts         # NEW: Custom field tests
    └── tasks-notifications.spec.ts         # NEW: Notification tests
```

**Structure Decision**: Web application structure with clear separation between data layer (`api/services`), state management (`stores`), UI components (`components/tasks`), and utilities (`utils`). All new code is additive; existing task components are enhanced/refactored with backward compatibility.

---

## Design Philosophy: "Living Document"

The "living document" design makes task management feel like editing a document rather than filling out forms:

1. **Inline Editing Everywhere**: Click any field to edit in place (title, description, assignee, due date, priority, custom fields)
2. **Auto-save on Blur/Enter**: Changes save automatically when user moves focus or presses Enter
3. **Optimistic UI Updates**: UI updates immediately; rollback on failure with inline error
4. **Visual Feedback**: Subtle animations, loading states, success indicators
5. **Error Recovery**: Inline error messages with retry option, maintaining UI state
6. **Single Panel Architecture**: One `TaskDetail.svelte` component serves create, edit, and view purposes based on context

This approach eliminates the cognitive overhead of "edit mode" vs "view mode" and reduces friction in daily task management.

---

## ADHD-Friendly Features

### Overview

This implementation prioritizes accessibility for neurodivergent users, particularly those with ADHD. Features address core executive function challenges:

| ADHD Challenge | Solution |
|----------------|----------|
| **Decision Paralysis** | "What should I do now?" algorithm suggests next task |
| **Task Initiation** | Focus Mode reduces overwhelm to single task |
| **Motivation** | Celebration animations, streaks, progress bars |
| **Time Blindness** | Stage-level deadlines break long projects into milestones |
| **Overwhelm** | AI-assisted task breakdown, gentle prompts |
| **Forgetfulness** | Visual cues, labels, progress indicators everywhere |

### Key Features

#### 1. Task Suggestion Algorithm (FR-107-109)
Analyzes tasks based on:
- Due dates (urgent first)
- Task priority
- Project priority
- Estimated effort
- Dependencies

Presents 1-3 specific tasks with clear reasoning (e.g., "Due tomorrow", "High priority", "Blocks 3 other tasks").

#### 2. Focus Mode (FR-110-111, FR-123-124)
Full-screen distraction-free view:
- Shows only current task
- Hides navigation, sidebar, other tasks
- Displays task title, description, subtasks
- Prominent "Mark Complete" button
- Accessible via 'F' keyboard shortcut
- Easy exit with ESC or button

#### 3. Celebration System (FR-112-116, FR-120)
Positive reinforcement:
- Confetti animation on task completion (canvas-confetti library ~3KB)
- Reduced motion support: respects prefers-reduced-motion CSS media query
- User preference to disable animations entirely
- Encouraging messages ("Great job! Task complete 🎉")
- Forgiving streak tracking ("🔥 5 day streak!")
  - Streak "pauses" for 1 grace day if user misses a day
  - Breaks only after 2 consecutive days without completing tasks
  - Tracks "best streak" for motivation to beat personal record
- Progress bars everywhere ("3/8 tasks complete today")
- Stage completion encouragement ("Planning done early! 🎯")
- No guilt-inducing language

#### 4. Stage-Level Deadlines (FR-117-120)
Break down overwhelm:
- Set milestone deadlines for each workflow stage
- Color-coded urgency (green: >3 days, yellow: 1-3 days, red: overdue)
- Prompt for tasks with far-away due dates
- Celebrate early completions

#### 5. Task Breakdown Assistance (FR-125-134)
Rule-based pattern matching (MVP) with AI upgrade path (post-MVP):
- Prompt "Want help breaking this down?" for complex tasks
- **Keyword Detection Algorithm**:
  - Extract keywords from task title
  - Normalize (lowercase, stemming)
  - Query `task_breakdown_patterns` table for fuzzy matches
  - Rank results by success rate (acceptance_rate = times_accepted / times_offered)
- Recognize task types (Costume, Prop, Photoshoot, Convention, Material)
- Suggest 3-7 logical subtasks based on stored successful patterns
- **Learning System**:
  - Increment `times_accepted` when user accepts breakdown
  - Increment `times_offered` (but not accepted) when user dismisses
  - Track user-specific dismissals to avoid repeat prompting
  - Mark patterns <20% acceptance rate as "low quality" after 10+ offers
- Match to saved templates
- Available on-demand via "Suggest Subtasks" button
- **Post-MVP**: Upgrade to AI/ML (OpenAI/Claude API) when more AI features are added

#### 6. Progress Visibility (FR-115-116)
Constant feedback:
- Header shows "X/Y tasks complete today" with progress bar
- Task cards show subtask completion percentage
- Visual bars and percentages everywhere
- Real-time updates

### Implementation Notes

**Gentle Prompts** (FR-121-122):
- **Daily prompts** (client-side): When user opens app, check if no tasks completed today → show gentle prompt "Here's a quick one to get started"
- **Inactivity reminders** (server-side): If user has no activity (no tasks completed, no app opens) for 3-7 days → send email reminder with motivational message
- Never punishing or guilt-inducing language
- Always encouraging and supportive
- User can disable in settings if desired

**Learning System** (FR-130-131):
- System learns user patterns for task breakdown via keyword matching
- Improves suggestions over time based on acceptance rates
- Respects user preferences (stops auto-prompting if repeatedly rejected, but keeps "Suggest Subtasks" button available)

**Accessibility** (FR-112a-112b):
- All animations respect prefers-reduced-motion CSS media query
- Users can disable celebrations in settings
- When disabled, still show encouraging messages without motion effects

---

## Custom Fields Feature

### Overview

Custom fields allow teams to extend task data with domain-specific information (budget, measurements, material specs, etc.) without cluttering the default UI for all users.

### Clarifications Resolved

1. **Required Field Enforcement** (FR-098a): Enforce only on task creation/save; existing tasks without values allowed
2. **Value Storage** (TaskCustomFieldValue): All values stored as TEXT with type-specific formatting
3. **Permissions** (FR-096a): Team owners/admins manage definitions; all members edit values
4. **Export/Import** (FR-113-117): Full export/import with conflict detection
5. **Currency Format** (FR-097a): Store currency code (ISO 4217) + numeric value; display with locale-appropriate symbol

### Data Model

**custom_field_definitions table**:
```sql
CREATE TABLE public.custom_field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'textarea', 'number', 'currency', 'dropdown', 'multi-select', 'checkbox', 'date', 'url', 'email')),
  required BOOLEAN NOT NULL DEFAULT FALSE,
  default_value TEXT,
  options JSONB DEFAULT '{}'::JSONB, -- For dropdown/multi-select choices, currency default code
  display_order INTEGER NOT NULL DEFAULT 0,
  show_on_card BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT custom_field_definitions_team_name_unique UNIQUE (team_id, field_name)
);
```

**task_custom_field_values table**:
```sql
CREATE TABLE public.task_custom_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  field_definition_id UUID NOT NULL REFERENCES public.custom_field_definitions(id) ON DELETE CASCADE,
  value TEXT, -- Formatted as: text/number string, JSON array for multi-select, ISO date string, {"amount": "100.00", "currency": "USD"} for currency
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT task_custom_field_values_task_field_unique UNIQUE (task_id, field_definition_id)
);
```

### Implementation Priority

Custom fields are **User Story 8 (P3 Priority)**, implemented after core task UI (US1-US7). This ensures the foundation is solid before adding extensibility.

---

## Performance Targets

| Metric | Target | Implementation |
|--------|--------|----------------|
| Task list render (500 tasks) | < 2 seconds | Tanstack Virtual (renders only visible rows) |
| View mode switch | < 500ms | State-driven; no re-fetch |
| Drag operation responsiveness | < 100ms | Native HTML5 DnD; optimistic update |
| Filter application | < 200ms | Client-side filtering for <200 tasks; backend for larger sets |
| Custom field render overhead | < 50ms additional | Lazy-loaded widgets; conditional rendering |

---

## New Entities Summary

**Core Task Features:**
1. **subtasks**: Child checklist items (1-to-many with tasks)
2. **task_comments**: Comments with @mentions (1-to-many with tasks)
3. **task_attachments**: File uploads via R2 (1-to-many with tasks)
4. **task_notifications**: In-app notification records (many-to-many: users ↔ tasks)
5. **task_templates**: Reusable task patterns (team-scoped)
6. **saved_task_views**: User-saved filter configurations (user + team scoped)

**Custom Fields:**
7. **custom_field_definitions**: Team custom field schema (team-scoped, max 20 per team)
8. **task_custom_field_values**: Task-specific custom field data (task-scoped)

**Labels & Organization:**
9. **task_labels**: Team labels for flexible categorization (max 50 per team)
10. **task_label_assignments**: Many-to-many between tasks and labels

**ADHD & Gamification:**
11. **task_stage_deadlines**: Milestone deadlines per workflow stage (breaks down long projects)
12. **user_task_stats**: Streak tracking, completion counts, gamification data
13. **task_breakdown_patterns**: Learned patterns for AI-assisted task suggestions (team-scoped)

**Total: 13 new tables** (8 core + 2 custom fields + 2 labels + 3 ADHD)

All entities enforce team isolation via RLS policies. See `data-model.md` for complete schema.

---

## Bundle Size Impact

| Addition | Estimated Size | Justification |
|----------|----------------|---------------|
| Tanstack Virtual | ~8KB | Essential for 100+ task lists |
| Drag-and-drop utils | ~2KB | Native API wrappers; minimal overhead |
| Rich text utils | ~3KB | Contenteditable helpers; no WYSIWYG library |
| Task components | ~15KB | 15+ new components; code-split by route |
| Services & stores | ~10KB | TypeScript business logic; tree-shakeable |
| **Total** | **~38KB** | ✅ Under 50KB constraint |

Additional lazy-loaded features (calendar view, timeline view) loaded on-demand, not in initial bundle.

---

## Implementation Path Forward

### Phase 0: Research (Completed)
✅ Documented in `research.md`:
- Drag-and-drop: Native HTML5 API
- Virtual scrolling: Tanstack Virtual
- Calendar/Timeline: FullCalendar (lazy-loaded)
- Rich text: Contenteditable with custom toolbar
- Natural language: Regex-based parser
- Email service: Resend via Supabase Edge Function
- File storage: Cloudflare R2 via Supabase Storage integration
- Realtime: Supabase Realtime for notifications
- State management: URL + LocalStorage + Svelte Stores

### Phase 1: Database & Contracts (Completed)
✅ `data-model.md`: 8 tables, indexes, RLS policies  
✅ `contracts/api-schema.yaml`: 30+ endpoints (OpenAPI 3.0)  
✅ `contracts/types.ts`: 40+ interfaces, type guards, Zod schemas  
✅ `quickstart.md`: Developer onboarding guide

### Phase 2: Task Breakdown (Completed)
✅ `tasks.md`: 153 tasks organized by user story and phase

### Phase 3: Implementation (In Progress)
- **Phase 1 (Migrations)**: T001-T007 ✅ Completed
- **Phase 2 (Foundation)**: T008-T023 ✅ Completed
- **Phase 3 (User Story 1)**: T024-T038 🔄 In Progress
- **Phase 4 (User Story 2)**: T039-T055 ⏳ Pending
- **Phase 5 (User Stories 3-7)**: T056-T133 ⏳ Pending
- **Phase 6 (User Story 8 - Custom Fields)**: T134-T153 ⏳ Pending

---

## Next Steps

1. **Continue Phase 3 Implementation**: Complete User Story 1 (Quick Task Overview - 4 view modes)
2. **Update Plan with Custom Fields** (this update): Incorporate clarifications from spec
3. **Update Data Model**: Add custom field tables to `data-model.md`
4. **Update Contracts**: Add custom field endpoints to `api-schema.yaml` and types to `types.ts`
5. **Update Tasks**: Break down custom fields implementation (User Story 8) into detailed tasks

---

## References

- **Specification**: [spec.md](./spec.md) - 8 user stories, 117 functional requirements
- **Research**: [research.md](./research.md) - Technical decisions and rationales
- **Data Model**: [data-model.md](./data-model.md) - Complete database schema
- **API Contracts**: [contracts/api-schema.yaml](./contracts/api-schema.yaml) - OpenAPI 3.0 spec
- **Type Definitions**: [contracts/types.ts](./contracts/types.ts) - TypeScript interfaces
- **Developer Guide**: [quickstart.md](./quickstart.md) - Onboarding and common tasks
- **Tasks**: [tasks.md](./tasks.md) - 153-task implementation breakdown
- **Constitution**: [/.specify/memory/constitution.md](../../.specify/memory/constitution.md) - Project principles
