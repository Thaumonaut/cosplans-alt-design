# Tasks: Modern Task Management UI

**Input**: Design documents from `/specs/003-modern-task-ui/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**Constitution Compliance**: Tasks implement features per `.specify/memory/constitution.md` principles (Project-Centric, MVP First, Modular organization by domain)

**Tests**: Manual testing acceptable for MVP phase per constitution. Automated E2E tests deferred to post-MVP.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, etc.)
- Include exact file paths in descriptions

## Path Conventions

- SvelteKit web app: `src/lib/`, `src/routes/`, `supabase/migrations/`
- Database: `supabase/migrations/[timestamp]_[name].sql`
- Components: `src/lib/components/[domain]/[Component].svelte`
- Services: `src/lib/services/[service].ts`
- Types: `src/lib/types/[domain].ts`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency configuration

- [X] T001 Review plan.md, spec.md, data-model.md for technical context
- [X] T002 Review research.md for technology decisions (drag-and-drop, virtual scrolling, rich text)
- [X] T003 [P] Install Tanstack Virtual for large task lists: `bun add @tanstack/svelte-virtual`
- [X] T004 [P] Install canvas-confetti for celebration animations: `bun add canvas-confetti @types/canvas-confetti`
- [X] T005 [P] Research and install text stemming library for keyword matching (e.g., natural, stemmer): `bun add natural`
- [X] T006 Create quickstart guide validation checklist from quickstart.md
- [X] T007 Update .cursor/rules/specify-rules.mdc with task system technologies
- [X] T008 [P] Set up Supabase Edge Function template for email notifications
- [X] T009 [P] Configure Resend API keys in environment for email delivery

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core database schema, types, and infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Migrations (13 tables)

- [X] T010 Create subtasks table migration: `supabase/migrations/20251103150000_create_subtasks.sql`
- [X] T011 Create task_comments table migration: `supabase/migrations/20251103150001_create_task_comments.sql`
- [X] T012 Create task_attachments table migration: `supabase/migrations/20251103150002_create_task_attachments.sql`
- [X] T013 Create task_notifications table migration: `supabase/migrations/20251103150003_create_task_notifications.sql`
- [X] T014 Create task_templates table migration: `supabase/migrations/20251103150004_create_task_templates.sql`
- [X] T015 Create saved_task_views table migration: `supabase/migrations/20251103150005_create_saved_task_views.sql`
- [X] T016 Create custom_field_definitions table migration: `supabase/migrations/20251103150006_create_custom_field_definitions.sql`
- [X] T017 Create task_custom_field_values table migration: `supabase/migrations/20251103150007_create_task_custom_field_values.sql`
- [X] T018 Create task_labels table migration: `supabase/migrations/20251103150008_create_task_labels.sql`
- [X] T019 Create task_label_assignments table migration: `supabase/migrations/20251103150009_create_task_label_assignments.sql`
- [X] T020 Create task_stage_deadlines table migration: `supabase/migrations/20251103150010_create_task_stage_deadlines.sql`
- [X] T021 Create user_task_stats table migration: `supabase/migrations/20251103150011_create_user_task_stats.sql`
- [X] T022 Create task_breakdown_patterns table migration: `supabase/migrations/20251103150012_create_task_breakdown_patterns.sql`
- [X] T023 Run all migrations and verify schema in Supabase dashboard

### TypeScript Type Definitions

- [X] T024 [P] Define core task types in src/lib/types/tasks.ts (Subtask, TaskComment, TaskAttachment, TaskNotification, TaskDetail)
- [X] T025 [P] Define template types in src/lib/types/templates.ts (TaskTemplate, SavedTaskView)
- [X] T026 [P] Define custom field types in src/lib/types/custom-fields.ts (CustomFieldDefinition, TaskCustomFieldValue, CustomFieldType, CurrencyValue)
- [X] T027 [P] Define label types in src/lib/types/labels.ts (TaskLabel, TaskLabelAssignment)
- [X] T028 [P] Define ADHD feature types in src/lib/types/adhd-features.ts (TaskStageDeadline, UserTaskStats, TaskBreakdownPattern)
- [X] T029 [P] Define Zod validation schemas in src/lib/schemas/tasks.ts for runtime validation
- [X] T030 Create type guards and utility functions in src/lib/types/type-guards.ts

### Service Layer Foundation

- [X] T031 Create Supabase client wrapper in src/lib/services/supabase.ts with typed client
- [X] T032 [P] Implement SubtaskService in src/lib/services/subtask-service.ts (CRUD operations, RLS)
- [X] T033 [P] Implement CommentService in src/lib/services/comment-service.ts (CRUD, @mentions parsing)
- [X] T034 [P] Implement AttachmentService in src/lib/services/attachment-service.ts (upload to R2, signed URLs)
- [X] T035 [P] Implement NotificationService in src/lib/services/notification-service.ts (create, mark read, subscribe)
- [X] T036 Implement TaskService core methods in src/lib/services/task-service.ts (extends existing, adds relations)

### Base Components

- [X] T037 [P] Create InlineSelect component in src/lib/components/base/InlineSelect.svelte (for living document editing)
- [X] T038 [P] Create InlineDatePicker component in src/lib/components/base/InlineDatePicker.svelte
- [X] T039 [P] Create ConfirmDialog component in src/lib/components/base/ConfirmDialog.svelte
- [X] T040 [P] Create ErrorToast component in src/lib/components/base/ErrorToast.svelte
- [X] T041 Create DragDropContext setup in src/lib/utils/drag-drop.ts (native HTML5 DnD utilities)

**Checkpoint**: ✅ Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Quick Task Overview and Management (Priority: P1) 🎯 MVP Core

**Goal**: Users can view all tasks across projects in list, kanban, and calendar views with basic filtering

**Independent Test**: Create 20 tasks across 3 projects with different stages. Switch between list, board, and calendar views. Apply filters by project and priority. Verify all tasks display correctly in each view.

### Implementation for User Story 1

- [X] T042 [P] [US1] Create TaskListView component in src/lib/components/tasks/TaskListView.svelte (renders tasks as list with virtual scrolling)
- [X] T043 [P] [US1] Create TaskCard component in src/lib/components/tasks/TaskCard.svelte (displays task summary in list/board)
- [X] T044 [P] [US1] Create TaskBoardView component in src/lib/components/tasks/TaskBoardView.svelte (kanban columns by stage)
- [X] T045 [P] [US1] Create TaskCalendarView component in src/lib/components/tasks/TaskCalendarView.svelte (calendar grid with tasks)
- [X] T046 [US1] Create ViewModeSelector component in src/lib/components/tasks/TaskViewModeSelector.svelte (toggle between views)
- [X] T047 [US1] Create TaskFilterPanel component in src/lib/components/tasks/TaskFilterPanel.svelte (filter UI)
- [X] T048 [US1] Implement view mode state management in src/lib/stores/task-view-store.ts (Svelte store for view state)
- [X] T049 [US1] Implement filter logic in src/lib/services/task-filter-service.ts (client-side filtering)
- [X] T050 [US1] Create main Tasks page route in src/routes/(app)/tasks/+page.svelte
- [X] T051 [US1] Load task data in src/routes/(app)/tasks/+page.ts (server-side data loading)
- [X] T052 [US1] Wire up view switching and filtering in main Tasks page
- [X] T053 [US1] Add responsive mobile layout for all views
- [X] T054 [US1] Implement virtual scrolling for list view (>100 tasks)

**Checkpoint**: ✅ **USER STORY 1 COMPLETE** - Users can view and filter tasks in multiple view modes!

---

## Phase 4: User Story 2 - Rich Task Details and Context (Priority: P1)

**Goal**: Users can open task detail panel to see/edit comprehensive task information including subtasks, comments, attachments, activity

**Independent Test**: Create a task, open detail panel, add description, create 2 subtasks, add comment with @mention, upload attachment, change status. Verify all data persists and displays correctly.

### Implementation for User Story 2

- [X] T055 [P] [US2] Create TaskDetailPanel component in src/lib/components/tasks/TaskDetailPanel.svelte (unified panel for view/edit)
- [X] T056 [P] [US2] Create SubtaskList component in src/lib/components/tasks/SubtaskList.svelte (manage subtasks with progress)
- [X] T057 [P] [US2] Create CommentThread component in src/lib/components/tasks/CommentThread.svelte (comment list with @mentions)
- [X] T058 [P] [US2] Create CommentInput component in src/lib/components/tasks/CommentInput.svelte (@mention autocomplete)
- [X] T059 [P] [US2] Create AttachmentList component in src/lib/components/tasks/AttachmentList.svelte (file uploads via drag-drop)
- [X] T060 [P] [US2] Create ActivityLog component in src/lib/components/tasks/ActivityLog.svelte (task history timeline)
- [X] T061 [US2] Implement @mention parsing in src/lib/utils/mention-parser.ts (extract user IDs from text)
- [X] T062 [US2] Implement @mention autocomplete in src/lib/utils/mention-autocomplete.ts (team member search)
- [X] T063 [US2] Implement file upload to Cloudflare R2 in src/lib/api/services/taskAttachmentService.ts
- [X] T064 [US2] Generate signed URLs for file downloads in taskAttachmentService
- [X] T065 [US2] Wire up task detail panel to open from task cards (modal or side panel)
- [X] T066 [US2] Implement living document editing for task fields (inline editing on blur/enter)
- [X] T067 [US2] Add optimistic UI updates for all task field changes
- [X] T068 [US2] Handle errors with inline error messages and retry buttons
- [X] T069 [US2] Calculate and display subtask completion percentage

**Checkpoint**: Users can manage rich task details with subtasks, comments, attachments ✅

---

## Phase 5: User Story 3 - Contextual Task Integration (Priority: P1)

**Goal**: Tasks appear embedded in Project, Photoshoot, and Resource detail pages with auto-linking

**Independent Test**: Navigate to a Project detail page, verify only that project's tasks appear in embedded task view. Create task from project context, verify it auto-links to project.

### Implementation for User Story 3

- [X] T070 [P] [US3] Create EmbeddedTaskList component in src/lib/components/tasks/EmbeddedTaskList.svelte (reusable filtered task view)
- [X] T071 [P] [US3] Create QuickTaskCreate component in src/lib/components/tasks/QuickTaskCreate.svelte (inline task creation)
- [X] T072 [US3] Add task section to Project detail page in src/routes/(app)/projects/[id]/+page.svelte
- [X] T073 [US3] Add task section to Photoshoot detail page in src/routes/(app)/photoshoots/[id]/+page.svelte
- [X] T074 [US3] Add task section to Resource detail page in src/routes/(app)/resources/[id]/+page.svelte
- [X] T075 [US3] Implement context-aware task creation (auto-link to parent entity)
- [X] T076 [US3] Add "View All Tasks" link from embedded views to main Tasks page with pre-applied filter
- [X] T077 [US3] Ensure embedded task views respect team RLS policies

**Checkpoint**: Tasks appear in context and auto-link to parent entities ✅

---

## Phase 6: User Story 9 - ADHD-Friendly Task Management (Priority: P1)

**Goal**: ADHD users get decision support, celebrations, streaks, stage deadlines, and gentle prompts (Focus Mode is post-MVP - currently disabled)

**Independent Test**: Create 10 tasks with various priorities/due dates. Click "What should I do now?" and verify algorithm suggests appropriate task. Complete task, verify celebration plays. Check streak updates.

### Implementation for User Story 9

#### Task Suggestion Algorithm

- [X] T078 [P] [US9] Implement TaskSuggestionService in src/lib/services/task-suggestion-service.ts (prioritization algorithm)
- [X] T079 [P] [US9] Create WhatToDoNow component in src/lib/components/tasks/WhatToDoNow.svelte (displays suggestions with reasoning)
- [X] T080 [US9] Add "What should I do now?" button to Tasks page header
- [X] T081 [US9] Implement algorithm scoring: due date urgency (40%), priority (30%), dependencies (20%), effort (10%)

#### Focus Mode (Post-MVP - Currently Disabled)

**Note**: Focus Mode is disabled as it currently adds no value - users can't edit values or see useful information, only leave comments. Will be redesigned for post-MVP.

- [X] T082 [P] [US9] Create FocusMode component in src/lib/components/tasks/FocusMode.svelte (full-screen single-task view) - **DISABLED: Post-MVP**
- [X] T083 [US9] Implement Focus Mode keyboard shortcut ('F' key) in src/lib/utils/keyboard-shortcuts.ts - **DISABLED: Post-MVP**
- [X] T084 [US9] Add "Start Working" button to task detail panel that activates Focus Mode - **DISABLED: Post-MVP**
- [X] T085 [US9] Store Focus Mode state in localStorage for persistence across navigation - **DISABLED: Post-MVP**
- [X] T086 [US9] Add ESC key and "Exit Focus" button to leave Focus Mode - **DISABLED: Post-MVP**

#### Celebration System

- [X] T087 [P] [US9] Create CelebrationAnimation component in src/lib/components/tasks/CelebrationAnimation.svelte (canvas-confetti integration)
- [X] T088 [US9] Implement celebration trigger on task completion in TaskService
- [X] T089 [US9] Add prefers-reduced-motion CSS media query detection
- [X] T090 [US9] Add user preference toggle for celebration animations in user settings
- [X] T091 [US9] Generate encouraging messages (randomized, positive, non-judgmental)

#### Streak Tracking

- [X] T092 [P] [US9] Implement UserTaskStatsService in src/lib/services/user-task-stats-service.ts (streak logic)
- [X] T093 [US9] Create StreakDisplay component in src/lib/components/tasks/StreakDisplay.svelte (flame icon, counter)
- [X] T094 [US9] Add StreakDisplay to Tasks page header
- [X] T095 [US9] Implement streak logic: increment on first task completion of day, grace period handling
- [X] T096 [US9] Create Supabase Edge Function for daily stats reset: `supabase/functions/daily-streak-check/index.ts`
- [X] T097 [US9] Schedule daily cron job for streak checking (midnight UTC, respects user timezone) - Note: Cron must be configured in Supabase Dashboard
- [X] T098 [US9] Display "best streak" stat when streak breaks with encouragement message

#### Progress Visibility

- [X] T099 [P] [US9] Create DailyProgressBar component in src/lib/components/tasks/DailyProgressBar.svelte ("3/8 tasks complete")
- [X] T100 [US9] Add DailyProgressBar to Tasks page header
- [X] T101 [US9] Add subtask completion percentage to TaskCard component (e.g., "60% complete")
- [X] T102 [US9] Update progress bars in real-time when tasks/subtasks complete

#### Stage-Level Deadlines

- [ ] T103 [P] [US9] Implement StageDeadlineService in src/lib/services/stage-deadline-service.ts (CRUD for deadlines)
- [ ] T104 [P] [US9] Create StageDeadlinePicker component in src/lib/components/tasks/StageDeadlinePicker.svelte (set deadlines per stage)
- [ ] T105 [US9] Add stage deadline prompt for tasks with due date > 7 days away
- [ ] T106 [US9] Display upcoming stage deadline on TaskCard with color-coding (green >3d, yellow 1-3d, red overdue)
- [ ] T107 [US9] Show encouragement message when stage completes early ("Planning done early! 🎯")
- [ ] T108 [US9] Auto-complete stage deadlines when task advances to next stage

#### Gentle Prompts

- [ ] T109 [P] [US9] Create DailyPrompt component in src/lib/components/tasks/DailyPrompt.svelte (client-side check on app open)
- [ ] T110 [US9] Implement client-side check: if no tasks completed today, show gentle prompt
- [ ] T111 [US9] Create Supabase Edge Function for inactivity email reminders: `supabase/functions/inactivity-reminder/index.ts`
- [ ] T112 [US9] Schedule cron job to check for 3-7 day inactivity and send email via Resend
- [ ] T113 [US9] Allow users to dismiss daily prompt and disable in settings if desired

**Checkpoint**: ADHD users have full suite of support tools ✅

---

## Phase 7: User Story 4 - Intuitive Task Manipulation (Priority: P2)

**Goal**: Users can drag-and-drop tasks between stages, bulk-update multiple tasks, and quick-edit inline

**Independent Test**: Drag 3 tasks from "Todo" to "In Progress" in board view, verify updates. Select 5 tasks via checkboxes, bulk-set priority to High, verify updates.

### Implementation for User Story 4

- [ ] T114 [P] [US4] Implement native HTML5 drag-and-drop in TaskBoardView component
- [ ] T115 [P] [US4] Create TaskBulkActions component in src/lib/components/tasks/TaskBulkActions.svelte (bulk operations UI)
- [ ] T116 [US4] Add checkbox selection to TaskCard component
- [ ] T117 [US4] Implement bulk stage change in TaskService
- [ ] T118 [US4] Implement bulk priority change in TaskService
- [ ] T119 [US4] Implement bulk assignee change in TaskService
- [ ] T120 [US4] Add optimistic UI updates for drag-and-drop with rollback on failure
- [ ] T121 [US4] Add drag animations and visual feedback (ghost card, drop zone highlighting)
- [ ] T122 [US4] Enable inline quick-edit for status badge (click → dropdown)
- [ ] T123 [US4] Enable inline quick-edit for due date (click → date picker)
- [ ] T124 [US4] Enable inline quick-edit for priority (click → selector)

**Checkpoint**: Users can efficiently manipulate tasks with drag-and-drop and bulk actions ✅

---

## Phase 8: User Story 5 - Standalone Task Management (Priority: P2)

**Goal**: Users can create tasks not linked to projects (shopping lists, general planning, team management)

**Independent Test**: Create task with no project association. Tag as "Shopping". Verify appears in main task views and can be filtered separately from project tasks.

### Implementation for User Story 5

- [ ] T125 [US5] Add "Standalone Tasks" filter option to TaskFilterPanel
- [ ] T126 [US5] Update QuickTaskCreate to allow null project (standalone mode)
- [ ] T127 [US5] Add "Standalone" badge to TaskCard for tasks without project
- [ ] T128 [US5] Implement grouping by "Standalone" vs "Project" in task views
- [ ] T129 [US5] Allow converting standalone task to project-linked (and vice versa) in TaskDetailPanel
- [ ] T130 [US5] Ensure RLS policies support team-level standalone tasks

**Checkpoint**: Users can manage standalone tasks independently from projects ✅

---

## Phase 9: User Story 6 - Advanced Filtering and Grouping (Priority: P2)

**Goal**: Power users can filter tasks by multiple criteria and group by different dimensions, plus save views

**Independent Test**: Apply filters (Priority: High AND Project: X AND Assigned to: Me), verify only matching tasks. Change grouping from Stage to Priority, verify reorganization. Save view, reload, verify filters persist.

### Implementation for User Story 6

- [ ] T131 [P] [US6] Implement SavedTaskViewService in src/lib/services/saved-view-service.ts (CRUD for saved views)
- [ ] T132 [P] [US6] Create SavedViewSelector component in src/lib/components/tasks/SavedViewSelector.svelte (dropdown of saved views)
- [ ] T133 [P] [US6] Create GroupBySelector component in src/lib/components/tasks/GroupBySelector.svelte (group by stage/priority/project/assignee)
- [ ] T134 [US6] Extend TaskFilterPanel with multi-criteria filters (AND logic)
- [ ] T135 [US6] Add date range filter (due date, created date)
- [ ] T136 [US6] Add "Save as View" button to filter panel
- [ ] T137 [US6] Implement client-side grouping logic in task-filter-service.ts
- [ ] T138 [US6] Add "Clear All Filters" button
- [ ] T139 [US6] Persist active view selection in URL query params
- [ ] T140 [US6] Load saved view on page load if specified in URL

**Checkpoint**: Power users have advanced filtering, grouping, and saved views ✅

---

## Phase 10: User Story 8 - Task Organization with Labels (Priority: P2)

**Goal**: Users can create color-coded labels, apply multiple labels to tasks, and filter by labels

**Independent Test**: Create labels "Urgent", "Fabric Work", "Needs Review" with different colors. Apply multiple labels to tasks. Filter by label. Verify labels appear as colored badges on task cards.

### Implementation for User Story 8

- [ ] T141 [P] [US8] Implement TaskLabelService in src/lib/services/task-label-service.ts (CRUD for labels)
- [ ] T142 [P] [US8] Implement LabelAssignmentService in src/lib/services/label-assignment-service.ts (assign/remove labels from tasks)
- [ ] T143 [P] [US8] Create LabelManager component in src/lib/components/tasks/LabelManager.svelte (manage team labels)
- [ ] T144 [P] [US8] Create LabelPicker component in src/lib/components/tasks/LabelPicker.svelte (tag-style multi-select)
- [ ] T145 [P] [US8] Create LabelBadge component in src/lib/components/tasks/LabelBadge.svelte (colored badge display)
- [ ] T146 [US8] Add label badges to TaskCard component (show first 3, "+2 more" for additional)
- [ ] T147 [US8] Add label picker to TaskDetailPanel
- [ ] T148 [US8] Add label filter to TaskFilterPanel (multi-select, OR logic)
- [ ] T149 [US8] Add "Manage Labels" button to Tasks page settings
- [ ] T150 [US8] Implement label color picker with predefined palette (8 colors)
- [ ] T151 [US8] Add confirmation warning when deleting label ("Remove from all tasks?")
- [ ] T152 [US8] Enforce maximum 50 labels per team (application-side validation)

**Checkpoint**: Users can organize tasks with flexible color-coded labels ✅

---

## Phase 11: User Story 10 - Task Breakdown Assistance (Priority: P2)

**Goal**: Users get AI-assisted subtask suggestions when creating complex tasks, system learns patterns over time

**Independent Test**: Create task "Build Iron Man Armor". Accept breakdown suggestion. Verify subtasks like "Research reference images", "Cut foam pieces", "Paint and weather" created automatically. Create similar task later, verify improved suggestions.

### Implementation for User Story 10

- [ ] T153 [P] [US10] Implement TaskBreakdownService in src/lib/services/task-breakdown-service.ts (pattern matching, learning)
- [ ] T154 [P] [US10] Create BreakdownSuggestionPrompt component in src/lib/components/tasks/BreakdownSuggestionPrompt.svelte (offers breakdown)
- [ ] T155 [P] [US10] Create BreakdownSuggestionReview component in src/lib/components/tasks/BreakdownSuggestionReview.svelte (edit subtasks before accepting)
- [ ] T156 [US10] Implement keyword extraction and normalization in src/lib/utils/keyword-extractor.ts (lowercase, stemming)
- [ ] T157 [US10] Implement fuzzy keyword matching against task_breakdown_patterns table
- [ ] T158 [US10] Rank breakdown patterns by acceptance_rate
- [ ] T159 [US10] Generate subtask suggestions based on matched patterns (3-7 subtasks)
- [ ] T160 [US10] Track pattern usage: increment times_offered when shown, times_accepted when accepted
- [ ] T161 [US10] Track user-specific dismissals to avoid repeat prompting
- [ ] T162 [US10] Mark patterns with <20% acceptance after 10+ offers as low-quality (filter from results)
- [ ] T163 [US10] Show breakdown prompt for new tasks with no subtasks
- [ ] T164 [US10] Show breakdown prompt for existing tasks with no subtasks and due date > 7 days away (gentle, magic wand icon)
- [ ] T165 [US10] Offer "Save as pattern?" after user manually creates subtasks
- [ ] T166 [US10] Seed initial patterns for common task types (Costume, Prop, Photoshoot, Convention, Material)

**Checkpoint**: Users get intelligent task breakdown assistance that improves over time ✅

---

## Phase 12: User Story 7 - Quick Task Creation and Templates (Priority: P3)

**Goal**: Users can quick-create tasks via keyboard shortcut and apply reusable templates

**Independent Test**: Press 'N' key, quick-create form appears, type task title, press Enter, task creates with defaults. Apply "Photoshoot Prep" template, verify 10 standard subtasks created.

### Implementation for User Story 7

- [ ] T167 [P] [US7] Implement TaskTemplateService in src/lib/services/task-template-service.ts (CRUD for templates)
- [ ] T168 [P] [US7] Create QuickCreateOverlay component in src/lib/components/tasks/QuickCreateOverlay.svelte (modal quick-create)
- [ ] T169 [P] [US7] Create TemplateSelector component in src/lib/components/tasks/TemplateSelector.svelte (browse and apply templates)
- [ ] T170 [US7] Register 'N' keyboard shortcut to open QuickCreateOverlay
- [ ] T171 [US7] Implement natural language parsing for project detection (e.g., "photoshoot prep for Cosplay X")
- [ ] T172 [US7] Auto-link to project when mentioned in quick-create
- [ ] T173 [US7] Add "Save as Template" option to TaskDetailPanel
- [ ] T174 [US7] Add "Add from Template" button to task creation
- [ ] T175 [US7] Implement template application: create task with template's default fields and subtasks
- [ ] T176 [US7] Add "Duplicate Task" button to TaskDetailPanel (copy all except dates and completion)
- [ ] T177 [US7] Seed default templates (Convention Packing, Photoshoot Prep, Costume Checklist)

**Checkpoint**: Users have quick task creation and reusable templates ✅

---

## Phase 13: User Story 11 - Custom Task Fields (Priority: P3)

**Goal**: Team owners/admins can define custom fields (10 types), all members can view/edit values on tasks

**Independent Test**: Navigate to team settings, create custom field "Budget" (currency) and "Material" (text). Create task, verify custom fields appear in detail panel. Enter values, save, verify persist. Add another task, verify fields appear. Delete field definition, verify removed from all tasks.

### Implementation for User Story 11

- [ ] T178 [P] [US11] Implement CustomFieldService in src/lib/services/custom-field-service.ts (CRUD for definitions and values)
- [ ] T179 [P] [US11] Create CustomFieldManager component in src/lib/components/tasks/CustomFieldManager.svelte (manage field definitions)
- [ ] T180 [P] [US11] Create CustomFieldInput component in src/lib/components/tasks/CustomFieldInput.svelte (renders appropriate input widget)
- [ ] T181 [P] [US11] Create CustomFieldDisplay component in src/lib/components/tasks/CustomFieldDisplay.svelte (read-only display on cards)
- [ ] T182 [US11] Add custom fields section to team settings page
- [ ] T183 [US11] Implement field type-specific input widgets (text, textarea, number, currency, dropdown, multi-select, checkbox, date, URL, email)
- [ ] T184 [US11] Implement currency field with currency code selector (ISO 4217) and locale-appropriate symbol display
- [ ] T185 [US11] Add custom fields section to TaskDetailPanel (below standard fields)
- [ ] T186 [US11] Implement required field validation (enforce on save, allow existing tasks without values)
- [ ] T187 [US11] Store all custom field values as TEXT with type-specific parsing/validation
- [ ] T188 [US11] Add custom field filter options to TaskFilterPanel
- [ ] T189 [US11] Allow configuring which custom fields show on task cards in team settings
- [ ] T190 [US11] Implement custom field export/import for team portability
- [ ] T191 [US11] Add confirmation warning when deleting field definition ("Remove field and all values from all tasks?")
- [ ] T192 [US11] Enforce maximum 20 custom fields per team (application-side validation)

**Checkpoint**: Teams have flexible custom fields for domain-specific tracking ✅

---

## Phase 14: Real-time & Notifications

**Purpose**: Real-time task updates and notification delivery for all task events

### Real-time Subscriptions

- [ ] T193 [P] Create Supabase realtime subscription setup in src/lib/services/realtime-service.ts
- [ ] T194 [P] Subscribe to task changes for active view (inserts, updates, deletes)
- [ ] T195 [P] Subscribe to comment additions for open task detail panels
- [ ] T196 [P] Subscribe to subtask updates for tasks with open detail panels
- [ ] T197 Subscribe to notification events for current user
- [ ] T198 Update UI optimistically and reconcile with realtime events

### Email Notifications

- [ ] T199 [P] Create Supabase Edge Function for task notifications: `supabase/functions/send-task-notification/index.ts`
- [ ] T200 [P] Integrate Resend API for email delivery in Edge Function
- [ ] T201 [P] Create email templates for task events (assigned, commented, @mentioned, status changed)
- [ ] T202 Trigger notification creation on task assignment
- [ ] T203 Trigger notification creation on @mention in comment
- [ ] T204 Trigger notification creation on task status change
- [ ] T205 Trigger notification creation on comment addition
- [ ] T206 Send both in-app and email notifications for all task events
- [ ] T207 Respect user notification preferences (if preferences system exists)

### In-App Notifications

- [ ] T208 [P] Create NotificationCenter component in src/lib/components/tasks/NotificationCenter.svelte (bell icon, dropdown)
- [ ] T209 [P] Create NotificationItem component in src/lib/components/tasks/NotificationItem.svelte (single notification display)
- [ ] T210 Add NotificationCenter to app header (bell icon with unread count badge)
- [ ] T211 Implement mark as read functionality
- [ ] T212 Implement "Mark all as read" bulk action
- [ ] T213 Link notifications to related tasks (clicking opens task detail panel)

**Checkpoint**: Users receive real-time updates and notifications for all task activities ✅

---

## Phase 15: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, performance optimization, documentation

### Performance Optimization

- [ ] T214 [P] Implement task list pagination for teams with >500 tasks
- [ ] T215 [P] Add database indexes if missing (verify with EXPLAIN ANALYZE)
- [ ] T216 [P] Optimize task queries to reduce N+1 queries (use joins, batch fetching)
- [ ] T217 Implement task caching strategy in service layer (SWR pattern)
- [ ] T218 Lazy-load task detail panel components (code splitting)
- [ ] T219 Optimize virtual scrolling performance for list view
- [ ] T220 Measure and optimize bundle size (<50KB increase target)

### Error Handling & Edge Cases

- [ ] T221 [P] Implement error boundary components for task views
- [ ] T222 [P] Add retry logic for failed API calls (exponential backoff)
- [ ] T223 Add offline detection and queue mutations for sync
- [ ] T224 Handle concurrent edits gracefully (last-write-wins with conflict warning)
- [ ] T225 Validate file uploads (25MB max, allowed MIME types)
- [ ] T226 Handle orphaned tasks when project deleted (keep as standalone)
- [ ] T227 Handle archived project task visibility (hide by default, "Include Archived" toggle)

### Accessibility & UX

- [ ] T228 [P] Add ARIA labels to all interactive elements
- [ ] T229 [P] Ensure keyboard navigation works for all task operations
- [ ] T230 [P] Test with screen readers (NVDA, JAWS)
- [ ] T231 Add focus indicators for keyboard navigation
- [ ] T232 Ensure color contrast meets WCAG AA standards
- [ ] T233 Test responsive design on mobile devices (iOS, Android)
- [ ] T234 Add loading states for all async operations
- [ ] T235 Add empty states with helpful messages ("No tasks yet. Create one to get started!")

### Documentation

- [ ] T236 [P] Update quickstart.md with new task features
- [ ] T237 [P] Document keyboard shortcuts in app help section
- [ ] T238 [P] Create user guide for ADHD features (What to do now, Focus Mode, Streaks)
- [ ] T239 Update API documentation in contracts/api-schema.yaml for new endpoints
- [ ] T240 Add inline help tooltips for complex features (custom fields, stage deadlines, task breakdown)

### Testing & Validation

- [ ] T241 [P] Run through all user story acceptance scenarios manually
- [ ] T242 [P] Test with large dataset (1000+ tasks) for performance validation
- [ ] T243 Test cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] T244 Validate RLS policies prevent unauthorized access
- [ ] T245 Test notification delivery (email and in-app)
- [ ] T246 Validate file upload/download with various file types
- [ ] T247 Test real-time updates with multiple concurrent users

### Final Checklist

- [ ] T248 Run quickstart.md validation checklist
- [ ] T249 Verify all migrations applied successfully
- [ ] T250 Verify no TypeScript errors
- [ ] T251 Verify no console errors or warnings
- [ ] T252 Verify bundle size increase <50KB
- [ ] T253 Review and clean up debug logging
- [ ] T254 Review code for TODO/FIXME comments
- [ ] T255 Update constitution check in plan.md if needed

**Checkpoint**: Feature is polished, performant, and ready for production ✅

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (Foundational)**: Depends on Setup (Phase 1) completion - **BLOCKS all user stories**
- **Phase 3-13 (User Stories)**: All depend on Foundational (Phase 2) completion
  - User stories can proceed in parallel if team capacity allows
  - Or sequentially in priority order: P1 → P2 → P3
- **Phase 14 (Real-time & Notifications)**: Can start after Phase 2, parallel with user stories
- **Phase 15 (Polish)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (Quick Overview - P1)**: Foundation only - **MVP Core**
- **US2 (Rich Details - P1)**: Foundation only - **MVP Core**
- **US3 (Contextual Integration - P1)**: Foundation + US1 (uses task views) - **MVP Core**
- **US9 (ADHD Features - P1)**: Foundation + US1, US2 (uses task views and detail panels) - **MVP Core**
- **US4 (Manipulation - P2)**: Foundation + US1 (uses task views)
- **US5 (Standalone - P2)**: Foundation + US1 (extends task views)
- **US6 (Filtering - P2)**: Foundation + US1 (extends task views)
- **US8 (Labels - P2)**: Foundation only
- **US10 (Breakdown - P2)**: Foundation + US2 (uses subtasks)
- **US7 (Quick Create - P3)**: Foundation + US1, US2 (uses task creation and templates)
- **US11 (Custom Fields - P3)**: Foundation only

### Recommended MVP Scope

**Minimum Viable Product** (User Stories to implement first):
1. ✅ **Phase 1**: Setup (T001-T009)
2. ✅ **Phase 2**: Foundational (T010-T041)
3. ✅ **Phase 3**: US1 - Quick Task Overview (T042-T054)
4. ✅ **Phase 4**: US2 - Rich Task Details (T055-T069)
5. ✅ **Phase 5**: US3 - Contextual Integration (T070-T077)
6. ✅ **Phase 6**: US9 - ADHD-Friendly Features (T078-T113)

This provides a complete, differentiated task management system with ADHD support that can be deployed and validated before adding advanced features.

**Post-MVP Priorities**:
- Phase 7-9: US4, US5, US6 (P2 features for power users)
- Phase 10: US8 (Labels for visual organization)
- Phase 11: US10 (Task Breakdown for complex planning)
- Phase 12-13: US7, US11 (P3 features for customization)

### Parallel Opportunities

Within each phase, all tasks marked **[P]** can be executed in parallel:

**Example - Phase 2 Foundational (Migrations):**
```bash
# All 13 migrations can be created in parallel:
T010-T022: All migration files (different files, no dependencies)
```

**Example - Phase 2 Foundational (Types):**
```bash
# All type definition files can be created in parallel:
T024: src/lib/types/tasks.ts
T025: src/lib/types/templates.ts
T026: src/lib/types/custom-fields.ts
T027: src/lib/types/labels.ts
T028: src/lib/types/adhd-features.ts
T029: src/lib/schemas/tasks.ts
```

**Example - Phase 3 US1 (Components):**
```bash
# All view components can be created in parallel:
T042: TaskListView.svelte
T043: TaskCard.svelte
T044: TaskBoardView.svelte
T045: TaskCalendarView.svelte
```

**Example - Phase 6 US9 (ADHD Features):**
```bash
# Different ADHD feature components can be developed in parallel:
T078-T081: Task Suggestion Algorithm
T082-T086: Focus Mode
T087-T091: Celebration System
T092-T098: Streak Tracking
T099-T102: Progress Visibility
```

---

## Implementation Strategy

### MVP First (4 Core User Stories)

1. Complete **Phase 1**: Setup (T001-T009)
2. Complete **Phase 2**: Foundational (T010-T041) - **CRITICAL: Blocks all stories**
3. Complete **Phase 3**: US1 - Quick Task Overview (T042-T054)
4. Complete **Phase 4**: US2 - Rich Task Details (T055-T069)
5. Complete **Phase 5**: US3 - Contextual Integration (T070-T077)
6. Complete **Phase 6**: US9 - ADHD-Friendly Features (T078-T113)
7. **STOP and VALIDATE**: Test all MVP user stories independently
8. Deploy and gather user feedback

**MVP delivers:**
- Modern task views (list, board, calendar)
- Rich task details with subtasks, comments, attachments
- Contextual task integration in projects/photoshoots/resources
- Complete ADHD support suite (suggestions, focus mode, celebrations, streaks, stage deadlines, gentle prompts)

### Incremental Delivery (Add P2 Features)

After MVP validation:

9. Add **Phase 7**: US4 - Intuitive Task Manipulation (T114-T124)
10. Add **Phase 8**: US5 - Standalone Task Management (T125-T130)
11. Add **Phase 9**: US6 - Advanced Filtering and Grouping (T131-T140)
12. Add **Phase 10**: US8 - Task Organization with Labels (T141-T152)
13. Add **Phase 11**: US10 - Task Breakdown Assistance (T153-T166)

Each addition is independently testable and adds value without breaking existing features.

### Optional Enhancements (P3 Features)

After P2 features are stable:

14. Add **Phase 12**: US7 - Quick Task Creation and Templates (T167-T177)
15. Add **Phase 13**: US11 - Custom Task Fields (T178-T192)

### Throughout Development

- **Phase 14** (Real-time & Notifications) can progress in parallel after Phase 2
- **Phase 15** (Polish) is ongoing - add tasks as user stories complete

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **Independent testing**: Each user story should be independently completable and testable
- **Commit often**: Commit after each task or logical group
- **Checkpoints**: Stop at any checkpoint to validate story independently
- **Constitution**: Follow MVP First, Project-Centric, Team-Based principles
- **Living Document Design**: All task field editing should feel like inline document editing (save on blur/enter)
- **Optimistic UI**: All task operations should update UI immediately with background API calls
- **Error Recovery**: All operations should have inline error messages with retry buttons

---

## Summary

**Total Tasks**: 255
- Phase 1 (Setup): 9 tasks (T001-T009) ✅ Complete
- Phase 2 (Foundational): 32 tasks (T010-T041) ✅ Complete
- Phase 3 (US1 - Quick Overview): 13 tasks (T042-T054)
- Phase 4 (US2 - Rich Details): 15 tasks (T055-T069)
- Phase 5 (US3 - Contextual): 8 tasks (T070-T077)
- Phase 6 (US9 - ADHD Features): 36 tasks (T078-T113)
- Phase 7 (US4 - Manipulation): 11 tasks (T114-T124)
- Phase 8 (US5 - Standalone): 6 tasks (T125-T130)
- Phase 9 (US6 - Filtering): 10 tasks (T114-T140)
- Phase 10 (US8 - Labels): 12 tasks (T141-T152)
- Phase 11 (US10 - Breakdown): 14 tasks (T153-T166)
- Phase 12 (US7 - Quick Create): 11 tasks (T167-T177)
- Phase 13 (US11 - Custom Fields): 15 tasks (T178-T192)
- Phase 14 (Real-time): 21 tasks (T193-T213)
- Phase 15 (Polish): 42 tasks (T214-T255)

**MVP Scope**: Phases 1-6 (113 tasks for core functionality)
**Full Feature Set**: All 255 tasks

**Parallel Opportunities**: ~120 tasks marked [P] can be parallelized

**Independent Tests**: Each user story has clear acceptance criteria for validation

---

**Tasks Complete**: ✅ Ready for implementation
