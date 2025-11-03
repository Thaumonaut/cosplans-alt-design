---
description: "Task list for Modern Task Management UI implementation"
---

# Tasks: Modern Task Management UI

**Input**: Design documents from `/specs/003-modern-task-ui/`  
**Prerequisites**: spec.md, plan.md, research.md, data-model.md, contracts/api-schema.yaml, contracts/types.ts

**Constitution Compliance**: Tasks implement features per `.specify/memory/constitution.md` principles (Project-Centric, MVP First, Modular organization by domain)

**Tests**: Tests are OPTIONAL per constitution MVP-first principle. Manual testing acceptable for initial release. E2E tests included for P1 stories only.

**Organization**: Tasks grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

All paths relative to repository root: `/home/jek/Downloads/cosplay-tracker/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database schema and foundation for all task features

- [ ] T001 Create database migration for subtasks table in `supabase/migrations/20251103000001_create_subtasks.sql`
- [ ] T002 [P] Create database migration for task_comments table in `supabase/migrations/20251103000002_create_task_comments.sql`
- [ ] T003 [P] Create database migration for task_attachments table in `supabase/migrations/20251103000003_create_task_attachments.sql`
- [ ] T004 [P] Create database migration for task_notifications table in `supabase/migrations/20251103000004_create_task_notifications.sql`
- [ ] T005 [P] Create database migration for task_templates table in `supabase/migrations/20251103000005_create_task_templates.sql`
- [ ] T006 [P] Create database migration for saved_task_views table in `supabase/migrations/20251103000006_create_saved_task_views.sql`
- [ ] T007 Run all migrations to create new tables and verify schema in local Supabase instance
- [ ] T008 [P] Add type definitions for new entities in `src/lib/types/domain/task.ts` (Subtask, TaskComment, TaskAttachment, TaskNotification, TaskTemplate, SavedTaskView)
- [ ] T009 [P] Create taskFilters store in `src/lib/stores/taskFilters.ts` for filter state management
- [ ] T010 [P] Create taskViews store in `src/lib/stores/taskViews.ts` for saved views persistence
- [ ] T011 [P] Create notifications store in `src/lib/stores/notifications.ts` for in-app notification state

**Checkpoint**: Database schema complete, type definitions ready, core stores initialized

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core services and utilities that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T012 [P] Create SubtaskService with CRUD operations in `src/lib/api/services/subtaskService.ts`
- [ ] T013 [P] Create TaskCommentService with CRUD operations in `src/lib/api/services/taskCommentService.ts`
- [ ] T014 [P] Create TaskAttachmentService with upload/download operations in `src/lib/api/services/taskAttachmentService.ts`
- [ ] T015 [P] Create TaskNotificationService with fetch/mark-read operations in `src/lib/api/services/taskNotificationService.ts`
- [ ] T016 [P] Create TaskTemplateService with CRUD operations in `src/lib/api/services/taskTemplateService.ts`
- [ ] T017 Enhance TaskService with new filter parameters and bulk operations in `src/lib/api/services/taskService.ts`
- [ ] T018 [P] Create drag-and-drop utility functions in `src/lib/utils/drag-and-drop.ts` using native HTML5 DND API
- [ ] T019 [P] Create task filter logic utilities in `src/lib/utils/task-filters.ts` for client-side filtering
- [ ] T020 [P] Create natural language parsing utility in `src/lib/utils/natural-language.ts` for quick task creation
- [ ] T021 [P] Create base InlineUserSelector component in `src/lib/components/base/InlineUserSelector.svelte` for assignee selection
- [ ] T022 [P] Create base InlineTagInput component in `src/lib/components/base/InlineTagInput.svelte` for tag input
- [ ] T023 [P] Create base InlineFileUpload component in `src/lib/components/base/InlineFileUpload.svelte` for file attachments

**Checkpoint**: Foundation ready - all services operational, utilities available, base components complete - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Quick Task Overview and Management (Priority: P1) 🎯 MVP

**Goal**: Implement 4 view modes (List, Board, Calendar, Timeline) with instant switching and filtering to give users comprehensive task visibility

**Independent Test**: Create 20 tasks across 3 projects with different stages, priorities, and due dates. Switch between all 4 view modes and verify tasks display correctly with proper filtering (by project, priority, stage). All tasks should be visible in list view, organized by columns in board view, displayed on calendar dates, and shown on timeline axis.

### Implementation for User Story 1

- [ ] T024 [P] [US1] Create TaskListView component with virtual scrolling in `src/lib/components/tasks/views/TaskListView.svelte`
- [ ] T025 [P] [US1] Create TaskBoardView component with stage columns in `src/lib/components/tasks/views/TaskBoardView.svelte`
- [ ] T026 [P] [US1] Create TaskCalendarView component with FullCalendar integration in `src/lib/components/tasks/views/TaskCalendarView.svelte`
- [ ] T027 [P] [US1] Create TaskTimelineView component with horizontal timeline in `src/lib/components/tasks/views/TaskTimelineView.svelte`
- [ ] T028 [US1] Create TaskFilterPanel component with all filter options in `src/lib/components/tasks/filters/TaskFilterPanel.svelte`
- [ ] T029 [P] [US1] Create TaskSearchInput component with debounced search in `src/lib/components/tasks/filters/TaskSearchInput.svelte`
- [ ] T030 [P] [US1] Create SavedViewsDropdown component for saved filter combinations in `src/lib/components/tasks/filters/SavedViewsDropdown.svelte`
- [ ] T031 [US1] Enhance TaskCard component to show subtask progress bar in `src/lib/components/tasks/TaskCard.svelte`
- [ ] T032 [US1] Implement view mode switching logic and state persistence in tasks store in `src/lib/stores/tasks.ts`
- [ ] T033 [US1] Replace main tasks page with new view mode UI in `src/routes/(auth)/tasks/+page.svelte`
- [ ] T034 [US1] Add keyboard shortcuts for view switching (1-4 keys for each view) in tasks page
- [ ] T035 [US1] Implement filter state management with active filter badges in `src/lib/stores/taskFilters.ts`
- [ ] T036 [US1] Add "Include Archived" filter toggle with archived project badge display in TaskFilterPanel
- [ ] T037 [US1] Create E2E test for view switching in `src/tests/e2e/tasks-views.spec.ts`
- [ ] T038 [US1] Create E2E test for filtering operations in `src/tests/e2e/tasks-filters.spec.ts`

**Checkpoint**: Users can view tasks in 4 different modes with instant switching, filter by multiple criteria, and see archived project tasks with toggle. All view modes display data correctly and filtering works across all views.

---

## Phase 4: User Story 2 - Rich Task Details and Context (Priority: P1) 🎯 MVP

**Goal**: Implement comprehensive task detail panel with subtasks, comments, attachments, and activity history using living document editing pattern

**Independent Test**: Create a task, open detail panel, add description (rich text), create 3 subtasks, mark 2 complete (verify 67% progress), add 2 comments with @mention, upload 2 image attachments with preview, change status and verify activity log shows all changes with timestamps and user names.

### Implementation for User Story 2

- [ ] T039 [P] [US2] Create unified TaskDetailPanel component with slide-in animation in `src/lib/components/tasks/detail/TaskDetailPanel.svelte`
- [ ] T040 [P] [US2] Create TaskSubtasksList component with inline editing in `src/lib/components/tasks/detail/TaskSubtasksList.svelte`
- [ ] T041 [P] [US2] Create TaskCommentsTab component with rich text editor in `src/lib/components/tasks/detail/TaskCommentsTab.svelte`
- [ ] T042 [P] [US2] Create TaskActivityTab component with change history in `src/lib/components/tasks/detail/TaskActivityTab.svelte`
- [ ] T043 [P] [US2] Create TaskAttachments component with drag-drop upload in `src/lib/components/tasks/detail/TaskAttachments.svelte`
- [ ] T044 [P] [US2] Create TaskMentions component with user autocomplete in `src/lib/components/tasks/detail/TaskMentions.svelte`
- [ ] T045 [US2] Implement task detail panel opening/closing with URL state management in tasks page
- [ ] T046 [US2] Add subtask completion percentage calculation and progress bar display in TaskSubtasksList
- [ ] T047 [US2] Implement @mention parsing and notification creation in TaskCommentsTab
- [ ] T048 [US2] Add file upload to Cloudflare R2 with signed URL generation in TaskAttachments
- [ ] T049 [US2] Add image preview inline for image attachments in TaskAttachments
- [ ] T050 [US2] Implement activity log generation from task change events in TaskActivityTab
- [ ] T051 [US2] Add living document editing with InlineTextEditor for all task properties in TaskDetailPanel
- [ ] T052 [US2] Implement tab switching (Details/Comments/Activity) with state persistence in TaskDetailPanel
- [ ] T053 [US2] Add create/edit/view mode support in single TaskDetailPanel component
- [ ] T054 [US2] Create E2E test for task detail CRUD operations in `src/tests/e2e/tasks-detail.spec.ts`
- [ ] T055 [US2] Create E2E test for subtasks and comments in `src/tests/e2e/tasks-collaboration.spec.ts`

**Checkpoint**: Task detail panel fully functional with create/edit/view modes, subtasks with progress tracking, comments with @mentions, file attachments with preview, and complete activity history. Living document editing feels natural and responsive.

---

## Phase 5: User Story 3 - Contextual Task Integration (Priority: P1) 🎯 MVP

**Goal**: Embed task views in project, photoshoot, and resource pages with auto-linking and contextual filtering

**Independent Test**: Navigate to a Project detail page, verify only that project's tasks appear in embedded view. Click "Add Task" in project context, verify new task auto-links to project. Switch to photoshoot page, verify different task list appears. Navigate to main Tasks page and verify all tasks visible with project associations.

### Implementation for User Story 3

- [ ] T056 [P] [US3] Create reusable EmbeddedTaskView component in `src/lib/components/tasks/integrations/EmbeddedTaskView.svelte`
- [ ] T057 [US3] Add embedded task view to project detail page in `src/routes/(auth)/projects/[id]/+page.svelte`
- [ ] T058 [P] [US3] Add embedded task view to photoshoot detail page in `src/routes/(auth)/photoshoots/[id]/+page.svelte`
- [ ] T059 [P] [US3] Add embedded task view to resource detail page in `src/routes/(auth)/resources/[id]/+page.svelte`
- [ ] T060 [US3] Implement context-aware task creation with auto-linking in EmbeddedTaskView
- [ ] T061 [US3] Add "View All Tasks" link that navigates to main page with pre-applied filter in EmbeddedTaskView
- [ ] T062 [US3] Add list/board view toggle for embedded views in EmbeddedTaskView
- [ ] T063 [US3] Implement automatic project/resource/photoshoot filtering in embedded contexts
- [ ] T064 [US3] Add task count badge showing number of tasks in context on parent entity page
- [ ] T065 [US3] Create E2E test for contextual task creation in `src/tests/e2e/tasks-contextual.spec.ts`

**Checkpoint**: Task views successfully embedded in projects, photoshoots, and resources. Tasks created in context auto-link correctly. Embedded views filter appropriately and maintain functionality. Navigation between embedded and main view works seamlessly.

---

## Phase 6: User Story 4 - Intuitive Task Manipulation (Priority: P2)

**Goal**: Enable drag-and-drop for stage changes, bulk operations for multi-task updates, and inline property editing for quick changes

**Independent Test**: In board view, drag 3 tasks from "Todo" to "In Progress" and verify stage updates with animation. Select 5 tasks via checkboxes in list view, apply bulk priority change to "High", verify all update. Click status badge on task card, verify dropdown appears for inline editing. Click due date, verify date picker appears inline.

### Implementation for User Story 4

- [ ] T066 [P] [US4] Add drag-and-drop to TaskBoardView for stage changes using native HTML5 DND in `src/lib/components/tasks/views/TaskBoardView.svelte`
- [ ] T067 [P] [US4] Add drag-and-drop to TaskTimelineView for due date changes in `src/lib/components/tasks/views/TaskTimelineView.svelte`
- [ ] T068 [P] [US4] Create TaskMultiSelect component with checkbox selection in `src/lib/components/tasks/bulk/TaskMultiSelect.svelte`
- [ ] T069 [P] [US4] Create BulkActionsMenu component with all bulk operations in `src/lib/components/tasks/bulk/BulkActionsMenu.svelte`
- [ ] T070 [US4] Implement bulk update operations (stage, priority, assignee, tags) in TaskService
- [ ] T071 [US4] Add optimistic UI updates with rollback on failure for drag operations in TaskBoardView
- [ ] T072 [US4] Add visual feedback during drag operations (ghost card, target column highlight) in TaskBoardView
- [ ] T073 [US4] Implement multi-select state management in tasks store with "Select All" functionality in `src/lib/stores/tasks.ts`
- [ ] T074 [US4] Add bulk operation progress indicator for operations affecting 10+ tasks in BulkActionsMenu
- [ ] T075 [US4] Add inline property editors (status badge click, due date click) to TaskCard component in `src/lib/components/tasks/TaskCard.svelte`
- [ ] T076 [US4] Implement drag-to-reorder within columns for custom sort order in TaskBoardView
- [ ] T077 [US4] Add error handling with inline error messages and retry option for failed operations in BulkActionsMenu
- [ ] T078 [US4] Create E2E test for drag-and-drop operations in `src/tests/e2e/tasks-board.spec.ts`
- [ ] T079 [US4] Create E2E test for bulk operations in `src/tests/e2e/tasks-bulk.spec.ts`

**Checkpoint**: Drag-and-drop works smoothly at 60fps with visual feedback. Bulk operations update multiple tasks efficiently with progress indication. Inline editing provides quick property changes without opening detail panel. Error handling maintains UI state and offers retry.

---

## Phase 7: User Story 5 - Standalone Task Management (Priority: P2)

**Goal**: Support tasks not linked to projects for shopping lists, general planning, and team management with proper filtering and conversion

**Independent Test**: Create a task with no project association, tag it as "Shopping", verify it appears in main task views. Apply filter "Only Standalone Tasks" and verify only unlinked tasks display. Later assign the task to a project and verify it moves from standalone to project-scoped without data loss. Delete a project with 5 tasks and verify all tasks become standalone.

### Implementation for User Story 5

- [ ] T080 [US5] Add standalone task creation support (null projectId) in task creation flow in `src/routes/(auth)/tasks/+page.svelte`
- [ ] T081 [US5] Add "Only Standalone Tasks" and "Only Project Tasks" filter options in TaskFilterPanel in `src/lib/components/tasks/filters/TaskFilterPanel.svelte`
- [ ] T082 [US5] Implement task conversion from standalone to project-scoped in TaskDetailPanel in `src/lib/components/tasks/detail/TaskDetailPanel.svelte`
- [ ] T083 [US5] Add visual indicator for standalone tasks (badge or icon) in TaskCard in `src/lib/components/tasks/TaskCard.svelte`
- [ ] T084 [US5] Implement tag support for categorizing standalone tasks in TaskDetailPanel and TaskFilterPanel
- [ ] T085 [US5] Add project deletion handler that converts project tasks to standalone (orphan tasks) in project service
- [ ] T086 [US5] Add "Standalone Tasks" as default grouping option in task views in `src/lib/stores/tasks.ts`

**Checkpoint**: Users can create standalone tasks, filter to see only standalone or only project tasks, tag standalone tasks for organization, convert standalone to project-linked, and orphaned tasks from deleted projects become standalone automatically.

---

## Phase 8: User Story 6 - Advanced Filtering and Grouping (Priority: P2)

**Goal**: Provide multi-criteria filtering with AND logic, custom grouping dimensions, and saved filter views for power users

**Independent Test**: Open filter panel, apply multiple filters (Priority: High AND Project: Cosplay X AND Assigned to: Me), verify only matching tasks display with active filter badges. Change grouping from "Stage" to "Priority", verify tasks reorganize into High/Medium/Low groups with collapsible sections. Save filter combination as "My High Priority", verify it appears in saved views dropdown and reapplies all filters when selected.

### Implementation for User Story 6

- [ ] T087 [US6] Implement multi-criteria filter logic with AND conditions in `src/lib/utils/task-filters.ts`
- [ ] T088 [US6] Add active filter badges showing filter count and names in TaskFilterPanel in `src/lib/components/tasks/filters/TaskFilterPanel.svelte`
- [ ] T089 [US6] Implement grouping options (Stage, Priority, Project, Assignee, Due Date) in task views in `src/lib/stores/tasks.ts`
- [ ] T090 [US6] Add collapsible group sections with group headers showing count in TaskListView in `src/lib/components/tasks/views/TaskListView.svelte`
- [ ] T091 [US6] Add "Save as View" functionality with name dialog in TaskFilterPanel
- [ ] T092 [US6] Implement saved view persistence using SavedTaskView service in `src/lib/stores/taskViews.ts`
- [ ] T093 [US6] Add saved view dropdown with quick access to saved filters in SavedViewsDropdown in `src/lib/components/tasks/filters/SavedViewsDropdown.svelte`
- [ ] T094 [US6] Add "Clear All Filters" button with single-click reset in TaskFilterPanel
- [ ] T095 [US6] Implement date range filter with picker in TaskFilterPanel
- [ ] T096 [US6] Add tag-based filtering in TaskFilterPanel
- [ ] T097 [US6] Preserve grouping preference per view mode in tasks store in `src/lib/stores/tasks.ts`

**Checkpoint**: Power users can apply complex multi-criteria filters with AND logic, see active filters clearly with badges, change grouping dimensions to analyze workload, save favorite filter combinations as named views, and quickly access saved views from dropdown. All filter state persists across sessions.

---

## Phase 9: User Story 7 - Quick Task Creation and Templates (Priority: P3)

**Goal**: Enable rapid task creation with keyboard shortcut, natural language parsing, and reusable templates for common patterns

**Independent Test**: Press 'N' key anywhere in app, quick-create overlay appears, type "buy fabric for Cosplay X by Friday #high", press Enter, verify task creates with project auto-linked, due date set to Friday, priority High. Apply "Convention Packing List" template, verify 10 standard subtasks create automatically. Create complex task with subtasks, click "Save as Template", name it "Custom Workflow", verify it appears in template list.

### Implementation for User Story 7

- [ ] T098 [P] [US7] Create QuickCreateOverlay component with keyboard shortcut in `src/lib/components/tasks/integrations/QuickCreateOverlay.svelte`
- [ ] T099 [P] [US7] Create TemplateSelector component with template list in `src/lib/components/tasks/templates/TemplateSelector.svelte`
- [ ] T100 [P] [US7] Create TemplateSaveDialog component for saving new templates in `src/lib/components/tasks/templates/TemplateSaveDialog.svelte`
- [ ] T101 [US7] Implement global keyboard shortcut handler (N key) in root layout in `src/routes/(auth)/+layout.svelte`
- [ ] T102 [US7] Implement natural language parsing for project mentions, dates, priorities in `src/lib/utils/natural-language.ts`
- [ ] T103 [US7] Add template application logic that creates task with predefined subtasks in QuickCreateOverlay
- [ ] T104 [US7] Implement "Save as Template" feature in TaskDetailPanel in `src/lib/components/tasks/detail/TaskDetailPanel.svelte`
- [ ] T105 [US7] Add template management UI (create, edit, delete templates) in settings page
- [ ] T106 [US7] Implement task duplication feature (copy task without dates/completion) in TaskDetailPanel
- [ ] T107 [US7] Add smart defaults for quick-create (first non-completion stage, medium priority, no project)
- [ ] T108 [US7] Add "Add from Template" button in main tasks page with template selector

**Checkpoint**: Users can quickly create tasks with keyboard shortcut and natural language, apply templates for common workflows, create custom templates from existing tasks, and duplicate tasks for repetitive work patterns. Quick creation flow is fast and intuitive.

---

## Phase 10: Notifications System (Cross-Cutting)

**Goal**: Implement in-app and email notifications for task assignments, @mentions, comments, and status changes

**Independent Test**: Assign a task to another user, verify they receive in-app notification and email. Add comment with @mention, verify mentioned user gets notification. Add comment to task you're assigned to, verify you get notified. Change task status, verify assignee gets notification. Click notification in app header, verify it navigates to task detail panel and marks notification as read.

### Implementation for Notifications

- [ ] T109 [P] Create NotificationCenter component in app header in `src/lib/components/notifications/NotificationCenter.svelte`
- [ ] T110 [P] Create NotificationItem component for individual notifications in `src/lib/components/notifications/NotificationItem.svelte`
- [ ] T111 Implement notification creation on task assignment in TaskService
- [ ] T112 [P] Implement notification creation on @mention in TaskCommentService
- [ ] T113 [P] Implement notification creation on new comment in TaskCommentService
- [ ] T114 [P] Implement notification creation on status change in TaskService
- [ ] T115 Create Edge Function for email notification sending in `supabase/functions/send-task-notification/index.ts`
- [ ] T116 Implement notification preferences UI in settings page in `src/routes/(auth)/settings/notifications/+page.svelte`
- [ ] T117 Add unread count badge to notification icon in app header
- [ ] T118 Implement mark-as-read on notification click with navigation to task in NotificationCenter
- [ ] T119 Add notification polling or real-time subscription in notifications store in `src/lib/stores/notifications.ts`
- [ ] T120 Implement 90-day notification cleanup job (database trigger or cron)

**Checkpoint**: Complete notification system operational with in-app notifications showing in header dropdown, email notifications sending for all events, notification preferences configurable, and notifications navigating to relevant tasks when clicked. Users stay informed about task changes.

---

## Phase 11: Performance Optimization (Cross-Cutting)

**Purpose**: Ensure views render quickly with large task counts and drag operations feel smooth

- [ ] T121 [P] Implement virtual scrolling for TaskListView with 100+ tasks in `src/lib/components/tasks/views/TaskListView.svelte`
- [ ] T122 [P] Add pagination or infinite scroll for TaskBoardView columns in `src/lib/components/tasks/views/TaskBoardView.svelte`
- [ ] T123 [P] Optimize TaskCard rendering with memoization for computed properties in `src/lib/components/tasks/TaskCard.svelte`
- [ ] T124 Add loading skeletons for task views while data fetches in `src/lib/components/tasks/LoadingTaskSkeleton.svelte`
- [ ] T125 Implement progressive loading for task detail panel (basic info first, then comments/activity) in TaskDetailPanel
- [ ] T126 Add database indexes per data-model.md performance recommendations (verify in Supabase dashboard)
- [ ] T127 Implement connection pooling for Supabase queries (verify supavisor configuration)
- [ ] T128 Profile drag-and-drop performance and optimize to maintain 60fps (16ms frame time)

**Checkpoint**: Views render in <2 seconds with 500 tasks, drag operations feel instantaneous, virtual scrolling handles large lists smoothly, and progressive loading reduces perceived latency.

---

## Phase 12: Mobile Responsiveness (Cross-Cutting)

**Purpose**: Ensure all task views work on mobile devices with touch-optimized interactions

- [ ] T129 [P] Add mobile-responsive layout to TaskListView with stacked cards in `src/lib/components/tasks/views/TaskListView.svelte`
- [ ] T130 [P] Add horizontal scrolling to TaskBoardView columns on mobile in `src/lib/components/tasks/views/TaskBoardView.svelte`
- [ ] T131 [P] Make TaskCalendarView mobile-friendly with day view default in `src/lib/components/tasks/views/TaskCalendarView.svelte`
- [ ] T132 Add full-screen task detail panel on mobile in TaskDetailPanel in `src/lib/components/tasks/detail/TaskDetailPanel.svelte`
- [ ] T133 Add swipe gestures for common actions (swipe to complete, swipe to delete) in TaskCard
- [ ] T134 Optimize touch targets for mobile (minimum 44px tap targets) across all task components
- [ ] T135 Add mobile-optimized filter panel with bottom sheet pattern in TaskFilterPanel
- [ ] T136 Test and fix touch-based drag-and-drop on mobile devices in TaskBoardView

**Checkpoint**: All task views fully functional on mobile with appropriate touch interactions, responsive layouts, and optimized for small screens. Mobile users have feature parity with desktop.

---

## Phase 13: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements that affect multiple user stories

- [ ] T137 [P] Add loading states and error boundaries to all major components
- [ ] T138 [P] Add empty states with helpful messages to all task views
- [ ] T139 [P] Implement keyboard navigation for task list (arrow keys, Enter to open)
- [ ] T140 [P] Add accessibility attributes (ARIA labels, roles, keyboard focus) to all interactive elements
- [ ] T141 Add animations for task card movements and transitions (200-300ms duration)
- [ ] T142 Add success toast notifications for operations (task created, updated, deleted)
- [ ] T143 Add confirmation dialogs for destructive actions (delete task, delete template)
- [ ] T144 Add task count statistics to main tasks page header (total, completed, overdue)
- [ ] T145 Add "Overdue" visual indicator (red badge) to tasks past due date across all views
- [ ] T146 Implement data export functionality (export filtered tasks to CSV) in tasks page
- [ ] T147 Add task search highlighting in TaskSearchInput results
- [ ] T148 Update quickstart.md with actual implementation examples from codebase in `specs/003-modern-task-ui/quickstart.md`
- [ ] T149 Create developer documentation for extending task views in `docs/task-system-guide.md`
- [ ] T150 Run E2E test suite and fix any failing tests
- [ ] T151 Perform manual testing of all user stories per quickstart.md test scenarios
- [ ] T152 Fix any linter errors in new task components
- [ ] T153 Review and optimize bundle size for task feature (code splitting if needed)

**Checkpoint**: All polish items complete, system feels refined and professional, documentation updated, tests passing, ready for production deployment.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - US1, US2, US3 (P1 stories) should be completed first as they form MVP
  - US4, US5, US6 (P2 stories) can then proceed in any order
  - US7 (P3 story) can proceed last
- **Notifications (Phase 10)**: Can proceed in parallel with US4-US7 (P2/P3 stories)
- **Performance (Phase 11)**: Best done after US1-US3 complete (needs data to test)
- **Mobile (Phase 12)**: Can proceed after respective view components exist
- **Polish (Phase 13)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Uses TaskCard from US1 but can proceed in parallel
- **User Story 3 (P1)**: Depends on US1 complete (needs EmbeddedTaskView to reuse view components)
- **User Story 4 (P2)**: Depends on US1 complete (enhances board and list views with DND)
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Independent of other stories
- **User Story 6 (P2)**: Can start after Foundational (Phase 2) - Enhances filtering from US1 but can proceed in parallel
- **User Story 7 (P3)**: Can start after Foundational (Phase 2) - Independent of other stories

### Within Each User Story

- Services before components that use them (but services are in Foundational phase)
- View components can be built in parallel within a story
- Main page integration happens after view components exist
- E2E tests written after implementation (or concurrently if following TDD)

### Parallel Opportunities

- **Phase 1 (Setup)**: Tasks T002-T006 (migrations) and T008-T011 (stores) can run in parallel
- **Phase 2 (Foundational)**: Tasks T012-T016 (services) and T018-T023 (utilities/components) can run in parallel
- **Phase 3 (US1)**: Tasks T024-T027 (views), T029-T030 (filter components) can run in parallel
- **Phase 4 (US2)**: Tasks T039-T044 (detail components) can run in parallel
- **Phase 5 (US3)**: Tasks T058-T059 (embedded views in different pages) can run in parallel
- **Phase 6 (US4)**: Tasks T066-T069 (DND and bulk components) can run in parallel
- **After Foundational phase completes**: US1, US2, US5, US6, US7 can all start in parallel (US3 and US4 need US1 first)
- **Cross-cutting phases**: Notifications, Performance, Mobile tasks can often run in parallel across components

---

## Parallel Example: User Story 1 (4 View Modes)

```bash
# Launch all view components for US1 together (after Foundational phase):
Task T024: "Create TaskListView component in src/lib/components/tasks/views/TaskListView.svelte"
Task T025: "Create TaskBoardView component in src/lib/components/tasks/views/TaskBoardView.svelte"
Task T026: "Create TaskCalendarView component in src/lib/components/tasks/views/TaskCalendarView.svelte"
Task T027: "Create TaskTimelineView component in src/lib/components/tasks/views/TaskTimelineView.svelte"

# These 4 tasks work on different files with no dependencies - perfect for parallel execution
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup (database migrations, types, stores)
2. Complete Phase 2: Foundational (CRITICAL - all services and utilities)
3. Complete Phase 3: User Story 1 (4 view modes with filtering)
4. Complete Phase 4: User Story 2 (rich task details)
5. Complete Phase 5: User Story 3 (contextual integration)
6. **STOP and VALIDATE**: Test all 3 P1 stories independently
7. Complete Phase 10: Notifications (essential for collaboration)
8. Complete Phase 11: Performance optimization
9. Complete Phase 13: Polish (for MVP only)
10. Deploy/demo MVP with core task management functionality

**MVP Scope**: 3 P1 user stories + notifications = fully functional modern task UI with all essential features

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 (views) → Test independently → Deploy/Demo (basic task visibility)
3. Add US2 (details) → Test independently → Deploy/Demo (full task management)
4. Add US3 (contextual) → Test independently → Deploy/Demo (MVP complete! 🎯)
5. Add US4 (DND/bulk) → Test independently → Deploy/Demo (power user features)
6. Add US5 (standalone) → Test independently → Deploy/Demo (flexibility)
7. Add US6 (advanced filters) → Test independently → Deploy/Demo (power users)
8. Add US7 (templates) → Test independently → Deploy/Demo (efficiency)
9. Add Notifications → Deploy/Demo (collaboration)
10. Add Performance + Mobile → Deploy/Demo (production-ready)
11. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (views)
   - Developer B: User Story 2 (details)
   - Developer C: User Story 5 (standalone) + User Story 6 (filters)
3. After US1 completes:
   - Developer A: User Story 3 (contextual - needs US1)
   - Developer D: User Story 4 (DND - needs US1)
4. Stories complete and integrate independently
5. Notifications and cross-cutting concerns handled collaboratively

---

## Summary

**Total Tasks**: 153  
**MVP Tasks (US1-US3 + Notifications + Polish)**: ~82 tasks  
**User Stories**: 7 (3 P1, 3 P2, 1 P3)  
**New Entities**: 6 tables (subtasks, comments, attachments, notifications, templates, saved_views)  
**New Services**: 6 services  
**New Components**: 25+ components  
**E2E Tests**: 7 test suites (P1 stories only)

**Parallel Opportunities**: 40+ tasks marked [P] can run in parallel within their phases

**Independent Test Criteria**: Each user story has specific test scenario to validate independently

**MVP Scope**: User Stories 1-3 (P1) + Notifications = Core modern task management with views, details, contextual integration, and collaboration

**Format Validation**: ✅ All tasks follow checklist format with ID, [P] marker where applicable, [Story] label for user story tasks, and file paths

**Ready for Implementation**: ✅ Tasks are immediately executable with sufficient context

---

## Notes

- [P] tasks = different files, no dependencies - can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story independently completable and testable
- Tests are E2E tests only (per constitution MVP-first principle - manual testing acceptable)
- Stop at any checkpoint to validate story independently
- Commit after each task or logical group
- Database migrations must run in order (T001-T007)
- All services must complete before component work begins (Phase 2 blocks Phase 3+)
- US3 depends on US1 (needs view components)
- US4 depends on US1 (enhances board view)

