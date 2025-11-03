# Feature Specification: Modern Task Management UI

**Feature Branch**: `003-modern-task-ui`  
**Created**: 2025-11-03  
**Status**: Draft  
**Input**: User description: "I want to update the task list to look and feel more like a modern task list like what you would find in monday, asana, trello, or clickup. I want a complete UI redesign of the tasks system built from the ground up to be beautiful and functional that will integrate into all the relevant resources and projects and photoshoots and any other section of the application that should have tracking as well as a way for general tracking for tasks not related to any single project like shopping lists, team management, or other such tasks. I have included some images for reference. I want something that will look just as good and have as deep of functionality"

**Constitution Alignment**: 
- **Project-Centric**: Tasks can be project-scoped (linked to projects/resources) or team-scoped (standalone tasks for shopping lists, general management)
- **MVP First**: This redesign enhances existing task functionality (already in MVP Core - Tracking Domain) with modern UI patterns
- **Modular**: Task views integrate across Projects, Resources, Events domains while maintaining independence
- **Complete Workflow**: Task management is critical throughout cosplay lifecycle (planning → creation → events → post-production)
- **Team-Based**: All tasks respect team boundaries via existing task_stages and team_id architecture

## Clarifications

### Session 2025-11-03

- Q: How should the system handle failed operations (network errors, permission issues, server problems)? → A: Show inline error messages with retry option, maintain UI state (user can manually revert if needed)
- Q: When a user deletes a project with active tasks, what should happen to those tasks? → A: Orphan tasks: Convert project tasks to standalone tasks, remove project link
- Q: Should the system send notifications for task events, and if so, which events? → A: Both in-app and email notifications for all task events (assignments, comments, status changes, @mentions)
- Q: How do users watch/subscribe to tasks they're not assigned to? → A: No watching mechanism: Users only get notifications for tasks they're assigned to
- Q: Should tasks from archived projects be visible in the main task views? → A: Hide by default, show with "Include Archived" filter toggle that users can enable
- Q: When a custom field is marked as required, how should validation be enforced for existing tasks? → A: Enforce only on task creation/save - existing tasks without values are allowed, but new edits require the field
- Q: How should custom field values be stored in the database for different field types? → A: Store all values as text with type-specific parsing/validation (JSON string for multi-select, ISO date string, number as string)
- Q: What permissions model should apply to custom field definitions and values? → A: Team-level permissions only - owner/admin can manage field definitions, all members can view/edit field values on tasks
- Q: Should custom fields support export/import between teams? → A: Full export/import - field definitions and values can be exported from one team and imported to another
- Q: How should currency custom fields handle different currencies and symbols? → A: Store currency code separately (USD, EUR, GBP), display with locale-appropriate symbol

### Post-MVP Features (Noted for Future Specs)

The following features were discussed and are valuable but deferred to post-MVP to maintain focused scope:

**Time Management**:
- **Time Estimates**: Add estimated hours/effort fields to tasks
- **Time Tracking**: Track actual hours spent on tasks (manual logging or timer)
- **Actual vs Estimated**: Compare estimated vs actual time for planning improvements

**Integrations**:
- **Calendar Sync**: Two-way sync with Google Calendar, iCal, etc.
- **Discord Integration**: Post task updates, create tasks from Discord, team coordination
- **API Webhooks**: External integrations for Slack, Zapier, custom tools

**Advanced ADHD Support**:
- **Pomodoro Timer**: Built-in 25/5 work/break timer with task-specific focus sessions
- **Achievement System**: Full gamification with levels, points, badges, unlockable rewards
- **Body Doubling**: "Working Now" status showing team members currently working on tasks
- **Energy Level Matching**: Tag tasks by energy required, match to user's current energy
- **Smart Reminders**: Customizable reminders beyond due dates (e.g., "Remind me 3 days before")

**Team Collaboration**:
- **Task Dependencies**: "Task A blocks Task B" relationships with visualization
- **Recurring Tasks**: Tasks that repeat daily/weekly/monthly (separate from team calendar)
- **Task Approval Workflows**: Tasks require review/approval before completion

**Rationale for Deferral**: These features are valuable but require significant additional development time. The current MVP provides a strong, differentiated task management system with ADHD support. Post-MVP iterations can add these based on user feedback and usage patterns, particularly prioritizing time tracking for marketplace/commission economy alignment.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quick Task Overview and Management (Priority: P1)

As a cosplayer, I need to quickly see all my tasks across all projects in different visual formats (list, board, timeline) so I can understand my workload at a glance and prioritize effectively.

**Why this priority**: This is the primary task interface that users will interact with daily. Without clear task visibility, users cannot effectively manage their cosplay projects.

**Independent Test**: Can be fully tested by creating multiple tasks across different projects and stages, then switching between list, kanban, and calendar views to verify all tasks display correctly with proper filtering.

**Acceptance Scenarios**:

1. **Given** I have 20 tasks across 3 projects, **When** I open the Tasks page, **Then** I see a default list view showing all tasks with status, priority, due date, and assignee visible
2. **Given** I am viewing tasks in list view, **When** I click the "Board View" toggle, **Then** tasks reorganize into kanban columns by stage with drag-and-drop enabled
3. **Given** I am viewing tasks in board view, **When** I switch to "Calendar View", **Then** tasks with due dates appear on calendar dates, and I can see task density by day
4. **Given** I have tasks without due dates, **When** I view the calendar, **Then** undated tasks appear in a "Backlog" section below the calendar
5. **Given** I am in any view, **When** I click a filter option (by project, by priority, by assignee), **Then** only matching tasks display and the filter state is visually indicated

---

### User Story 2 - Rich Task Details and Context (Priority: P1)

As a team member, I need to see comprehensive task details including description, subtasks, comments, attachments, and activity history so I can fully understand what needs to be done and collaborate with teammates.

**Why this priority**: Task details are essential for understanding work scope and enabling team collaboration. Without rich details, tasks become ambiguous checklists.

**Independent Test**: Create a task, open its detail panel, add description, create 2 subtasks, add a comment, upload an attachment, change status - verify all information persists and displays correctly.

**Acceptance Scenarios**:

1. **Given** I click on any task, **When** the detail panel opens, **Then** I see task title, description, status selector, priority selector, assignee selector, due date picker, and tabs for Details/Comments/Activity
2. **Given** I am viewing task details, **When** I click "Add Subtask", **Then** a new subtask input appears and I can create nested checklist items that track completion percentage
3. **Given** I have subtasks on a task, **When** 3 of 5 subtasks are completed, **Then** the parent task shows "60% complete" progress indicator
4. **Given** I am on the Comments tab, **When** I type a message and submit, **Then** my comment appears with my avatar, timestamp, and I can @mention teammates
5. **Given** I am on the Activity tab, **When** I view the history, **Then** I see a chronological log of all changes (status changes, assignee changes, field updates) with timestamps and user names
6. **Given** I am viewing task details, **When** I upload files via drag-and-drop, **Then** attachments appear in the details panel with file names, sizes, and download links

---

### User Story 3 - Contextual Task Integration (Priority: P1)

As a project manager, I need to see tasks in context of their parent entities (projects, photoshoots, resources) so I can understand dependencies and manage work within specific contexts.

**Why this priority**: Tasks are meaningless without context. Users need to view project-specific tasks, photoshoot task lists, and resource-related tasks within their respective pages.

**Independent Test**: Navigate to a Project detail page, verify only that project's tasks appear in an embedded task view. Create a new task from within the project context and verify it auto-links to the project.

**Acceptance Scenarios**:

1. **Given** I am viewing a Project detail page, **When** I scroll to the "Tasks" section, **Then** I see a filtered task view showing only tasks linked to this project in list or board format
2. **Given** I am viewing a project's task section, **When** I click "Add Task", **Then** a quick-create form appears and the new task automatically links to the current project
3. **Given** I am viewing a Photoshoot detail page, **When** I view the task section, **Then** I see preparation tasks, shot list tasks, and post-production tasks all linked to this shoot
4. **Given** I am viewing a Resource detail page (outfit, prop), **When** I view the tasks section, **Then** I see creation tasks, acquisition tasks, and maintenance tasks linked to this resource
5. **Given** I create a task within a project context, **When** I view the main Tasks page, **Then** the task appears there as well with clear project association visible

---

### User Story 4 - Intuitive Task Manipulation (Priority: P2)

As a user, I need to easily move tasks between stages, change properties, and bulk-update multiple tasks so I can efficiently manage my workflow without repetitive clicking.

**Why this priority**: Modern task management requires fluid interactions. Drag-and-drop and bulk operations significantly reduce friction in daily task management.

**Independent Test**: Drag 3 tasks from "Todo" to "In Progress" column in board view, verify all update correctly. Select 5 tasks via checkboxes, apply bulk priority change, verify all update.

**Acceptance Scenarios**:

1. **Given** I am in board view, **When** I drag a task card from one column to another, **Then** the task's stage updates immediately with visual feedback (animation, confirmation)
2. **Given** I select multiple tasks via checkboxes in list view, **When** I click "Bulk Actions" and choose "Set Priority: High", **Then** all selected tasks update to high priority
3. **Given** I have multiple tasks selected, **When** I choose "Change Stage" from bulk actions, **Then** all selected tasks move to the chosen stage
4. **Given** I am viewing a task card in any view, **When** I click the status badge directly, **Then** a stage selector dropdown appears for quick inline editing
5. **Given** I am viewing a task in list view, **When** I click the due date, **Then** a date picker appears inline for quick date changes without opening full details

---

### User Story 5 - Standalone Task Management (Priority: P2)

As a cosplayer, I need to create tasks not tied to specific projects (shopping lists, convention prep, general planning) so I can track all my cosplay-related work in one place.

**Why this priority**: Not all tasks belong to projects. Users need flexibility to track general work, shopping, and team management tasks.

**Independent Test**: Create a task with no project association, tag it as "Shopping", verify it appears in main task views and can be filtered separately from project tasks.

**Acceptance Scenarios**:

1. **Given** I click "Add Task" from the main Tasks page, **When** I leave the project field empty, **Then** the task creates as a standalone team-level task
2. **Given** I have standalone tasks, **When** I filter by "Standalone Tasks", **Then** only tasks without project associations display
3. **Given** I create a shopping list task, **When** I view my tasks grouped by "Type", **Then** shopping tasks group separately from project tasks
4. **Given** I have a standalone task, **When** I later assign it to a project, **Then** the task moves from standalone to project-scoped without data loss

---

### User Story 6 - Advanced Filtering and Grouping (Priority: P2)

As a power user, I need to filter tasks by multiple criteria (project, stage, priority, assignee, date range, tags) and group them by different dimensions so I can analyze workload and find specific tasks quickly.

**Why this priority**: As task count grows, finding specific tasks becomes critical. Advanced filtering enables power users to create custom views for their workflow.

**Independent Test**: Apply multiple filters (Priority: High AND Project: Cosplay X AND Assigned to: Me), verify only matching tasks display. Change grouping from "Stage" to "Priority", verify tasks reorganize correctly.

**Acceptance Scenarios**:

1. **Given** I click the Filter button, **When** the filter panel opens, **Then** I see filter options for Stage, Priority, Assignee, Project, Date Range, Tags, and a "Clear All" button
2. **Given** I apply multiple filters, **When** I select "Priority: High" and "Assigned to: Me", **Then** only tasks matching BOTH criteria display
3. **Given** I have active filters, **When** I click "Save as View", **Then** I can name this filter combination and access it from a saved views dropdown
4. **Given** I am viewing tasks, **When** I change grouping from "Stage" to "Priority", **Then** tasks reorganize into "High", "Medium", "Low" groups
5. **Given** I have a saved view, **When** I select it from the dropdown, **Then** all filters and grouping apply automatically

---

### User Story 7 - Quick Task Creation and Templates (Priority: P3)

As a busy cosplayer, I need to quickly create tasks without filling out lengthy forms, and reuse common task patterns (photoshoot prep checklist, convention packing list) so I save time on repetitive work.

**Why this priority**: Quick capture reduces friction in task creation. Templates enable users to leverage patterns for recurring work types.

**Independent Test**: Press keyboard shortcut 'N', quick-create form appears, type task title, press Enter, task creates with defaults. Apply "Photoshoot Prep" template, verify 10 standard subtasks create automatically.

**Acceptance Scenarios**:

1. **Given** I press the 'N' key anywhere in the app, **When** the quick-create overlay appears, **Then** I can type a task title and press Enter to create with smart defaults
2. **Given** I type "photoshoot prep for Cosplay X" in quick create, **When** I press Enter, **Then** the task auto-links to the mentioned project and applies relevant tags
3. **Given** I have task templates, **When** I click "Add from Template" and select "Convention Packing List", **Then** a pre-defined set of subtasks creates (costume check, props check, makeup kit, etc.)
4. **Given** I have created a complex task with subtasks, **When** I click "Save as Template", **Then** I can name it and reuse this structure for future tasks
5. **Given** I am viewing a task detail panel, **When** I click "Duplicate Task", **Then** a copy creates with all properties except dates and completion status

---

### User Story 8 - Task Organization with Labels (Priority: P2)

As a cosplayer managing multiple projects, I need flexible visual categorization beyond projects and stages so I can quickly identify and filter tasks by themes, urgency, or custom categories.

**Why this priority**: Labels provide quick visual organization that's more flexible than rigid hierarchies. ADHD users especially benefit from color-coded visual cues.

**Independent Test**: Create labels "Urgent", "Fabric Work", "Needs Review" with different colors. Apply multiple labels to tasks. Filter tasks by label. Verify labels appear as colored badges on task cards.

**Acceptance Scenarios**:

1. **Given** I am on the Tasks page, **When** I click "Manage Labels", **Then** I see a list of existing labels with color swatches and an "Add Label" button
2. **Given** I create a new label "Urgent" with red color, **When** I apply it to tasks, **Then** the label appears as a red badge on task cards in all views
3. **Given** I have labels defined, **When** I edit a task, **Then** I can add/remove multiple labels with a dropdown or tag-style picker
4. **Given** I have tasks with labels, **When** I filter by "Urgent" label, **Then** only tasks with that label display
5. **Given** I view a task card, **When** multiple labels are applied, **Then** all labels display as colored badges (up to 3 visible, "+2 more" for additional)
6. **Given** I have labeled tasks, **When** I delete a label, **Then** it's removed from all tasks with a confirmation warning
7. **Given** I filter tasks, **When** I select multiple labels, **Then** tasks matching ANY selected label display (OR logic)

---

### User Story 9 - ADHD-Friendly Task Management (Priority: P1)

As a cosplayer with ADHD, I need tools that help me break through decision paralysis, celebrate progress, and maintain focus so I can consistently complete tasks without becoming overwhelmed.

**Why this priority**: ADHD affects executive function, making task initiation, prioritization, and completion challenging. Built-in support features make the app accessible and effective for neurodivergent users.

**Independent Test**: Create 10 tasks with various due dates and priorities. Click "What should I do now?" and verify algorithm suggests appropriate task. Complete task and verify celebration animation plays. Check streak counter updates. Enable Focus Mode and verify UI simplifies to show only current task.

**Acceptance Scenarios**:

1. **Given** I have many tasks in my list, **When** I click "What should I do now?" button, **Then** the system suggests 1-3 specific tasks based on due dates, priority, and dependencies with clear reasoning
2. **Given** I select a suggested task, **When** I click "Start Working", **Then** Focus Mode activates, hiding other tasks and showing only the current task with minimal UI
3. **Given** I am in Focus Mode, **When** I complete the task, **Then** a celebration animation plays (confetti, checkmark swoosh) and I see "Great job! Task complete 🎉"
4. **Given** I complete tasks regularly, **When** I complete a task, **Then** my task completion streak updates (e.g., "5 days in a row! 🔥")
5. **Given** I view my tasks, **When** I look at the header, **Then** I see today's completion progress ("3/8 tasks complete today") with a progress bar
6. **Given** I create a task with a far-away due date, **When** I save it, **Then** the system prompts "This task is due in 30 days. Want to set milestone deadlines for each stage?"
7. **Given** I set stage-level deadlines on a task, **When** I view the task card, **Then** I see upcoming stage deadline ("Planning due in 3 days") with color-coded urgency
8. **Given** I complete a task stage before its deadline, **When** the stage advances, **Then** I see encouragement ("Planning done early! 🎯") and the next stage's deadline
9. **Given** I have an active streak, **When** I view the Tasks page header, **Then** I see my current streak with a flame icon and motivational message
10. **Given** I haven't completed tasks today, **When** it's evening, **Then** I see a gentle prompt "You haven't completed any tasks today. Here's a quick one to get started:" with an easy task suggestion

**ADHD-Specific Features**:
- **Next Action Algorithm**: Suggests tasks based on due dates, priority, estimated effort, and user's completion patterns
- **Focus Mode**: Full-screen single-task view with minimal distractions
- **Celebration Animations**: Visual reward for completing tasks (confetti, checkmarks, encouraging messages)
- **Streak Tracking**: Consecutive days with completed tasks, displayed prominently with flame emoji
- **Stage-Level Deadlines**: Break long projects into smaller milestone deadlines per workflow stage
- **Progress Visibility**: "X/Y tasks complete" shown everywhere (header, project pages, task cards)
- **Gentle Prompts**: Encouraging, non-judgmental reminders to start tasks
- **Decision Support**: "What should I do now?" removes paralysis by providing clear direction

---

### User Story 10 - Task Breakdown Assistance (Priority: P2)

As a user planning complex cosplay projects, I need help breaking large overwhelming tasks into manageable subtasks so I can get started and make steady progress without feeling paralyzed.

**Why this priority**: Large tasks create anxiety and procrastination, especially for ADHD users. Automatic breakdown suggestions lower the barrier to starting work.

**Independent Test**: Create task "Build Iron Man Armor". System prompts for breakdown. Accept suggestion. Verify subtasks like "Research reference images", "Cut foam pieces", "Paint and weather" are created automatically.

**Acceptance Scenarios**:

1. **Given** I create a new task with no subtasks, **When** I save it, **Then** the system asks "This looks like a big task! Want help breaking it down?"
2. **Given** I accept breakdown assistance, **When** the system analyzes the task title, **Then** it suggests 3-7 logical subtasks based on common cosplay workflows
3. **Given** I see suggested subtasks, **When** I review them, **Then** I can edit, delete, reorder, or add more before confirming
4. **Given** I have a task with no subtasks and due date > 7 days away, **When** I view the task, **Then** I see a gentle prompt "Break this down into smaller steps?" with a magic wand icon
5. **Given** I click "Suggest subtasks", **When** the task is related to a previous similar task, **Then** the system offers "You broke down a similar task last time. Use that structure?"
6. **Given** I have templates saved, **When** I create a new task, **Then** the system suggests matching templates ("This looks like a photoshoot task. Apply Photoshoot Prep template?")
7. **Given** I create multiple similar tasks, **When** I break down one, **Then** the system learns and offers better suggestions for future similar tasks

**Breakdown Suggestions by Task Type**:
- **Costume Creation**: Research → Pattern/design → Material gathering → Construction → Fitting → Finishing
- **Prop Building**: Reference gathering → Material selection → Base construction → Detail work → Painting → Weathering
- **Photoshoot Planning**: Location scouting → Crew booking → Shot list → Equipment prep → Costume prep → Execution
- **Convention Prep**: Registration → Hotel booking → Costume selection → Packing list → Travel arrangements → Schedule planning

---

### User Story 11 - Custom Task Fields (Priority: P3)

As a power user, I need to add custom fields to my task cards so I can track additional information specific to my workflow that wasn't anticipated by the default fields.

**Why this priority**: Different users have different tracking needs (budget, measurements, material specs, etc.). Custom fields provide flexibility without cluttering the default UI for everyone.

**Independent Test**: Navigate to team settings, create a custom field "Budget" (currency type) and "Material" (text type). Create a task, verify custom fields appear in task detail panel. Enter values, save, verify data persists. Add another task, verify custom field appears there too. Delete custom field definition, verify it's removed from all tasks.

**Acceptance Scenarios**:

1. **Given** I am a team owner/admin, **When** I navigate to team settings → Custom Fields, **Then** I see a list of existing custom fields and an "Add Custom Field" button
2. **Given** I click "Add Custom Field", **When** I specify field name "Budget", type "Currency", and save, **Then** the custom field appears in task detail panels for all tasks in this team
3. **Given** I have custom fields defined, **When** I open any task detail panel, **Then** I see a "Custom Fields" section showing all team custom fields with appropriate input widgets
4. **Given** I am editing a task with custom fields, **When** I enter a value in a custom text field and save, **Then** the value persists and displays on task reopening
5. **Given** I have a custom dropdown field "Status Type" with options ["In Review", "Blocked", "Waiting"], **When** I select "Blocked" for a task, **Then** the selection saves and displays correctly
6. **Given** I have custom fields with values on multiple tasks, **When** I delete a custom field definition, **Then** the field and all its values are removed from all tasks (with confirmation warning)
7. **Given** I have custom fields defined, **When** I view task cards in list/board view, **Then** I can optionally show selected custom fields as additional metadata on the card
8. **Given** I am filtering tasks, **When** I open the filter panel, **Then** I can filter by custom field values (e.g., Budget > $100, Material = "Vinyl")

**Custom Field Types Supported**:
- **Text**: Single-line text input
- **Textarea**: Multi-line text input
- **Number**: Numeric input with optional min/max
- **Currency**: Number with currency code (ISO 4217) selector; displays with appropriate symbol based on selected currency (e.g., USD→$, EUR→€, GBP→£)
- **Dropdown**: Single-select from predefined options
- **Multi-select**: Multiple selections from predefined options
- **Checkbox**: Boolean yes/no
- **Date**: Date picker
- **URL**: Link input with validation
- **Email**: Email input with validation

---

### Edge Cases

- What happens when a user drags a task to a stage that doesn't exist for that task's team (mixing team tasks in shared views)?
- How does the system handle tasks with 100+ subtasks (performance and UI considerations)?
- When a user deletes a project, all linked tasks are converted to standalone team-level tasks, preserving task data while removing project association
- Tasks from archived projects are hidden from main task views by default; users can enable "Include Archived" filter toggle to display them
- What happens when a task has multiple large attachments (50MB+ total)?
- How does the calendar view handle days with 50+ tasks?
- What happens when a user tries to assign a task to someone not in the team?
- How does the system handle conflicting simultaneous edits to the same task (real-time collaboration)?
- What happens when viewing tasks across multiple teams (team switching/filtering)?
- How does the system handle tasks with past due dates (visual warnings, notifications)?
- **Custom Fields**: What happens when a custom field definition is deleted and tasks have values for that field? (Answer: Values are cascade deleted with confirmation warning)
- **Custom Fields**: What happens when a task template includes custom field values that don't exist in the destination team? (Answer: Field is skipped/ignored)
- **Custom Fields**: How many custom fields can a team create? (Answer: Maximum 20 custom fields per team to prevent UI clutter and performance issues)
- **Custom Fields**: What happens when custom field dropdown options are changed after tasks have existing values? (Answer: Existing values preserved even if option removed, shown with warning badge)
- **Custom Fields**: What happens when importing custom field definitions with names that already exist in the destination team? (Answer: System detects conflict and prompts user to rename incoming field, skip import, or merge if types match)
- **Custom Fields**: What happens when importing tasks with custom field values for fields that don't exist in destination team? (Answer: User prompted to either create matching field definitions first or skip those field values during import)
- **Custom Fields**: What happens when filtering or sorting by currency fields with different currency codes? (Answer: System converts all currencies to team's default currency using exchange rates for comparison, displays original currency in results)
- **Labels**: What happens when a user tries to create more than 50 labels? (Answer: System prevents creation and shows message "Maximum 50 labels reached. Delete unused labels to create new ones")
- **Labels**: What happens when applying 10+ labels to a single task? (Answer: Task card shows first 3 labels + "+7 more" badge; hover/click shows all labels)
- **Stage Deadlines**: What happens if user sets stage deadlines in non-chronological order? (Answer: System allows it with warning "Stage deadlines seem out of order. Is this intentional?")
- **Stage Deadlines**: What happens when a task is moved backward to a previous stage with a past deadline? (Answer: Deadline reactivates with overdue indicator)
- **Focus Mode**: What happens if user navigates away from app while in Focus Mode? (Answer: Focus Mode state persists; returning to app shows "You're still working on [Task]. Continue?" prompt)
- **Streak Tracking**: What happens to streaks across timezones or when user works at midnight? (Answer: Streak based on user's local timezone; completion at 11:59pm counts for that day)
- **Task Breakdown**: What happens when breakdown suggestions fail to match task type? (Answer: System offers generic breakdown: "Break into 3-5 steps" with empty subtask fields to fill)
- **Task Breakdown**: What happens if user repeatedly rejects breakdown suggestions? (Answer: System learns preference and stops auto-prompting for that user, but keeps "Suggest Subtasks" button available)

## Requirements *(mandatory)*

### Functional Requirements

**View Capabilities**

- **FR-001**: System MUST provide four primary task view modes: List, Kanban Board, Calendar, and Timeline
- **FR-002**: Users MUST be able to switch between view modes instantly without losing filter or grouping state
- **FR-003**: System MUST persist user's preferred view mode per context (main Tasks page vs. project-embedded view)
- **FR-004**: Calendar view MUST display tasks on their due dates with visual indicators for task density (1-2 tasks, 3-5 tasks, 6+ tasks)
- **FR-005**: Timeline view MUST display tasks along a horizontal date axis with bars representing duration (from creation or start date to due date)

**Task Display & Information Density**

- **FR-006**: List view MUST show task cards with visible properties: title, status badge, priority indicator, assignee avatar, due date, project tag, and completion progress
- **FR-007**: Board view MUST organize tasks into vertical columns representing stages, with column headers showing stage name and task count
- **FR-008**: Task cards MUST display subtask completion as a progress bar (e.g., "3/5 complete" with 60% filled bar)
- **FR-009**: System MUST use color coding for priority levels: High (red/orange), Medium (blue), Low (gray)
- **FR-010**: System MUST display assignee avatars as circular profile images or initials on colored backgrounds
- **FR-011**: Overdue tasks MUST have visual indicators (red due date, warning icon) visible in all views

**Task Detail Panel**

- **FR-012**: Clicking any task MUST open a slide-in detail panel from the right side without leaving the current page
- **FR-013**: Detail panel MUST have three tabs: Details, Comments, Activity Log
- **FR-014**: Details tab MUST allow editing all task properties: title, description (rich text), status, priority, assignee, due date, project link, tags
- **FR-015**: System MUST support adding, editing, and removing subtasks with checkbox completion tracking
- **FR-016**: System MUST calculate and display completion percentage based on completed subtasks
- **FR-017**: Comments tab MUST support rich text comments with @mentions, timestamps, and user avatars
- **FR-018**: Comments MUST display in chronological order (newest first or oldest first based on user preference)
- **FR-019**: Activity Log tab MUST show all task changes: status changes, field updates, assignments, with timestamps and user attribution
- **FR-020**: Users MUST be able to attach multiple files to tasks via drag-and-drop or file picker
- **FR-021**: Attachments MUST display with file name, size, upload date, and download/preview options
- **FR-022**: System MUST support previewing image attachments inline without downloading

**Drag-and-Drop Interactions**

- **FR-023**: Board view MUST support dragging task cards between stage columns to update task stage
- **FR-024**: System MUST provide visual feedback during drag operations (card follows cursor, target column highlights)
- **FR-025**: Dropping a task on a new column MUST immediately update the task's stage with optimistic UI update
- **FR-026**: Timeline view MUST allow dragging task bars horizontally to adjust due dates
- **FR-027**: System MUST support drag-to-reorder tasks within a single column or list to adjust custom sort order

**Filtering and Search**

- **FR-028**: System MUST provide a filter panel with options: Stage, Priority, Assignee, Project, Date Range, Tags, Completion Status, Include Archived
- **FR-029**: Users MUST be able to apply multiple filters simultaneously with AND logic (all conditions must match)
- **FR-030**: Active filters MUST be visually indicated with badges showing filter count and active filter names
- **FR-031**: System MUST provide a search input that filters tasks by title and description text (case-insensitive, partial match)
- **FR-032**: Users MUST be able to clear all filters at once with a single "Clear Filters" action
- **FR-033**: System MUST allow saving filter combinations as named "Views" for quick access
- **FR-034**: Saved views MUST appear in a dropdown and persist across sessions
- **FR-035**: By default, tasks linked to archived projects MUST be hidden from all main task views (List, Board, Calendar, Timeline)
- **FR-036**: Filter panel MUST include "Include Archived" toggle that, when enabled, displays tasks from archived projects alongside active project tasks
- **FR-037**: Tasks from archived projects MUST be visually distinguished with an "Archived Project" badge when "Include Archived" is enabled
- **FR-038**: When viewing an archived project's detail page, all linked tasks MUST be visible regardless of "Include Archived" filter state

**Grouping Options**

- **FR-039**: System MUST support grouping tasks by: Stage, Priority, Project, Assignee, Due Date (Today/This Week/Later/No Date)
- **FR-040**: Changing grouping MUST reorganize tasks into collapsible sections with group headers showing count
- **FR-041**: Group sections MUST be collapsible/expandable to manage visual complexity
- **FR-042**: System MUST preserve grouping preference per view mode (List grouping separate from Board grouping)

**Bulk Operations**

- **FR-043**: List view MUST support multi-select via checkboxes on task cards
- **FR-044**: System MUST provide bulk actions menu when tasks are selected: Change Stage, Set Priority, Assign To, Add Tags, Delete
- **FR-045**: Bulk actions MUST update all selected tasks simultaneously with single confirmation
- **FR-046**: System MUST show progress indicator for bulk operations affecting 10+ tasks
- **FR-047**: Users MUST be able to select all tasks matching current filters with "Select All" option

**Contextual Task Views**

- **FR-048**: Project detail pages MUST include an embedded task view showing only tasks linked to that project
- **FR-049**: Photoshoot detail pages MUST include an embedded task section with tasks linked to the photoshoot
- **FR-050**: Resource detail pages MUST include task sections for creation/maintenance tasks linked to that resource
- **FR-051**: Embedded task views MUST support toggling between list and board view modes
- **FR-052**: Creating a task from within a context (project page) MUST auto-link the task to that entity
- **FR-053**: Embedded task views MUST have "View All Tasks" link that navigates to main Tasks page with appropriate filter pre-applied

**Task Creation & Quick Actions**

- **FR-054**: Users MUST be able to create tasks via "Add Task" button that opens an inline creation form
- **FR-055**: Quick create form MUST have fields: Title (required), Project (optional), Stage (defaults to first non-completion stage), Priority (defaults to medium)
- **FR-056**: System MUST support keyboard shortcut (N key) to open quick create overlay from anywhere in the app
- **FR-057**: Quick create MUST support natural language parsing for project mentions, dates, and priorities (e.g., "buy fabric for Cosplay X by Friday #high")
- **FR-058**: Users MUST be able to duplicate existing tasks to reuse structure and subtasks
- **FR-059**: System MUST provide task templates for common patterns (convention prep, photoshoot checklist)
- **FR-060**: Applying a template MUST create the task with all predefined subtasks and default properties
- **FR-061**: Users MUST be able to create custom templates by saving existing tasks as templates

**Standalone Task Management**

- **FR-062**: Users MUST be able to create tasks without linking to projects (standalone team-level tasks)
- **FR-063**: Standalone tasks MUST be visible in main task views alongside project tasks
- **FR-064**: System MUST provide filter option to show "Only Standalone Tasks" or "Only Project Tasks"
- **FR-065**: Users MUST be able to convert standalone tasks to project tasks by assigning a project
- **FR-066**: System MUST support tags for categorizing standalone tasks (shopping, admin, team management)
- **FR-067**: When a project is deleted, all tasks linked to that project MUST be automatically converted to standalone team-level tasks (orphaned) while preserving all task data

**Responsive Design**

- **FR-068**: All task views MUST be fully functional on mobile devices (phones, tablets)
- **FR-069**: Mobile view MUST default to list view with stacked card layout
- **FR-070**: Task detail panel MUST open full-screen on mobile devices
- **FR-071**: Mobile interface MUST support swipe gestures for common actions (swipe to mark complete, swipe to delete)
- **FR-072**: Board view on mobile MUST allow horizontal scrolling between stage columns

**Performance & Scalability**

- **FR-073**: System MUST render views with up to 500 tasks without perceivable lag (under 2 seconds)
- **FR-074**: System MUST implement virtual scrolling for lists exceeding 100 visible tasks
- **FR-075**: Drag operations MUST feel instantaneous (under 16ms frame time for 60fps)
- **FR-076**: System MUST load task details progressively (basic info first, then comments/activity)

**Integration & Data Consistency**

- **FR-077**: All task views MUST respect existing team permissions and data isolation
- **FR-078**: Tasks MUST continue using existing task_stages system (no changes to stage data model)
- **FR-079**: System MUST maintain backward compatibility with existing task data and completed boolean
- **FR-080**: Creating tasks from new UI MUST work identically to existing task creation (same data structure)

**Error Handling & Recovery**

- **FR-081**: When operations fail (drag-and-drop, file upload, bulk actions), system MUST display inline error messages near the affected UI element
- **FR-082**: Error messages MUST include a "Retry" action that allows users to reattempt the failed operation without re-entering data
- **FR-083**: Failed operations MUST maintain UI state (task cards stay in their dragged position, form data retained) until user explicitly reverts or retries
- **FR-084**: System MUST distinguish between different error types: network failures (temporary), permission errors (user action required), validation errors (data correction needed)
- **FR-085**: Network-related errors MUST show estimated retry time or "Check connection" message to guide user action

**Notifications & Alerts**

- **FR-086**: System MUST send both in-app and email notifications for task assignments (when a task is assigned to a user)
- **FR-087**: System MUST send both in-app and email notifications for @mentions in task comments (regardless of assignment)
- **FR-088**: System MUST send both in-app and email notifications when new comments are added to tasks the user is assigned to
- **FR-089**: System MUST send both in-app and email notifications when task status/stage changes for tasks the user is assigned to
- **FR-090**: Users do NOT receive notifications for tasks they are not assigned to, except for @mentions
- **FR-091**: In-app notifications MUST appear in a notification center/dropdown accessible from the app header
- **FR-092**: In-app notifications MUST show unread count badge and mark as read when clicked
- **FR-093**: Clicking an in-app notification MUST navigate to the relevant task detail panel
- **FR-094**: Email notifications MUST include task title, change description, actor name, and direct link to the task
- **FR-095**: Users MUST be able to configure notification preferences (disable email, disable in-app, or disable specific event types) in settings

**Task Labels & Organization**

- **FR-096**: Users MUST be able to create custom labels for their team with a name and color (hex color code)
- **FR-097**: Labels MUST be team-scoped (all team members can view and use team labels)
- **FR-098**: Users MUST be able to apply multiple labels to a single task
- **FR-099**: Labels MUST appear as colored badges on task cards in all views (list, board, calendar, timeline)
- **FR-100**: Task cards MUST display up to 3 labels visibly, with "+N more" indicator for additional labels
- **FR-101**: Users MUST be able to filter tasks by one or more labels (OR logic: show tasks matching ANY selected label)
- **FR-102**: Label filter state MUST persist across sessions in saved views
- **FR-103**: Deleting a label MUST show confirmation warning and remove label from all tasks
- **FR-104**: Maximum 50 labels per team MUST be enforced to prevent organizational clutter
- **FR-105**: Labels MUST be manageable from a "Manage Labels" dialog with create/edit/delete/reorder capabilities
- **FR-106**: Label color picker MUST offer preset colors (10-15 options) and custom color input

**ADHD-Friendly Features**

- **FR-107**: System MUST provide a "What should I do now?" button that suggests 1-3 tasks based on priority algorithm
- **FR-108**: Task suggestion algorithm MUST consider: due dates (urgent first), task priority, project priority, estimated effort (if set), and dependencies
- **FR-109**: Suggested tasks MUST display with reasoning (e.g., "Due tomorrow", "High priority", "Blocks 3 other tasks")
- **FR-110**: System MUST provide a Focus Mode that displays only the current task in a distraction-free full-screen layout
- **FR-111**: Focus Mode MUST hide navigation, sidebar, and all other tasks, showing only task title, description, subtasks, and "Mark Complete" button
- **FR-112**: Completing a task MUST trigger a celebration animation (confetti or checkmark swoosh) with encouraging message
- **FR-113**: System MUST track user's task completion streak (consecutive days with at least one completed task)
- **FR-114**: Streak counter MUST display prominently in Tasks page header with flame emoji (e.g., "🔥 5 day streak!")
- **FR-115**: System MUST display today's task completion progress in header (e.g., "3/8 tasks complete today" with progress bar)
- **FR-116**: Task cards MUST show completion progress percentage when subtasks exist (e.g., "60% complete" with visual bar)
- **FR-117**: Users MUST be able to set stage-level deadlines (milestone deadlines for each workflow stage)
- **FR-118**: When creating a task with due date > 7 days away, system MUST prompt "Want to set milestone deadlines for each stage?"
- **FR-119**: Task cards with stage-level deadlines MUST display upcoming stage deadline with color-coded urgency (green: >3 days, yellow: 1-3 days, red: <1 day or overdue)
- **FR-120**: Completing a task stage before its deadline MUST show encouragement message (e.g., "Planning done early! 🎯")
- **FR-121**: System MUST provide gentle evening prompt if no tasks completed today, suggesting an easy task to build momentum
- **FR-122**: All progress indicators, streaks, and celebrations MUST use positive, encouraging language (never punishing or guilt-inducing)
- **FR-123**: Focus Mode MUST be accessible via keyboard shortcut (e.g., 'F' key) for quick activation
- **FR-124**: Users MUST be able to exit Focus Mode easily (ESC key or visible "Exit Focus" button)

**Task Breakdown Assistance**

- **FR-125**: When creating a new task, system MUST prompt "Want help breaking this down?" if title suggests complex work
- **FR-126**: Task breakdown suggestions MUST analyze task title and suggest 3-7 logical subtasks based on common cosplay workflows
- **FR-127**: System MUST recognize task types: Costume Creation, Prop Building, Photoshoot Planning, Convention Prep, Material Sourcing
- **FR-128**: Suggested subtasks MUST be editable (add, remove, reorder, rename) before user confirms
- **FR-129**: For tasks with no subtasks and due date > 7 days away, system MUST show gentle prompt "Break this down into smaller steps?" with magic wand icon
- **FR-130**: When user creates similar tasks repeatedly, system MUST learn patterns and improve future suggestions
- **FR-131**: If user has previously broken down a similar task, system MUST offer "Use previous breakdown structure?" option
- **FR-132**: Task breakdown suggestions MUST be available on-demand via "Suggest Subtasks" button in task detail panel
- **FR-133**: System MUST match task titles to saved templates and offer "Apply [Template Name] template?" when detected
- **FR-134**: Breakdown suggestions MUST include logical workflow order (e.g., Research before Construction)

**Custom Task Fields**

- **FR-135**: Team owners and admins MUST be able to define custom fields for their team in team settings
- **FR-136**: All team members MUST be able to view and edit custom field values on tasks they have permission to edit, regardless of who created the field definition
- **FR-137**: System MUST support custom field types: text, textarea, number, currency, dropdown, multi-select, checkbox, date, URL, email
- **FR-138**: Currency fields MUST store both numeric value and currency code (ISO 4217) separately and display with locale-appropriate symbol (e.g., "$100.00" for USD, "€100.00" for EUR)
- **FR-139**: Custom field definitions MUST include: field name, field type, required flag, default value (optional), and field-specific options (e.g., dropdown choices)
- **FR-140**: Required custom fields MUST be enforced only on task creation and when editing/saving existing tasks; existing tasks without required field values are allowed to remain unchanged
- **FR-141**: Custom fields MUST appear in task detail panel in a dedicated "Custom Fields" section below standard fields
- **FR-142**: System MUST render appropriate input widget for each custom field type (text input, dropdown, date picker, etc.)
- **FR-143**: Custom field values MUST be saved automatically when task detail panel is updated
- **FR-144**: Users MUST be able to configure which custom fields appear on task cards in list/board view in team settings
- **FR-145**: Task filters MUST support filtering by custom field values (text contains, number comparison, dropdown selection, etc.)
- **FR-146**: Custom fields MUST be team-scoped (each team has its own custom field definitions)
- **FR-147**: Maximum 20 custom fields per team MUST be enforced to prevent UI clutter and performance degradation
- **FR-148**: Deleting a custom field definition MUST show confirmation warning and CASCADE delete all task values for that field
- **FR-149**: Custom field definitions MUST be orderable/reorderable by team admins to control display order
- **FR-150**: Dropdown/multi-select custom fields MUST support adding/editing/deleting options from team settings
- **FR-151**: Changing dropdown options MUST preserve existing task values even if option is removed (show with warning badge)
- **FR-152**: Task templates MUST support saving and applying custom field values
- **FR-153**: Custom field values MUST be included in task search when searching by "all fields"
- **FR-154**: Custom field history changes MUST appear in task activity log
- **FR-155**: Team admins MUST be able to export custom field definitions (field name, type, options, settings) as JSON or CSV format
- **FR-156**: Team admins MUST be able to import custom field definitions from exported files into their team
- **FR-157**: When importing custom field definitions, system MUST detect name conflicts and prompt user to rename, skip, or merge
- **FR-158**: Task exports (CSV, JSON) MUST include custom field values with field names as column headers
- **FR-159**: Task imports MUST support mapping imported custom field data to existing field definitions in the destination team

### Key Entities *(existing entities, enhanced UI only)*

- **Task**: Existing entity with properties: id, title, description, stageId, priority, assignedTo, dueDate, projectId (nullable), resourceId (nullable), teamId, completed (deprecated), createdAt, updatedAt
  - Enhanced UI adds: subtasks (nested), comments (related entity), attachments (related entity), activity log (generated from audit trail)

- **TaskStage**: Existing entity, no changes required - defines workflow columns for board view

- **Subtask** (new related entity): Child checklist items under a task
  - Properties: id, taskId, title, completed, order
  - Used for: Breaking down tasks into smaller steps, calculating completion progress

- **TaskComment** (new related entity): Comments/discussion on tasks
  - Properties: id, taskId, userId, content (rich text), mentions (array of user IDs), createdAt
  - Used for: Team collaboration, discussion threads, @mentions

- **TaskAttachment** (new related entity): Files attached to tasks
  - Properties: id, taskId, fileName, fileSize, mimeType, storageUrl, uploadedBy, uploadedAt
  - Used for: Reference documents, images, receipts, pattern files

- **TaskTemplate** (new related entity): Reusable task patterns
  - Properties: id, teamId, name, description, defaultStageId, defaultPriority, subtasks (JSON array)
  - Used for: Common workflows like "Convention Prep", "Photoshoot Planning"

- **TaskNotification** (new related entity): Notification records for task events
  - Properties: id, userId, taskId, eventType (assignment, mention, comment, status_change), read (boolean), message, actorUserId, createdAt
  - Used for: In-app notification center, tracking read/unread state, linking to tasks

- **TaskLabel** (new related entity): Custom labels for task organization
  - Properties: id, teamId, name, color (hex), displayOrder, createdAt, updatedAt
  - Used for: Flexible visual categorization, quick filtering, color-coded organization
  - Business rules: Max 50 labels per team, unique names per team

- **TaskLabelAssignment** (new related entity): Many-to-many relationship between tasks and labels
  - Properties: taskId, labelId
  - Used for: Applying multiple labels to tasks, filtering by labels
  - Business rules: Task can have multiple labels, label can be on multiple tasks

- **TaskStageDeadline** (new related entity): Stage-level milestone deadlines for ADHD support
  - Properties: id, taskId, stageId, dueDate, completedAt (nullable), createdAt, updatedAt
  - Used for: Breaking down long projects into smaller deadlines, reducing overwhelm, celebrating stage completions
  - Business rules: One deadline per stage per task, optional (not all stages need deadlines)

- **UserTaskStats** (new related entity): User task completion statistics for gamification
  - Properties: userId, currentStreak (days), longestStreak, tasksCompletedToday, tasksCompletedThisWeek, tasksCompletedAllTime, lastCompletionDate
  - Used for: Streak tracking, progress visibility, motivation
  - Business rules: Updated on task completion, streak breaks if no completions for 24+ hours

- **TaskBreakdownPattern** (new related entity): Learned patterns for task breakdown suggestions
  - Properties: id, teamId, taskType (costume/prop/photoshoot/convention/material), pattern (JSON array of subtask titles), usageCount, createdAt
  - Used for: AI-assisted task breakdown, learning from user patterns, template suggestions
  - Business rules: Team-scoped, patterns improve with usage, top 10 patterns per type

- **CustomFieldDefinition** (new related entity): Custom field definitions for teams
  - Properties: id, teamId, fieldName, fieldType (text, textarea, number, currency, dropdown, multi-select, checkbox, date, url, email), required (boolean), defaultValue (nullable), options (JSON array for dropdown/multi-select; for currency type stores default currency code), displayOrder, showOnCard (boolean), createdAt, updatedAt
  - Used for: Defining team-specific custom fields, configuring field behavior, controlling display
  - Business rules: Max 20 per team, unique field names per team, cascade delete field values on definition delete; currency fields must specify default currency code in options
  - Permissions: Only team owners and admins can create/edit/delete field definitions; all team members can view definitions and edit field values on tasks

- **TaskCustomFieldValue** (new related entity): Custom field values for individual tasks
  - Properties: id, taskId, fieldDefinitionId, value (TEXT), createdAt, updatedAt
  - Used for: Storing custom field data per task, querying/filtering by custom values
  - Business rules: All values stored as TEXT with type-specific formatting (JSON array string for multi-select, ISO 8601 date string for dates, numeric string for numbers, JSON object for currency with structure {"amount": "100.00", "currency": "USD"}); application layer handles parsing and validation; null allowed for non-required fields

## Success Criteria *(mandatory)*

### Measurable Outcomes

**User Efficiency**

- **SC-001**: Users can find a specific task within 10 seconds using search and filters (measured via usability testing)
- **SC-002**: Users can change a task's status in under 3 clicks/interactions in any view
- **SC-003**: Users can create a basic task in under 15 seconds from any page in the app
- **SC-004**: Users can see their full task workload (all projects) within 2 seconds of opening Tasks page

**Visual Quality & User Satisfaction**

- **SC-005**: User testing participants rate the new UI as "modern and professional" at 4.5/5 or higher
- **SC-006**: 90% of users successfully switch between view modes without guidance in usability tests
- **SC-007**: Users report the interface feels "at least as good as Monday/Asana" in comparative feedback sessions

**Functional Completeness**

- **SC-008**: 100% of existing task functionality remains accessible through new UI (no regression)
- **SC-009**: Users can complete a full task workflow (create → assign → add details → subtasks → mark complete) without switching views
- **SC-010**: All four view modes (List, Board, Calendar, Timeline) display consistently with same task data

**Performance**

- **SC-011**: Task views load and become interactive within 2 seconds on standard broadband connection
- **SC-012**: Drag-and-drop operations complete with visual feedback within 100ms
- **SC-013**: Switching between views happens instantly (under 500ms) without reload
- **SC-014**: Users can work with 200+ tasks without perceiving slowdown

**Adoption & Usage**

- **SC-015**: Users spend at least 30% of their session time in task views (indicating utility)
- **SC-016**: 80% of users who create projects also create associated tasks (indicating integration success)
- **SC-017**: Average task completion rate increases by 20% within 4 weeks of rollout (better visibility drives completion)
- **SC-018**: User-reported task management friction decreases by 50% in post-deployment surveys

**Mobile Experience**

- **SC-019**: Mobile users successfully complete task creation and updates at same rate as desktop users
- **SC-020**: Mobile task views receive 4+ star rating for usability in feedback forms

### Assumptions

- Users are already familiar with the existing task system and basic task concepts (stages, priorities)
- Users have access to devices with modern browsers supporting drag-and-drop APIs
- Task counts per team will typically range from 50-500 tasks (extreme cases may require performance optimization)
- Users will primarily interact with tasks from dedicated Tasks page, with secondary access through project/resource contexts
- Team stage configurations are already set up (default stages exist for all teams per existing system)
- Users understand kanban board concepts from exposure to tools like Trello, or will learn through brief onboarding tooltip
- Calendar and timeline views assume tasks with due dates; undated tasks need clear handling (backlog section)
- File attachment sizes will be reasonable (under 25MB per file) based on typical use cases (images, PDFs)
- Rich text editing for descriptions and comments does not need advanced formatting (bold, italic, links, lists sufficient)
- Real-time collaboration (seeing other users' changes live) is not required for initial release but UI should accommodate future addition
- Notification scope is limited to assigned tasks and @mentions; no task watching/subscription mechanism in initial release
