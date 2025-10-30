# Tasks: MVP Cosplay Tracker Redesign

**Input**: Design documents from `/home/jek/Downloads/cosplay-tracker/specs/002-mvp-redesign/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Constitution Compliance**: ✅ All tasks implement features per `.specify/memory/constitution.md` principles:
- **Project-Centric**: All cosplay features associable with projects (US1-US5)
- **Team-Based**: All content scoped to teams via RLS (US6)
- **MVP First**: P1 stories (US1, US2) constitute minimal viable product
- **Flowbite First**: Using Flowbite Svelte per constitutional requirement
- **Test-First**: Leveraging existing test infrastructure (spec 001), manual testing acceptable for MVP

**Tests**: Per constitution, manual testing is acceptable for MVP phase. E2E tests will be added incrementally using existing Playwright infrastructure from spec 001.

**Organization**: Tasks grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US8)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure per plan.md

- [ ] T001 Verify environment setup: Bun 1.0+, Node 18+, PostgreSQL 14+, Supabase CLI installed
- [ ] T002 Create `.env` file from template with Supabase credentials (PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
- [ ] T003 Install dependencies with `bun install` including Flowbite Svelte 0.44+, Fuse.js, and Supabase JS SDK 2.x
- [ ] T004 [P] Create directory structure for `src/lib/api/services/`, `src/lib/types/domain/`, `src/lib/stores/`, `src/lib/components/base/`
- [ ] T005 [P] Create directory structure for `src/routes/(auth)/`, `src/routes/login/`, `src/routes/signup/`
- [ ] T006 [P] Configure Tailwind CSS with Flowbite Svelte integration in `tailwind.config.js`
- [ ] T007 [P] Setup ESLint and Prettier per existing project standards
- [ ] T008 Link Supabase project with `bunx supabase link --project-ref <ref>`
- [ ] T009 Create Supabase storage bucket `cosplay-images` with RLS policies (authenticated read/write)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Schema & Migrations

- [ ] T010 Create migration `20250000000000_initial_schema.sql` for users, teams, team_members tables per data-model.md
- [ ] T011 [P] Create migration `20250000000001_ideas_table.sql` for ideas table with RLS policies
- [ ] T012 [P] Create migration `20250000000002_projects_table.sql` for projects table with RLS policies
- [ ] T013 [P] Create migration `20250000000003_resources_table.sql` for polymorphic resources table with JSONB metadata and RLS policies
- [ ] T014 [P] Create migration `20250000000004_tools_table.sql` for polymorphic tools table with RLS policies
- [ ] T015 [P] Create migration `20250000000005_tasks_table.sql` for tasks table (project-level and resource-level) with RLS policies
- [ ] T016 [P] Create migration `20250000000006_photoshoots_table.sql` for photoshoots, shots, crew_members tables with RLS policies
- [ ] T017 [P] Create migration `20250000000007_join_tables.sql` for project_resources and photoshoot_projects join tables with RLS policies
- [ ] T018 [P] Create migration `20250000000008_comments_table.sql` for polymorphic comments table with RLS policies
- [ ] T019 Create migration `20250000000009_utility_functions.sql` for update_updated_at_column() trigger function and calculate_project_progress() function
- [ ] T020 Apply all migrations with `bunx supabase db reset` and verify schema

### Authentication & Team Foundation

- [ ] T021 Initialize Supabase client in `src/lib/api/supabase.ts` with environment variables
- [ ] T022 Create auth store in `src/lib/stores/auth.ts` with Svelte 5 runes for user state and session management
- [ ] T023 Create team store in `src/lib/stores/teams.ts` for current team context and team switching
- [ ] T024 Implement authentication layout in `src/routes/+layout.svelte` with team selector in sidebar
- [ ] T025 Create login page `src/routes/login/+page.svelte` using Flowbite Button and Input components
- [ ] T026 Create signup page `src/routes/signup/+page.svelte` with personal team auto-creation hook
- [ ] T027 Create authenticated layout `src/routes/(auth)/+layout.svelte` with sidebar navigation (Ideas, Projects, Resources, Tools, Photoshoots, Calendar, Teams, Settings)

### Type System & Base Infrastructure

- [ ] T028 [P] Copy TypeScript types from `specs/002-mvp-redesign/contracts/types.ts` to `src/lib/types/domain/` (split by entity)
- [ ] T029 [P] Create domain type files: `idea.ts`, `project.ts`, `resource.ts`, `tool.ts`, `task.ts`, `photoshoot.ts`, `team.ts`, `comment.ts`
- [ ] T030 Create validation schemas in `src/lib/schemas/validation.ts` using Zod for runtime validation
- [ ] T031 [P] Create polymorphic field schemas in `src/lib/schemas/field-schemas.ts` for resource and tool categories
- [ ] T032 Implement fuzzy search utility in `src/lib/utils/search.ts` using Fuse.js with threshold 0.3 for typo tolerance
- [ ] T033 [P] Implement progress calculation utility in `src/lib/utils/progress.ts` with hybrid task/resource algorithm
- [ ] T034 [P] Implement image processing utility in `src/lib/utils/image.ts` using Canvas API for thumbnail (200px), display (2MB), original

### Base UI Components (Flowbite-based)

- [ ] T035 [P] Create InlineTextEditor component in `src/lib/components/base/InlineTextEditor.svelte` with on-blur auto-save, saving indicator, and inline validation
- [ ] T036 [P] Create InlineNumberEditor component in `src/lib/components/base/InlineNumberEditor.svelte` with on-blur auto-save
- [ ] T037 [P] Create InlineSelect component in `src/lib/components/base/InlineSelect.svelte` wrapping Flowbite Select with on-change auto-save
- [ ] T038 [P] Create InlineCheckbox component in `src/lib/components/base/InlineCheckbox.svelte` wrapping Flowbite Checkbox with on-change auto-save
- [ ] T039 [P] Create InlineDatePicker component in `src/lib/components/base/InlineDatePicker.svelte` with on-blur auto-save
- [ ] T040 [P] Create InlineImageUpload component in `src/lib/components/base/InlineImageUpload.svelte` with drag-drop, preview, and 3-variant upload
- [ ] T041 [P] Create PolymorphicForm component in `src/lib/components/base/PolymorphicForm.svelte` with switch-based category field rendering
- [ ] T042 Create DetailPageBase component in `src/lib/components/base/DetailPageBase.svelte` as shared root for all detail pages with edit mode toggle

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Capture and Convert Ideas (Priority: P1) 🎯 MVP

**Goal**: Enable users to capture cosplay inspiration with images, difficulty estimates, and convert ideas to active projects when ready

**Independent Test**: Create idea with images and notes → browse ideas board → filter by difficulty → search with typos → convert idea to project → verify idea marked as converted and project pre-filled

### Implementation for User Story 1

- [ ] T043 [P] [US1] Create ideaService in `src/lib/api/services/ideaService.ts` with list(), get(), create(), update(), delete(), convert() methods
- [ ] T044 [P] [US1] Create ideas store in `src/lib/stores/ideas.ts` with Svelte 5 runes for ideas list, loading state, and CRUD operations
- [ ] T045 [P] [US1] Create IdeaCard component in `src/lib/components/cards/IdeaCard.svelte` with Flowbite Card, image thumbnail, difficulty badge, cost estimate
- [ ] T046 [US1] Create ideas board list page `src/routes/(auth)/ideas/+page.svelte` with grid layout, fuzzy search input, difficulty filter dropdown
- [ ] T047 [US1] Implement fuzzy search for ideas in ideas page using Fuse.js with keys: character, series, tags
- [ ] T048 [US1] Create idea detail page `src/routes/(auth)/ideas/[id]/+page.svelte` extending DetailPageBase with inline editing for all fields
- [ ] T049 [US1] Implement idea conversion in idea detail page with "Start Planning" button that calls ideaService.convert() and navigates to new project
- [ ] T050 [US1] Add image upload to idea detail using InlineImageUpload component with 3-variant processing (thumbnail/display/original)
- [ ] T051 [US1] Implement idea status update (saved → converted) with read-only lock on converted ideas
- [ ] T052 [US1] Add validation for required fields (character, series, difficulty) with inline error display on blur
- [ ] T053 [US1] Create "New Idea" page at `src/routes/(auth)/ideas/new/+page.svelte` reusing detail page in creation mode

**Checkpoint**: User Story 1 complete - ideas can be captured, browsed, searched with fuzzy matching, and converted to projects

---

## Phase 4: User Story 2 - Plan and Track Projects (Priority: P1) 🎯 MVP

**Goal**: Enable users to manage active cosplay projects with resources, tasks, budget tracking, and hybrid progress calculation

**Independent Test**: Create project → add resources with quantities/statuses → create project-level tasks → create resource-specific tasks → verify hybrid progress calculation → track budget → filter by status

### Implementation for User Story 2

- [ ] T054 [P] [US2] Create projectService in `src/lib/api/services/projectService.ts` with list(), get(), create(), update(), delete(), linkResource(), unlinkResource() methods
- [ ] T055 [P] [US2] Create resourceService in `src/lib/api/services/resourceService.ts` with basic list(), get(), create(), update(), delete() methods
- [ ] T056 [P] [US2] Create taskService in `src/lib/api/services/taskService.ts` with list(), get(), create(), update(), delete() methods supporting project-level and resource-level tasks
- [ ] T057 [P] [US2] Create projects store in `src/lib/stores/projects.ts` with Svelte 5 runes and derived stores for filtered views by status
- [ ] T058 [P] [US2] Create resources store in `src/lib/stores/resources.ts` for basic resource management (full implementation in US3)
- [ ] T059 [P] [US2] Create tasks store in `src/lib/stores/tasks.ts` with filtering by projectId and resourceId
- [ ] T060 [P] [US2] Create ProjectCard component in `src/lib/components/cards/ProjectCard.svelte` with Flowbite Card, cover image, status badge, progress bar, budget indicator
- [ ] T061 [P] [US2] Create ProgressTracker component in `src/lib/components/domain/ProgressTracker.svelte` displaying hybrid progress with breakdown (tasks % + resources %)
- [ ] T062 [P] [US2] Create BudgetTracker component in `src/lib/components/domain/BudgetTracker.svelte` with spent/total display and warning state when exceeded
- [ ] T063 [P] [US2] Create TaskList component in `src/lib/components/domain/TaskList.svelte` with inline task creation, checkbox completion, and resource-level task grouping
- [ ] T064 [P] [US2] Create ResourcesList component in `src/lib/components/domain/ResourcesList.svelte` showing linked resources with quantity/status and inline editing
- [ ] T065 [US2] Create projects list page `src/routes/(auth)/projects/+page.svelte` with grid layout, status filter, fuzzy search across character/series/tags
- [ ] T066 [US2] Create project detail page `src/routes/(auth)/projects/[id]/+page.svelte` extending DetailPageBase with Flowbite Tabs (Overview, Resources, Tasks, Gallery)
- [ ] T067 [US2] Implement Overview tab in project detail with inline editing for character, series, status, deadline, budget, description, cover image
- [ ] T068 [US2] Implement Resources tab with ResourcesList component and "Link Existing Resource" + "Create New Resource" buttons
- [ ] T069 [US2] Implement resource linking modal/drawer in Resources tab with quantity and status inputs
- [ ] T070 [US2] Implement Tasks tab with TaskList component showing project-level tasks and expandable resource-specific tasks
- [ ] T071 [US2] Implement task creation in Tasks tab with projectId and optional resourceId for resource-specific tasks
- [ ] T072 [US2] Implement Gallery tab with InlineImageUpload for reference images grid display
- [ ] T073 [US2] Integrate hybrid progress calculation in project detail Overview tab calling calculate_project_progress() PostgreSQL function via Supabase RPC
- [ ] T074 [US2] Implement real-time progress updates using Svelte derived stores when tasks or resource statuses change
- [ ] T075 [US2] Add budget tracking in Overview tab with automatic spent calculation from linked resources' costs
- [ ] T076 [US2] Add budget warning indicator in BudgetTracker when spentBudget >= estimatedBudget
- [ ] T077 [US2] Create "New Project" page at `src/routes/(auth)/projects/new/+page.svelte` reusing detail page in creation mode
- [ ] T078 [US2] Implement project creation from converted idea with pre-filled character, series, description, images (fromIdeaId field)

**Checkpoint**: User Story 2 complete - projects can be managed with resources, tasks (project-level and resource-level), hybrid progress tracking, and budget management

---

## Phase 5: User Story 3 - Build Shared Resource Library (Priority: P2)

**Goal**: Enable users to create reusable resources with polymorphic category-specific fields and link them to multiple projects

**Independent Test**: Create resources in different categories (prop, fabric, wig) → verify category-specific fields appear → link resource to multiple projects with different quantities/statuses → view "Used in Projects" section

### Implementation for User Story 3

- [ ] T079 [P] [US3] Expand resourceService with methods for polymorphic metadata handling and project usage tracking
- [ ] T080 [P] [US3] Create ResourceCard component in `src/lib/components/cards/ResourceCard.svelte` with Flowbite Card, category badge, image, cost, "Used in X projects" indicator
- [ ] T081 [US3] Create resources library page `src/routes/(auth)/resources/+page.svelte` with grid layout, category filter dropdown, fuzzy search across name/tags
- [ ] T082 [US3] Create resource detail page `src/routes/(auth)/resources/[id]/+page.svelte` extending DetailPageBase with PolymorphicForm for category-specific fields
- [ ] T083 [US3] Implement category selector in resource creation/editing with switch statement handling 7 categories (prop, fabric, wig, pattern, costume-piece, accessory, material)
- [ ] T084 [US3] Implement prop category fields: dimensions, weight, material, fragile checkbox, requiresAssembly checkbox, storageLocation
- [ ] T085 [US3] Implement fabric category fields: fabricType, color, quantity number, unit select (yards/meters), width number, stretch checkbox, washable checkbox
- [ ] T086 [US3] Implement wig category fields: color, length, style, needsStyling checkbox, laceType select (none/lace-front/full-lace), heatResistant checkbox
- [ ] T087 [US3] Implement pattern category fields: patternCompany, patternNumber, size, difficulty select, digitalFileUrl, physicalPattern checkbox
- [ ] T088 [US3] Implement costume-piece category fields: pieceType, size, material, color, needsAlterations checkbox
- [ ] T089 [US3] Implement accessory category fields: accessoryType, material, color, quantity number
- [ ] T090 [US3] Implement material category fields: materialType, brand, colorVariant, quantity number, unit text
- [ ] T091 [US3] Add "Used in Projects" section to resource detail page querying project_resources join table
- [ ] T092 [US3] Display per-project quantity and status in "Used in Projects" section with links to project details
- [ ] T093 [US3] Implement resource image upload with InlineImageUpload component supporting multiple images
- [ ] T094 [US3] Create "New Resource" page at `src/routes/(auth)/resources/new/+page.svelte` with category selection first, then category-specific form
- [ ] T095 [US3] Add validation for category-specific required fields (e.g., fabric requires fabricType, color, quantity, unit)

**Checkpoint**: User Story 3 complete - resources can be created with polymorphic fields, reused across projects, and usage tracked

---

## Phase 6: User Story 4 - Manage Tools and Equipment (Priority: P2)

**Goal**: Enable users to track crafting tools and shoot equipment with category-specific metadata

**Independent Test**: Create crafting tool with maintenance info → create shoot equipment with rental info → filter by category → view tool details

### Implementation for User Story 4

- [ ] T096 [P] [US4] Create toolService in `src/lib/api/services/toolService.ts` with list(), get(), create(), update(), delete() methods
- [ ] T097 [P] [US4] Create tools store in `src/lib/stores/tools.ts` with filtering by category
- [ ] T098 [US4] Create tools list page `src/routes/(auth)/tools/+page.svelte` with list layout, category filter (crafting-tool/shoot-equipment), fuzzy search
- [ ] T099 [US4] Create tool detail page `src/routes/(auth)/tools/[id]/+page.svelte` extending DetailPageBase with PolymorphicForm for tool categories
- [ ] T100 [US4] Implement category selector for tools with switch for 2 categories (crafting-tool, shoot-equipment)
- [ ] T101 [US4] Implement crafting-tool fields: brand, model, purchaseDate, purchasePrice, condition select (new/good/fair/needs-repair), storageLocation, manualUrl, warrantyExpires
- [ ] T102 [US4] Implement shoot-equipment fields: brand, model, owned checkbox, rentalCost number, owner text, specifications textarea
- [ ] T103 [US4] Add tool images upload with InlineImageUpload component
- [ ] T104 [US4] Create "New Tool" page at `src/routes/(auth)/tools/new/+page.svelte` with category selection
- [ ] T105 [US4] Add validation for category-specific required fields

**Checkpoint**: User Story 4 complete - tools can be tracked with category-specific maintenance and rental information

---

## Phase 7: User Story 5 - Plan Photoshoots (Priority: P2)

**Goal**: Enable users to plan photoshoots with shot lists, crew management, and project linking

**Independent Test**: Create photoshoot → link projects → add shot list items → add crew members → mark shots complete → upload final photos

### Implementation for User Story 5

- [ ] T106 [P] [US5] Create photoshootService in `src/lib/api/services/photoshootService.ts` with list(), get(), create(), update(), delete(), linkProject(), addShot(), addCrew() methods
- [ ] T107 [P] [US5] Create photoshoots store in `src/lib/stores/photoshoots.ts` with filtering by status
- [ ] T108 [P] [US5] Create PhotoshootCard component in `src/lib/components/cards/PhotoshootCard.svelte` with date, location, linked project previews, status badge
- [ ] T109 [P] [US5] Create ShotListEditor component in `src/lib/components/domain/ShotListEditor.svelte` with checklist items, completion percentage, reference images
- [ ] T110 [US5] Create photoshoots list page `src/routes/(auth)/photoshoots/+page.svelte` with list layout, status filter, date sorting
- [ ] T111 [US5] Create photoshoot detail page `src/routes/(auth)/photoshoots/[id]/+page.svelte` extending DetailPageBase with Flowbite Tabs (Overview, Shot List, Crew, Gallery)
- [ ] T112 [US5] Implement Overview tab with inline editing for title, date, location, description, status, and linked projects selector
- [ ] T113 [US5] Implement project linking in Overview tab with multi-select from user's projects
- [ ] T114 [US5] Implement Shot List tab with ShotListEditor component for adding/editing/completing shots
- [ ] T115 [US5] Add shot creation in Shot List tab with description, pose notes, reference image upload, completion checkbox
- [ ] T116 [US5] Implement shot completion tracking with visual indicators and percentage calculation
- [ ] T117 [US5] Implement Crew tab with list of crew members and inline creation (name, role select, contact)
- [ ] T118 [US5] Add crew member roles: photographer, assistant, makeup, other
- [ ] T119 [US5] Implement Gallery tab with InlineImageUpload for final photos and option to link photos to specific shots
- [ ] T120 [US5] Create "New Photoshoot" page at `src/routes/(auth)/photoshoots/new/+page.svelte`
- [ ] T121 [US5] Add photoshoot status workflow: planning → scheduled → completed

**Checkpoint**: User Story 5 complete - photoshoots can be planned with shot lists, crew, and completion tracking

---

## Phase 8: User Story 6 - Collaborate with Team (Priority: P2)

**Goal**: Enable team creation, member invitations, role-based permissions (Owner/Editor/Viewer), and commenting

**Independent Test**: Create team → invite members with different roles → switch team context → verify content filtered by team → assign tasks to members → add comments as Viewer

### Implementation for User Story 6

- [ ] T122 [P] [US6] Expand teamService in `src/lib/api/services/teamService.ts` with create(), invite(), acceptInvite(), updateMemberRole(), removeMember() methods
- [ ] T123 [P] [US6] Create commentService in `src/lib/api/services/commentService.ts` for polymorphic comments on ideas/projects/resources/tools/photoshoots
- [ ] T124 [P] [US6] Create comments store in `src/lib/stores/comments.ts` with filtering by entityType and entityId
- [ ] T125 [US6] Expand team store to track current user's role in selected team (owner/editor/viewer)
- [ ] T126 [US6] Create permissions utility in `src/lib/utils/permissions.ts` with can(role, action) function implementing Owner/Editor/Viewer rules
- [ ] T127 [US6] Create team selector component in sidebar (part of auth layout) with dropdown for switching teams
- [ ] T128 [US6] Implement team context switching that updates all stores to filter by teamId
- [ ] T129 [US6] Create teams management page `src/routes/(auth)/teams/+page.svelte` with team list, member management, invite form
- [ ] T130 [US6] Implement team creation in teams page with automatic Owner role assignment
- [ ] T131 [US6] Implement member invitation with email input and role selector (editor/viewer only, not owner)
- [ ] T132 [US6] Create invitation acceptance flow (email notification handled by Supabase, acceptance updates status to active)
- [ ] T133 [US6] Implement member role management with Owner-only access (updateMemberRole, removeMember)
- [ ] T134 [US6] Add role-based UI visibility using permissions utility (hide edit/delete buttons for Viewers)
- [ ] T135 [US6] Implement task assignment feature in TaskList component with team member selector
- [ ] T136 [US6] Add task assignment notifications (simple Supabase realtime or email)
- [ ] T137 [US6] Create CommentBox component in `src/lib/components/base/CommentBox.svelte` with textarea and submit button
- [ ] T138 [US6] Add CommentBox to all detail pages (ideas, projects, resources, tools, photoshoots) at bottom
- [ ] T139 [US6] Implement comment creation accessible to all roles (Owner, Editor, Viewer)
- [ ] T140 [US6] Display comment list with author name, avatar, timestamp, and own-comment edit/delete
- [ ] T141 [US6] Add personal team auto-creation on user signup (triggered in signup page)
- [ ] T142 [US6] Verify RLS policies enforce team-based access across all tables

**Checkpoint**: User Story 6 complete - teams can be created, members invited with role-based permissions, and collaboration enabled via comments and task assignment

---

## Phase 9: User Story 7 - Track Timeline and Deadlines (Priority: P3)

**Goal**: Enable calendar/timeline view of projects and photoshoots with deadline tracking

**Independent Test**: View calendar → see projects with deadlines → see photoshoots on dates → click item for preview → switch between month/week/day views

### Implementation for User Story 7

- [ ] T143 [P] [US7] Install calendar library (e.g., FullCalendar or @event-calendar/core for Svelte)
- [ ] T144 [US7] Create calendar page `src/routes/(auth)/calendar/+page.svelte` with calendar component
- [ ] T145 [US7] Implement project data integration: map projects with deadlines to calendar events
- [ ] T146 [US7] Implement photoshoot data integration: map photoshoots with dates to calendar events
- [ ] T147 [US7] Add task deadlines to calendar as smaller indicators
- [ ] T148 [US7] Implement calendar view switching (month/week/day) with Flowbite Button group
- [ ] T149 [US7] Add event click handler showing quick preview modal with project/photoshoot summary
- [ ] T150 [US7] Add "Open Full Page" link in preview modal navigating to detail page
- [ ] T151 [US7] Style calendar events with color coding by status (planning/in-progress/completed)

**Checkpoint**: User Story 7 complete - calendar provides timeline view of all deadlines and events

---

## Phase 10: User Story 8 - Personalize Settings (Priority: P3)

**Goal**: Enable profile customization, theme toggling, and notification preferences

**Independent Test**: Update profile (name, avatar, bio) → toggle dark mode → adjust notification preferences → verify persistence

### Implementation for User Story 8

- [ ] T152 [P] [US8] Create userService in `src/lib/api/services/userService.ts` with getProfile(), updateProfile() methods
- [ ] T153 [P] [US8] Create settings store in `src/lib/stores/settings.ts` for theme and notification preferences
- [ ] T154 [US8] Create settings page `src/routes/(auth)/settings/+page.svelte` with Flowbite Tabs (Profile, Preferences, Account)
- [ ] T155 [US8] Implement Profile tab with InlineTextEditor for name, bio, and InlineImageUpload for avatar
- [ ] T156 [US8] Implement Preferences tab with theme toggle (light/dark) using Flowbite Toggle component
- [ ] T157 [US8] Add theme persistence in localStorage and apply theme class to document root
- [ ] T158 [US8] Add notification preferences toggles (email notifications, in-app notifications)
- [ ] T159 [US8] Implement Account tab with email display (read-only from Supabase auth) and password change link
- [ ] T160 [US8] Add profile picture display in sidebar showing current user avatar

**Checkpoint**: User Story 8 complete - users can personalize profile, theme, and notification settings

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple user stories and final touches

- [ ] T161 [P] Add loading spinners to all list pages using Flowbite Spinner component
- [ ] T162 [P] Add empty states to all list pages with helpful messages and "Create New" CTAs
- [ ] T163 [P] Implement error boundaries for graceful error handling across all routes
- [ ] T164 [P] Add toast notifications for success/error feedback using Flowbite Toast component
- [ ] T165 [P] Optimize image loading with lazy loading for grid views
- [ ] T166 Add keyboard shortcuts for common actions (e.g., Ctrl+K for search)
- [ ] T167 [P] Add breadcrumb navigation to detail pages showing hierarchy
- [ ] T168 Implement search result highlighting for fuzzy matches
- [ ] T169 [P] Add pagination to all list views with configurable items per page
- [ ] T170 Add sorting options to list views (newest first, alphabetical, deadline)
- [ ] T171 [P] Create 404 page for non-existent entities
- [ ] T172 [P] Create error page for server errors
- [ ] T173 Implement optimistic UI updates for faster perceived performance
- [ ] T174 Add confirmation dialogs for destructive actions (delete project, remove team member) using Flowbite Modal
- [ ] T175 Implement edge case handling: resource deletion warning for multi-project usage
- [ ] T176 Implement edge case handling: project deletion warning for photoshoot linkage
- [ ] T177 Implement edge case handling: last owner prevention (cannot leave team)
- [ ] T178 Implement edge case handling: concurrent edit conflict detection with last-write-wins
- [ ] T179 Add comprehensive form validation with Zod schemas across all forms
- [ ] T180 Implement image size validation (max 10MB) with user-friendly error messages
- [ ] T181 Add network connectivity loss handling with offline indicators
- [ ] T182 [P] Add accessibility improvements: ARIA labels, keyboard navigation, focus management
- [ ] T183 [P] Audit and customize Flowbite Svelte components to match React design aesthetic from `cosplay-tracker-react/`
- [ ] T184 [P] Add helpful documentation links to settings page and first-time onboarding tooltips
- [ ] T185 Run comprehensive manual testing per quickstart.md validation checklist
- [ ] T186 Review constitution compliance for all implemented features (Project-Centric, Team-Based, MVP First, Flowbite First)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-10)**: All depend on Foundational phase completion
  - P1 stories (US1, US2) are MVP - complete before P2/P3 stories
  - P2 stories (US3, US4, US5, US6) can proceed in parallel after MVP validation
  - P3 stories (US7, US8) can proceed in parallel after P2 stories
- **Polish (Phase 11)**: Depends on all desired user stories being complete

### User Story Dependencies

**MVP (Must Complete First)**:
- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - Minimal dependency on US1 (idea conversion feature links to projects)

**Post-MVP (Incremental)**:
- **User Story 3 (P2)**: Can start after Foundational - US2 already creates basic resource linking, US3 expands with full library and polymorphic fields
- **User Story 4 (P2)**: Can start after Foundational - Fully independent of other stories
- **User Story 5 (P2)**: Can start after Foundational - Minimal dependency on US2 (links to projects)
- **User Story 6 (P2)**: Can start after Foundational - Enhances all previous stories with team collaboration (requires personal team creation in signup)
- **User Story 7 (P3)**: Depends on US2 (projects) and US5 (photoshoots) for calendar events
- **User Story 8 (P3)**: Fully independent - can start after Foundational

### Within Each User Story

1. Services before stores
2. Stores before UI components
3. Base components before domain components
4. Domain components before pages
5. List pages before detail pages
6. Core functionality before edge cases

### Parallel Opportunities

**Phase 1 (Setup)**: T004, T005, T006, T007 can run in parallel
**Phase 2 (Foundational)**: 
- Migrations T011-T018 can run in parallel (after T010)
- Type files T029 can run in parallel (after T028)
- Base components T035-T042 can run in parallel

**Phase 3 (US1)**: T043, T044, T045 can run in parallel

**Phase 4 (US2)**: T054-T064 can run in parallel (services, stores, components)

**Phase 5 (US3)**: T079, T080 can run in parallel

**Phase 6 (US4)**: T096, T097 can run in parallel

**Phase 7 (US5)**: T106-T109 can run in parallel

**Phase 8 (US6)**: T122, T123, T124 can run in parallel

**Phase 9 (US7)**: T143 independent

**Phase 10 (US8)**: T152, T153 can run in parallel

**Phase 11 (Polish)**: Many tasks marked [P] can run in parallel

**Cross-Story Parallelization**: After Foundational (Phase 2), multiple user stories can be developed in parallel by different team members.

---

## Parallel Example: User Story 1 (Ideas)

```bash
# After Foundational phase completes, launch US1 in parallel:
Task T043: "Create ideaService in src/lib/api/services/ideaService.ts"
Task T044: "Create ideas store in src/lib/stores/ideas.ts"
Task T045: "Create IdeaCard component in src/lib/components/cards/IdeaCard.svelte"

# Then sequentially:
Task T046: "Create ideas board list page" (depends on T043, T044, T045)
Task T047: "Implement fuzzy search for ideas" (depends on T046)
# ... etc
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (T001-T009)
2. Complete Phase 2: Foundational (T010-T042) - CRITICAL blocking phase
3. Complete Phase 3: User Story 1 - Ideas (T043-T053)
4. **STOP and VALIDATE**: Test US1 independently (capture ideas, search with typos, convert to project)
5. Complete Phase 4: User Story 2 - Projects (T054-T078)
6. **STOP and VALIDATE**: Test US2 independently (create project, link resources, track tasks/budget/progress)
7. **MVP COMPLETE**: Deploy and gather user feedback on core idea-to-project workflow

**MVP Deliverables**:
- ✅ Capture and manage cosplay ideas with images and difficulty estimates
- ✅ Convert ideas to projects seamlessly
- ✅ Track project progress with hybrid task/resource calculation
- ✅ Manage resources with basic linking (full polymorphic library in US3)
- ✅ Budget tracking with overspend warnings
- ✅ Fuzzy search with typo tolerance
- ✅ Single-user personal team (multi-team in US6)

### Incremental Delivery (Post-MVP)

1. Add User Story 3: Resource Library (T079-T095) → Polymorphic resource management
2. Add User Story 4: Tools Management (T096-T105) → Equipment tracking
3. Add User Story 5: Photoshoots (T106-T121) → Complete workflow: idea → project → shoot
4. Add User Story 6: Team Collaboration (T122-T142) → Multi-user projects and permissions
5. Add User Story 7: Calendar (T143-T151) → Timeline visualization
6. Add User Story 8: Settings (T152-T160) → Personalization
7. Complete Phase 11: Polish (T161-T186) → Final touches and edge cases

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (Phases 1-2)
2. Once Foundational is done:
   - Developer A: User Story 1 (Ideas)
   - Developer B: User Story 2 (Projects - can start basic project CRUD in parallel, add resource linking after US1 completes idea conversion)
3. After MVP validation:
   - Developer A: User Story 3 (Resources) + User Story 4 (Tools)
   - Developer B: User Story 5 (Photoshoots)
   - Developer C: User Story 6 (Teams)
4. Stories complete and integrate independently

---

## Constitutional Compliance Checklist

**Verified Throughout Tasks**:

- ✅ **Project-Centric**: US1-US5 all associable with projects (ideas convert to projects, resources/tools/photoshoots link to projects)
- ✅ **Team-Based**: All content scoped to teams via RLS (T010-T018 migrations, US6 team collaboration)
- ✅ **MVP First**: P1 stories (US1-US2) clearly marked as MVP, P2/P3 incremental
- ✅ **Test-First**: Leveraging existing Playwright/Vitest infrastructure (spec 001), manual testing for MVP per constitution
- ✅ **Modular**: Features organized by domain (Ideas, Projects, Resources, Tools, Photoshoots, Teams, Calendar, Settings)
- ✅ **Cost-Conscious**: Using free-tier Supabase, no paid services introduced
- ✅ **Flowbite First**: All UI components use Flowbite Svelte (T006, T035-T042 base components)
- ✅ **Future-Ready**: Polymorphic entities (resources, tools) support expansion without schema changes
- ✅ **Data Privacy**: RLS policies on all tables (T010-T018), team-based access control (US6)
- ✅ **Tech Stack**: SvelteKit 2.x, Svelte 5 (runes), Flowbite Svelte, Supabase, Bun (T001-T009)

**No Constitutional Violations Found** ✅

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label (US1-US8) maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Manual testing is acceptable for MVP per constitution (automated tests can be added incrementally)
- Commit after each task or logical group for rollback safety
- Stop at any checkpoint to validate story independently before proceeding
- All paths use absolute references per plan.md structure
- Flowbite Svelte components used throughout per constitutional requirement
- Image processing uses 3 variants (thumbnail 200px, display 2MB, original) per research.md
- Fuzzy search uses Fuse.js with threshold 0.3 for typo tolerance per clarifications
- Progress calculation uses hybrid approach (tasks + resource status + resource tasks) per FR-008
- On-blur auto-save pattern used throughout per clarifications (US1 acceptance scenario 4)

**Total Tasks**: 186
- Setup: 9 tasks
- Foundational: 33 tasks
- User Story 1 (P1 MVP): 11 tasks
- User Story 2 (P1 MVP): 25 tasks
- User Story 3 (P2): 17 tasks
- User Story 4 (P2): 10 tasks
- User Story 5 (P2): 16 tasks
- User Story 6 (P2): 21 tasks
- User Story 7 (P3): 9 tasks
- User Story 8 (P3): 9 tasks
- Polish: 26 tasks

**MVP Scope**: 78 tasks (Setup + Foundational + US1 + US2)
**Full Implementation**: 186 tasks

**Suggested Start**: Complete MVP first (Phases 1-4, tasks T001-T078), validate with users, then incrementally add P2 and P3 features based on feedback.


