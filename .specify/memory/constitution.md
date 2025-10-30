<!--
Sync Impact Report:
Version: 1.2.0 (Feature scope & privacy amendment)
Modified Principles:
  - III. Complete Workflow Coverage → Expanded with comprehensive feature scope matrix
Added Sections:
  - Feature Scope Matrix (comprehensive MVP → Future roadmap)
  - Resource Architecture (detailed sub-resource model)
  - Data Privacy & User Rights (new principle)
  - Social Media Integration (detailed specification)
  - Cross-Cutting Concerns (tagging, search, notifications, image management)
Clarified Features:
  - Tutorials, Patterns, Notes (post-MVP specifications)
  - Post-Production workflow (MVP: photo tracking + social media)
  - Archive functionality (MVP: read-only + search, Post-MVP: portfolio)
  - Conventions (MVP: full feature set)
  - Meetups (Post-MVP: full feature set)
  - Crew management (MVP: tracking, Post-MVP: marketplace integration)
  - Resource sub-categories (separate DB tables, MVP)
  - Image management (comprehensive MVP spec)
  - Onboarding (MVP: account setup, Post-MVP: tutorials)
  - Notifications (MVP: simple, Post-MVP: enhanced)
  - Real-time collaboration (Post-MVP)
  - Data export & integrations (Post-MVP)
Removed Sections: N/A
Templates Status:
  ✅ plan-template.md - Constitution Check includes feature scope validation
  ✅ spec-template.md - Feature scope matrix guides prioritization
  ✅ tasks-template.md - Phase alignment with feature matrix
Follow-up TODOs: None
-->

# Cosplay Tracker Constitution

## Core Principles

### I. Project-Centric Planning (NON-NEGOTIABLE)

Projects are the central organizing principle for **planning-related features**. Features directly related to creating and executing cosplay work MUST be associable with a project:

**Project-Scoped Features**:
- Project creation and management
- Tasks and timelines
- Budget tracking
- Event planning (conventions, photoshoots, meetups)
- Resource management (props, materials, outfits)
- Characters, moodboards, references tied to projects

**User/Team-Scoped Features** (exempt from project requirement):
- Authentication and user settings
- Team management and membership
- Marketplace profiles and services
- General messaging (team chat)
- Personal resource libraries (can be linked to projects when used)

A project represents the complete lifecycle: idea → planning → creation → event → post-production → archive.

**Rationale**: Projects provide the throughline that connects planning features into a cohesive workflow. Non-planning features (auth, profiles, teams) naturally exist at user/team scope.

### II. Team-Based Architecture (NON-NEGOTIABLE)

Every project MUST be associated with a team. Users collaborate through team membership. Teams define access boundaries and enable future permission systems.

**Team Types**:
- **Personal Team**: Single-user team (user is sole member) - default for individual cosplayers
- **Private Team**: Invite-only multi-user team - for closed collaboration groups
- **Public Team** (future): Open or request-to-join teams - requires team management UI (post-MVP)

**Architecture Rules**:
- Projects belong to teams, not directly to users
- Users access projects through team membership
- Team ownership determines project permissions
- Personal teams created automatically on user registration

**Data Model**:
```
User → TeamMember → Team → Project
```

**Rationale**: Team-based architecture from the start prevents painful migration later. Personal teams (single user) provide identical UX to "my projects" while enabling seamless collaboration when users add team members.

### III. Complete Workflow Coverage

The application MUST support the entire cosplay lifecycle without gaps:
- **Ideation & Planning**: Gathering references, moodboards, initial concepts
- **Active Creation**: Task management, budget tracking, resource organization
- **Event Execution**: Convention planning, photoshoot coordination, crew management
- **Post-Production**: Photo editing tracking, social media planning and scheduling
- **Archival**: Completed project reference and portfolio showcasing

**Implementation Phases**: See **Feature Scope Matrix** section for comprehensive feature breakdown by phase (MVP Core, Post-MVP Phase 2, Post-MVP Phase 3, Future).

**MVP Delivers Complete Workflow** (basic functionality for all phases):
- Projects: Full lifecycle from idea to archive
- Resources: All character and photography resources (separate DB tables for each type)
- Events: Conventions (full feature set) and photoshoots
- Tracking: Tasks, timelines, budgets, calendar
- Post-Production: Photo editing tracking + social media scheduling (multi-platform)
- Archive: Read-only storage with search and reactivation

**Post-MVP Enhances Workflow** (social and monetization):
- AI features (pose generation, planning assistance, set design)
- Social features (messaging, tutorials, patterns, notes)
- Portfolio conversion (public project showcases)
- Meetups and community features

**Rationale**: MVP delivers complete workflow coverage with basic features for each phase, enabling users to manage entire cosplay projects without external tools. Social and advanced collaboration features come after core workflow validation. See Feature Scope Matrix for detailed breakdown of 100+ features across all phases.

### IV. MVP First, Test-Driven Development (NON-NEGOTIABLE)

Features MUST be developed as simple, functional MVPs before adding complexity. Every new capability should:
- Deliver immediate user value in its simplest form
- Be independently testable and deployable
- Avoid premature optimization or feature creep
- Support future enhancement without requiring rewrites

**Test-First Approach**:
- Write tests BEFORE implementation to define expected behavior
- Tests validate correctness and prevent regressions
- Prioritize E2E tests for critical user journeys (authentication, project creation, task management)
- Use TypeScript strict mode as first line of defense
- Focus on functional tests over unit tests (test behavior, not implementation)

**Rationale**: The marketplace, booking system, and advanced photography features are future additions. Building complex infrastructure prematurely risks never launching. Ship basic functionality first, validate with users, then iterate. Test-first ensures features work correctly and prevents breaking changes during rapid iteration.

### V. Modular Feature Organization

Features MUST be organized into clear domains with minimal coupling:
- **Main**: Dashboard, Planning, Projects, Post-Production, Archive
- **Tracking**: Calendar, Timeline, Tasks, Budget, Notes  
- **Social**: Marketplace, Profile, Messages, Tutorials, Patterns
- **Events**: Photoshoots, Conventions, Meetups
- **Resources**: Gallery, Characters, Moodboards (+ sub-categories)

Each domain should be developable, testable, and deployable independently where possible.

**Rationale**: Clear boundaries reduce cognitive load, enable parallel development, and allow feature flagging for gradual rollout.

### VI. Cost-Conscious Infrastructure & Monetization

Infrastructure decisions MUST prioritize cost efficiency that scales with user growth:

**Free Tier Strategy** (0-100 users):
- Cloudflare Pages/Workers (1M requests/month free)
- Cloudflare R2 (10GB storage free)
- Supabase (500MB DB, 2GB bandwidth, 50K monthly active users free)
- Minimize external paid services

**Scaling Thresholds**:
- Stay on free tiers until limits reached
- Paid upgrades justified by user growth, not speculation
- Calculate ROI: Cost < (User Count × $X monthly value)
- Monitor usage approaching limits, plan upgrades proactively

**Monetization Requirements**:
- Premium features MUST be implemented early (target: alongside MVP)
- Revenue model: Freemium with AI features as primary premium offering
- Free tier limits: Basic functionality + minimal AI usage
- Premium tier: Enhanced AI features, higher usage limits, advanced analytics

**Cost Approval**:
- Free services: No approval needed
- < $20/month: Document justification in commit
- $20-$50/month: Requires constitutional note
- > $50/month: Requires amendment and user growth validation

**Rationale**: Zero users = zero cost. Scale infrastructure spend with proven user growth. Build monetization early to offset costs as userbase grows.

### VII. Future-Ready Design with Data Abstraction

While implementing MVP features, architecture MUST accommodate planned future capabilities without requiring major refactoring:
- **Marketplace**: User services, roles (photographer, prop maker, seamstress), bookings
- **Public Portfolios**: Showcase projects, book services, manage clients
- **Image Delivery**: Pixieset-like client galleries, watermarking, downloads
- **Team Collaboration**: Multi-user projects, permissions, messaging
- **AI Features**: Pose generation, set design ideas, planning assistance (premium tier)

**Data Abstraction Strategy**:

Create interface layers that decouple frontend from backend implementation:

```typescript
// ✅ DO: Abstract data access through interfaces
interface ProjectService {
  getProject(id: string): Promise<Project>
  createProject(data: CreateProjectInput): Promise<Project>
  updateProject(id: string, data: UpdateProjectInput): Promise<Project>
}

// Implementation can change without affecting components
class SupabaseProjectService implements ProjectService {
  // Supabase-specific implementation
  // Can be swapped or modified without touching frontend
}
```

**Concrete Guidelines**:

✅ **DO: Over-provision data models for known future features**
- Add nullable fields for upcoming features (e.g., `project.client_id`, `user.marketplace_verified`)
- Design permission system with future roles in mind (owner, admin, member, viewer)
- Include status/type enums with future states (e.g., `team_type: 'personal' | 'private' | 'public'`)

✅ **DO: Create abstraction layers**
- API services layer between components and Supabase
- Data transformation functions (API → UI format)
- Type interfaces separate from implementation

✅ **DO: Use feature flags for unreleased capabilities**
- Database columns exist but features are gated
- Easy to enable without migration

❌ **DON'T: Build infrastructure for non-MVP features**
- Don't create booking system tables/logic yet
- Don't build image watermarking pipeline yet
- Don't implement complex permission checking yet

❌ **DON'T: Create premature abstractions**
- No complex caching layers before needed
- No elaborate service architecture before 2nd backend integration
- No over-engineered state management for simple needs

**Rationale**: Data model changes are expensive (migrations, data transformations). API/interface changes are cheap (update translation layer). Abstract the right things: protect against backend changes, but don't over-engineer business logic before validating it with users.

### VIII. AI Features & Premium Monetization (NON-NEGOTIABLE)

AI capabilities are the PRIMARY premium offering and MUST be implemented alongside or shortly after MVP core features to enable early monetization.

**AI Feature Categories**:

1. **Pose Generation** (Premium)
   - Generate pose suggestions for character types and moods
   - Reference image generation for photoshoot planning
   
2. **Set Design Ideas** (Premium)
   - Generate set decoration suggestions based on character/theme
   - Mood-based environment recommendations
   
3. **Planning Assistance** (Premium)
   - Project timeline suggestions based on scope
   - Task breakdown assistance
   - Budget estimation guidance
   
4. **Idea Phase Support** (Premium)
   - Character concept refinement
   - Moodboard generation from descriptions
   - Reference gathering assistance

**Tier Structure**:

**Free Tier**:
- Core cosplay management features (projects, tasks, resources, events)
- Limited AI usage: 10 AI requests per month
- Basic functionality for all workflow phases

**Premium Tier** ($X/month - TBD based on AI costs):
- Unlimited core features
- Enhanced AI usage: 500 AI requests per month
- Priority processing
- Advanced analytics and insights
- Early access to new features

**Technical Implementation**:

```typescript
// AI service abstraction
interface AIService {
  generatePoses(params: PoseGenerationParams): Promise<PoseResult[]>
  generateSetIdeas(params: SetDesignParams): Promise<SetIdeaResult[]>
  assistPlanning(params: PlanningParams): Promise<PlanningAssistance>
  checkUsageLimit(userId: string): Promise<UsageLimitStatus>
}

// Usage tracking
type UsageLimitStatus = {
  tier: 'free' | 'premium'
  usedThisMonth: number
  limitThisMonth: number
  resetsAt: Date
}
```

**Implementation Priority**:
1. **Phase 1** (MVP Core): Complete workflow features without AI
2. **Phase 2** (Monetization - IMMEDIATE after MVP): Implement AI features + subscription system
3. **Phase 3** (Growth): Expand AI capabilities based on user feedback

**AI Provider Strategy**:
- Start with OpenAI API or Anthropic Claude (most cost-effective for text generation)
- Monitor per-request costs and adjust tier limits accordingly
- Consider using Cloudflare AI Workers for image generation (cost savings)

**Cost Management**:
- Free tier limits prevent abuse while allowing trial
- Premium pricing MUST cover AI costs + infrastructure + margin
- Target: AI features cover their own costs at 50+ premium users

**Rationale**: AI features provide clear differentiation and justify premium pricing. Early implementation enables revenue generation as user base grows, offsetting infrastructure costs. AI assistance for ideation and planning is high-value for cosplayers and justifies subscription cost.

### IX. Data Privacy & User Rights (NON-NEGOTIABLE)

User data ownership and privacy MUST be protected at all levels of the application. Users have absolute rights over their data.

**Core Privacy Principles**:
- **User Data Ownership**: Users own all their data (projects, images, notes, posts)
- **Data Control**: Users can export, delete, or modify their data at any time
- **Privacy Levels**: Clear public/private/team-only visibility controls
- **GDPR Compliance**: Design for GDPR compliance from the start
- **Transparent Terms**: Clear, readable terms of service and privacy policy
- **No Data Mining**: User data not sold or shared without explicit consent
- **Secure Storage**: Encryption at rest and in transit

**Privacy Implementation**:

```typescript
// Privacy levels for entities
type PrivacyLevel = 'private' | 'team' | 'public'

interface PrivacySettings {
  project: PrivacyLevel        // Who can view this project
  portfolio: PrivacyLevel      // Public portfolio visibility
  profile: PrivacyLevel        // Profile visibility on marketplace
  activityLog: PrivacyLevel    // Activity feed visibility
}
```

**Data Deletion Policy**:
- **Soft Delete**: 30-day grace period for recovery
- **Hard Delete**: Permanent deletion after grace period or on user request
- **Cascade Rules**: Deleting team deletes associated projects (with warning)
- **Export Before Delete**: Mandatory data export offer before account deletion

**Security Requirements**:
- Supabase Row Level Security (RLS) for all tables
- Team membership validated on all project queries
- Image access control through signed URLs
- API rate limiting to prevent abuse
- Session management with secure tokens

**Compliance Checklist**:
- [ ] Privacy policy drafted and accessible
- [ ] Cookie consent (if using cookies)
- [ ] Data processing agreement (if EU users)
- [ ] User data export functionality
- [ ] User data deletion functionality
- [ ] Security audit before public launch

**Rationale**: Privacy violations can destroy user trust and create legal liability. Building privacy-first from the start is easier than retrofitting. Supabase RLS provides row-level security at database level, ensuring data isolation between teams.

## Feature Scope Matrix

This section provides comprehensive feature classification to eliminate ambiguity about implementation phases. Features are organized by implementation priority and business value.

### MVP Core (Required for Launch)

**Must complete before initial user testing. These features enable the complete cosplay lifecycle.**

#### Main Domain
- ✅ **Dashboard**: Overview of all projects, tasks, upcoming events, budget summary
- ✅ **Planning**: Idea gathering, reference collection, initial project conceptualization
- ✅ **Projects**: Full CRUD (Create, Read, Update, Delete) project management
  - Project lifecycle tracking (idea → planning → active → post-production → archive)
  - Project status indicators
  - Project team assignment
- ✅ **Post-Production**: 
  - Photo editing tracking (which photos need editing, editing status)
  - Social media post planning and scheduling
  - Multi-platform posting (Instagram, Twitter/X, TikTok)
  - Post drafting with image selection
  - Hashtag suggestions
  - Preset post templates for reuse
  - Calendar view of scheduled posts
- ✅ **Archive**:
  - Read-only storage of completed projects
  - Archive search and filtering
  - Reactivate to active state (becomes editable)

#### Tracking Domain
- ✅ **Calendar**: Upcoming events, task deadlines, project deadlines, scheduled posts
- ✅ **Timeline**: Gantt chart or linear view of deadlines and events
- ✅ **Tasks**: 
  - Create, assign, complete tasks
  - Link tasks to projects
  - Task deadlines and priorities
  - Task status tracking
- ✅ **Budget**:
  - Income and expense tracking
  - Per-project budgets
  - Receipt tracking
  - Budget alerts (approaching limits)
  - Convention spending budgets

#### Events Domain
- ✅ **Conventions**:
  - Convention discovery (browseable database)
  - Convention planning (which cons to attend)
  - Convention schedule management (panels, photoshoots, meetups)
  - Packing lists
  - Convention budgets (artist alley spending)
  - Receipt tracking (convention expenses)
  - Reminders (registration deadlines, hotel booking)
  - Link projects to conventions (which cosplay for which day)
- ✅ **Photoshoots**:
  - Photoshoot planning and organization
  - Link projects (which cosplays for shoot)
  - Crew assignment (photographer, MUA, assistants)
  - Location assignment
  - Equipment checklist
  - Shot list creation
  - Pose references
  - Set decoration planning

#### Resources Domain
- ✅ **Photo Gallery**: 
  - Reference images for characters, locations, poses
  - Image upload with optimization (auto-resize, compression)
  - Image organization (albums, collections)
  - Image metadata (descriptions, tags)
  - Image permissions (private, team, public)
  - Select images for social media posts
- ✅ **Characters**: 
  - Character database with details
  - Character difficulty levels
  - Link characters to projects
  - Character reference images
- ✅ **Moodboards**:
  - Visual planning boards
  - Image collections
  - Link to projects for planning

#### Resource Sub-Categories (Separate DB Tables)

**Character Resources:**
- ✅ **Outfits**: Complete costume tracking, materials needed, creation status
- ✅ **Accessories & Makeup**: Wearable items, cosmetics, aesthetic items (backpacks)
- ✅ **Props**: Character-specific items (swords, shields), creation tracking
- ✅ **Materials**: Raw materials (fabric, foam, thread), quantity tracking, costs
- ✅ **Tools**: Creation tools (sewing machines, hot glue guns), availability, maintenance

**Photography Resources:**
- ✅ **Equipment**: Cameras, lights, stands, availability tracking
- ✅ **Crew**: 
  - Crew member database (photographers, MUAs, videographers, audio engineers, assistants)
  - Contact information
  - Payment/compensation tracking
  - Reviews and ratings
  - Notes per crew member
  - Role assignment per photoshoot
  - Role history tracking
- ✅ **Locations**: Shoot locations (indoor, outdoor, studios), address, notes, images
- ✅ **Poses**: Pose reference library
- ✅ **Shots**: Shot idea collection, reel ideas, reference images
- ✅ **Sets**: Set decoration items (backdrops, furniture, props for set dressing)

#### Cross-Cutting Features (MVP)
- ✅ **Authentication**: Signup, login, logout, password reset (Supabase Auth)
- ✅ **Teams**: Personal teams (auto-created), private teams (invite-only)
- ✅ **Settings**: User preferences, account management
- ✅ **Onboarding**: Account setup wizard, personal team creation
- ✅ **Notifications (Simple)**:
  - Task deadline reminders
  - Event reminders (conventions, photoshoots)
  - Budget alerts
  - Email and in-app notifications
- ✅ **Image Management**:
  - Upload flow with drag-and-drop
  - Automatic optimization
  - Cloudflare R2 storage
  - Signed URLs for access control

**Relationships & Data Model (MVP)**:
- Projects belong to teams
- Resources can be linked to multiple projects (many-to-many)
- Outfits require materials and tools
- Characters wear outfits and use props
- Photoshoots connect projects + crew + locations + equipment
- Conventions link to projects (which cosplay for which day)

---

### Post-MVP Phase 2: Monetization & Social (Immediate After MVP)

**Priority: Enable revenue generation and enhanced collaboration.**

#### AI Features (See Principle VIII)
- 🔮 AI pose generation
- 🔮 AI set design ideas
- 🔮 AI planning assistance
- 🔮 AI idea phase support
- 🔮 Subscription system implementation
- 🔮 Usage tracking and limiting

#### Social Features
- 🔮 **Team Messaging**: 
  - Real-time team chat
  - Direct messages
  - Channel-based communication
  - Message threads
- 🔮 **Tutorials**:
  - Written guides and/or videos
  - User-created tutorials (wig making, prop crafting, outfit creation)
  - Tutorial categories and tags
  - Tutorial discovery/search
  - Tutorial ratings and comments
- 🔮 **Patterns**:
  - Sewing pattern upload and storage
  - Digital file downloads (PDF patterns)
  - Pattern discovery and search
  - External API integration (find public patterns)
  - Link patterns to outfits for reference
  - Print-ready pattern files
- 🔮 **Notes**:
  - Team notes (all team types: private, public, temp)
  - WYSIWYG markdown editor
  - Attachment support (files, images)
  - Note categorization and tagging
  - Note search within team

#### Events
- 🔮 **Meetups**:
  - Meetup discovery (find local cosplay meetups)
  - Create and host meetups
  - RSVP system
  - Location sharing
  - Link meetups to projects (which cosplay to wear)

#### Archive Enhancement
- 🔮 **Portfolio Conversion**:
  - Convert archived projects to public portfolio
  - Public portfolio pages
  - Portfolio customization
  - Share links to portfolio

#### Crew Enhancement
- 🔮 **Marketplace Integration**:
  - Crew availability tracking
  - Portfolio links for crew
  - Crew booking through marketplace

#### Notifications Enhancement
- 🔮 Team activity notifications
- 🔮 Collaboration notifications (comments, mentions)
- 🔮 Notification preferences (email vs in-app)
- 🔮 Notification grouping and digests

#### Onboarding Enhancement
- 🔮 Feature tour (interactive walkthrough)
- 🔮 First project creation tutorial
- 🔮 Sample data option

---

### Post-MVP Phase 3: Growth & Enhancement

**Priority: Scale features and improve user experience.**

#### Marketplace & Portfolios
- 🔮 **Marketplace**:
  - Service provider profiles (photographers, prop makers, seamstresses)
  - Service listings
  - Booking system
  - Payment integration
  - Rating and review system
  - Marketplace search and filtering
- 🔮 **Public Portfolios**:
  - Custom domains
  - Portfolio themes
  - Project showcases
  - Contact forms
  - Booking integration
- 🔮 **Client Management**:
  - Client database
  - Booking calendar
  - Invoice generation
  - Payment tracking
- 🔮 **Image Delivery** (Pixieset-like):
  - Client photo galleries
  - Watermarking
  - Download options (full res, web res)
  - Client selection favorites
  - Gallery expiration dates

#### Teams Enhancement
- 🔮 **Public Teams**:
  - Team discovery
  - Request-to-join functionality
  - Team management UI
  - Public team profiles
- 🔮 **Advanced Permissions**:
  - Role-based access control (owner, admin, member, viewer)
  - Granular permissions per resource
  - Permission templates

#### Search & Discovery
- 🔮 **Global Search**:
  - Search across projects, tasks, resources, notes
  - Advanced filtering (status, date, team, tags)
  - Search within tutorials and patterns
  - Convention and meetup search
  - Marketplace provider search
  - Full-text search
  - Search history and saved searches

#### Organization & Productivity
- 🔮 **Tagging System**:
  - Tags for all entities (projects, characters, resources, tutorials)
  - Custom tag creation
  - Tag-based filtering and views
  - Color coding
  - Favorites and bookmarks
  - Tag hierarchies
- 🔮 **Templates**:
  - Project templates (convention prep, photoshoot planning)
  - Task templates (common workflows)
  - Resource templates (standard prop lists)
  - User-created templates
  - Template marketplace (premium)
  - Template sharing within teams

#### Data Management
- 🔮 **Data Export/Import**:
  - Export projects to PDF/JSON
  - Import from spreadsheets
  - Full data backup and download
  - Selective export options
- 🔮 **Integrations**:
  - Calendar sync (Google Calendar, iCal)
  - Google Docs integration (auto-sync project summaries)
  - Manual sync options
  - Sync configuration (what syncs, what doesn't)

#### Analytics
- 🔮 **Project Analytics**:
  - Project completion rates over time
  - Time spent on tasks
  - Budget analysis (over/under budget trends)
  - Team productivity metrics
  - Convention ROI tracking
- 🔮 **Social Media Analytics**:
  - Post performance metrics
  - Engagement tracking
  - Optimal posting times
  - Hashtag effectiveness

#### Collaboration
- 🔮 **Real-Time Collaboration**:
  - Real-time project updates
  - Live task status changes
  - Presence indicators (who's online, who's viewing)
  - Collaborative editing
  - Change history tracking
  - Conflict resolution
  - Activity feed

---

### Future/Long-Term Vision

**Priority: Strategic enhancements and platform expansion.**

- 🔮 **Flutter Mobile Apps**:
  - Native iOS and Android apps
  - Camera integration (quick photo upload)
  - Location services (nearby meetups, conventions)
  - Offline support with sync
  - Push notifications
  - App store presence
- 🔮 **Public API**:
  - RESTful API for third-party integrations
  - API keys and authentication
  - Rate limiting
  - Developer documentation
  - Webhook support
- 🔮 **Third-Party Integrations**:
  - E-commerce platforms (track costume sales)
  - Payment processors (Stripe, PayPal)
  - Social media auto-posting APIs
  - Cloud storage integrations (Google Drive, Dropbox)
- 🔮 **Advanced Features**:
  - Video hosting and streaming (tutorial videos)
  - Live streaming integration (con coverage)
  - Community forums
  - Event ticketing system
  - Sponsor/partner integrations

---

### Feature Dependencies

**Critical Path (must complete in order)**:
1. Authentication → Teams → Projects → Resources
2. Projects → Tasks → Timeline
3. Projects → Budget → Analytics
4. Resources → Photoshoots → Post-Production
5. MVP Core → AI Features → Marketplace

**Parallel Development Opportunities** (can build simultaneously):
- Character resources (outfits, props, materials, tools)
- Photography resources (equipment, crew, locations, poses, shots, sets)
- Events (conventions, photoshoots can be developed in parallel)
- Post-production + Social media scheduling
- Dashboard + Calendar (both consume data from other features)

---

### Scope Validation Rules

When adding features, validate against this matrix:
- **MVP additions**: Require constitutional amendment and strong user research
- **Post-MVP reordering**: Document justification in commit
- **Future → Phase 3**: Requires user demand validation
- **New features not in matrix**: Require constitutional amendment with rationale

## Technical Standards

### Technology Stack (NON-NEGOTIABLE)

- **Framework**: SvelteKit with Svelte 5
- **Runtime**: Bun (development and build)
- **Styling**: Tailwind CSS with Flowbite Svelte components
- **Backend**: Supabase (auth, database, real-time)
- **Deployment**: Cloudflare Pages/Workers
- **Storage**: Cloudflare R2 (images, assets)
- **Language**: TypeScript throughout

**Rationale**: This stack is already established in the codebase. Consistency prevents fragmentation and leverages team expertise.

### Component Standards

- **Flowbite First**: Use Flowbite Svelte components as the foundation; custom components only when Flowbite is insufficient
- **Responsive Design**: Mobile-first approach; all features MUST work on mobile
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation where applicable
- **Performance**: Code splitting by route, lazy loading for images, optimize bundle size

### Data Management

- **Supabase Integration**: Use Supabase client for all data operations
- **Type Safety**: Generate TypeScript types from Supabase schema
- **Real-time**: Leverage Supabase real-time for collaborative features (messages, team updates)
- **Offline**: Design for eventual offline support (future enhancement, not MVP)

### Data Abstraction Layer

**Required Structure** (protects frontend from backend changes):

```
src/lib/
├── api/
│   ├── services/           # Service interfaces & implementations
│   │   ├── projectService.ts
│   │   ├── taskService.ts
│   │   ├── teamService.ts
│   │   └── aiService.ts
│   ├── supabase.ts        # Supabase client initialization
│   └── types.ts           # API-specific types
├── types/
│   ├── domain/            # Domain models (UI-friendly)
│   │   ├── project.ts
│   │   ├── task.ts
│   │   └── team.ts
│   └── api/               # API response types (backend shape)
└── transformers/          # API ↔ Domain transformations
    ├── projectTransformer.ts
    └── taskTransformer.ts
```

**Benefits**:
- Backend endpoint changes don't ripple to components
- Can swap Supabase for another backend without touching UI
- Type safety maintained throughout
- Easy to mock for testing

## Development Workflow

### Feature Development Process

1. **Specification**: Document user stories with priorities (P1/P2/P3) and independent test criteria
2. **Planning**: Identify technical approach, data model changes, API contracts
3. **MVP Scope**: Ruthlessly cut anything not essential to core user value
4. **Implementation**: Build in priority order (P1 first), validate independently
5. **Iteration**: Add enhancements only after MVP validates with users

### Testing Strategy (Test-First Approach)

**Test Development Order**:
1. Write E2E test defining expected behavior
2. Run test (should fail)
3. Implement feature until test passes
4. Refactor with confidence (test prevents regressions)

**Test Coverage Priorities**:

**Phase 1 - Critical User Journeys** (write tests BEFORE implementation):
- ✅ Authentication (signup, login, logout, password reset)
- ✅ Project lifecycle (create, view, update, archive)
- ✅ Task management (create, assign, complete)
- ✅ Team creation and membership
- ✅ Resource management (add props, materials, outfits)

**Phase 2 - Important Workflows** (write tests WITH implementation):
- Event planning (photoshoots, conventions)
- Budget tracking (add expenses, view totals)
- Character and moodboard management
- Calendar and timeline views

**Phase 3 - Enhancement Features** (manual testing acceptable):
- Advanced filters and search
- Analytics and reporting
- UI polish and animations

**Test Types**:
- **E2E Tests** (Playwright): User journeys, critical paths
- **Integration Tests**: Service layer with real Supabase (test DB)
- **Type Safety**: TypeScript strict mode (catches errors at compile time)
- **Manual Testing**: UI/UX validation, edge cases

**Rationale**: Test-first prevents bugs from reaching users and makes refactoring safe. Focus tests on critical user journeys where failures have highest impact. TypeScript catches many errors without runtime tests.

### Navigation Structure & Organization

**Navigation Type**: Flat sidebar navigation (all top-level items visible)

**Documented Structure**:
- **Main**: Dashboard, Planning, Projects, Post-Production, Archive
- **Tracking**: Calendar, Timeline, Tasks, Budget, Notes
- **Social**: Marketplace, Profile, Messages, Tutorials, Patterns
- **Events**: Photoshoots, Conventions, Meetups
- **Resources**: Gallery, Characters, Moodboards (+ subcategories)

**Special Pages** (follow industry standards):
- Authentication: Login, signup, password reset (public routes)
- Settings: User preferences, account management (authenticated route)
- Onboarding: First-time user flow (authenticated route)

**Navigation Change Policy**:

**During MVP Development & Early User Testing** (flexible exploration):
- Navigation changes allowed with justification in commit message
- Document reasoning: user feedback, usability testing, UX research
- Update affected navigation components in same commit
- Track navigation iterations to identify patterns

**After MVP Stabilization** (v1.0+ - stricter process):
- Top-level navigation changes require:
  1. User research/feedback demonstrating need
  2. Constitutional amendment (MINOR version bump)
  3. Coordinated update to all navigation components (sidebar, mobile menu, breadcrumbs)
- Sub-navigation changes (within sections) only need justification in commit

**Rationale**: Early flexibility enables discovering optimal information architecture through user testing. Post-MVP stability prevents navigation churn that confuses existing users. Sidebar navigation keeps all domains accessible without deep nesting.

## Governance

### Constitution Authority

This constitution supersedes all other development practices, guides, and preferences. When conflicts arise:
1. Constitution principles take precedence
2. If principles conflict, NON-NEGOTIABLE principles win
3. Ambiguities should be clarified via amendment

### Amendment Process

**Minor Amendments** (clarifications, wording improvements):
- Update constitution with version PATCH increment
- Document in Sync Impact Report
- No approval required

**Major Amendments** (new principles, removed principles, scope changes):
- Propose amendment with rationale
- Version MAJOR or MINOR increment as appropriate
- Update dependent templates (plan, spec, tasks)
- Commit with clear documentation

### Version Semantics

- **MAJOR**: Backward-incompatible changes (removing principles, changing NON-NEGOTIABLE rules)
- **MINOR**: New principles, sections, or material guidance expansions
- **PATCH**: Clarifications, typo fixes, wording improvements

### Compliance

All specifications, plans, and tasks MUST reference relevant constitutional principles. During code review:
- Verify features align with Project-Centric Architecture
- Validate MVP-first approach (no premature complexity)
- Check technical stack compliance
- Ensure navigation structure adherence

**Version**: 1.2.0 | **Ratified**: 2025-10-26 | **Last Amended**: 2025-10-26
