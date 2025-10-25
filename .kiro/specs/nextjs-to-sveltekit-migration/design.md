# Design Document

## Overview

This design outlines the systematic migration of a cosplay project tracking application from Next.js/React to SvelteKit. The migration will preserve all existing functionality while leveraging SvelteKit's performance benefits, simpler state management, and improved developer experience. The approach focuses on component-by-component conversion, maintaining the existing UI design system, and ensuring feature parity.

## Architecture

### Current Architecture (Next.js)
- **Framework**: Next.js 16.0.0 with React 19.2.0
- **Routing**: App Router with file-based routing
- **UI Library**: Custom components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React hooks and context
- **Build System**: Next.js with TypeScript

### Target Architecture (SvelteKit)
- **Framework**: SvelteKit with Svelte 5
- **Routing**: SvelteKit's file-based routing system
- **UI Library**: Flowbite Svelte components
- **Styling**: Tailwind CSS (preserved)
- **State Management**: Svelte 5 runes and stores
- **Build System**: Vite with SvelteKit adapter

### Migration Strategy
1. **Incremental Conversion**: Convert components from leaf nodes upward
2. **Preserve Design System**: Maintain existing Tailwind classes and design tokens
3. **Feature Parity**: Ensure all functionality works identically
4. **Type Safety**: Maintain TypeScript throughout the migration

## Components and Interfaces

### UI Component Library Migration

#### Radix UI to Flowbite Svelte Equivalents
- **Radix Accordion** → Flowbite Accordion component
- **Radix Dialog** → Flowbite Modal component
- **Radix Dropdown Menu** → Flowbite Dropdown component
- **Radix Select** → Flowbite Select component
- **Radix Toast** → Flowbite Toast component
- **Radix Tooltip** → Flowbite Tooltip component

#### Component Conversion Patterns

**React Button Component**:
```typescript
// React version
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}
```

**Svelte Button Component**:
```typescript
// Svelte version
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  element?: 'button' | 'a'
}
```

### State Management Migration

#### React Hooks to Svelte 5 Runes
- **useState** → Svelte 5 $state() rune or writable stores
- **useEffect** → Svelte 5 $effect() rune or reactive statements
- **useContext** → Svelte context API or global stores
- **useCallback/useMemo** → Svelte 5 $derived() rune or derived stores

#### Example State Conversion
```typescript
// React
const [projects, setProjects] = useState([])
const [loading, setLoading] = useState(false)

// Svelte 5 with runes
let projects = $state([])
let loading = $state(false)

// Or with stores for global state
import { writable } from 'svelte/store'
export const projects = writable([])
export const loading = writable(false)
```

### Routing Migration

#### File Structure Mapping
```
Next.js app/ → SvelteKit src/routes/
app/page.tsx → src/routes/+page.svelte
app/layout.tsx → src/routes/+layout.svelte
app/characters/page.tsx → src/routes/characters/+page.svelte
app/settings/profile/page.tsx → src/routes/settings/profile/+page.svelte
```

#### Route Loading and Data
- **Next.js loading.tsx** → SvelteKit +loading.svelte
- **Next.js metadata** → SvelteKit +page.ts with load function
- **Client-side navigation** → SvelteKit's enhanced navigation

## Data Models

### Type Definitions (Preserved)
```typescript
interface Project {
  id: number
  title: string
  character: string
  series: string
  image: string
  progress: number
  budget: { spent: number; total: number }
  deadline?: string
  status: 'idea' | 'planning' | 'in-progress' | 'completed' | 'archived'
}

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}
```

### Store Architecture
```typescript
// stores/projects.ts
import { writable, derived } from 'svelte/store'

export const projects = writable<Project[]>([])
export const activeProjects = derived(
  projects,
  $projects => $projects.filter(p => p.status === 'in-progress')
)

// Or using Svelte 5 runes for component-level state
// projects.svelte.ts
export class ProjectsState {
  projects = $state<Project[]>([])
  
  get activeProjects() {
    return $derived(this.projects.filter(p => p.status === 'in-progress'))
  }
}
```

## Error Handling

### Error Boundaries Migration
- **React Error Boundaries** → SvelteKit error pages (+error.svelte)
- **Try-catch in components** → Svelte error handling with stores
- **Loading states** → Svelte loading stores and conditional rendering

### Error Page Structure
```
src/routes/+error.svelte (global error page)
src/routes/characters/+error.svelte (route-specific error)
```

## Testing Strategy

### Component Testing
- **React Testing Library** → Svelte Testing Library
- **Jest** → Vitest (built into SvelteKit)
- **Component unit tests** → Maintain same test coverage

### Integration Testing
- **Next.js API routes testing** → SvelteKit API routes testing
- **E2E testing** → Playwright (already supported by SvelteKit)

### Test Migration Approach
1. Convert component tests to use Svelte Testing Library
2. Update API route tests for SvelteKit format
3. Maintain existing E2E test scenarios

## Performance Considerations

### Bundle Size Optimization
- **React bundle** → Smaller Svelte compiled output
- **Radix UI dependencies** → Lighter Flowbite Svelte components
- **Tree shaking** → Better with SvelteKit's Vite build

### Runtime Performance
- **Virtual DOM** → Svelte's compile-time optimizations
- **State updates** → More efficient reactive updates
- **Hydration** → SvelteKit's selective hydration

## Migration Phases

### Phase 1: Project Setup
1. Initialize new SvelteKit project with Svelte 5
2. Configure TypeScript and Tailwind CSS
3. Set up basic routing structure
4. Install Flowbite Svelte dependencies

### Phase 2: Core Components
1. Convert basic UI components (Button, Card, Input)
2. Migrate utility functions and helpers
3. Set up global stores and context

### Phase 3: Layout and Navigation
1. Convert app layout and sidebar
2. Migrate navigation components
3. Set up routing and page structure

### Phase 4: Feature Components
1. Convert dashboard and project components
2. Migrate forms and interactive elements
3. Convert data display components

### Phase 5: Pages and Routes
1. Convert all page components
2. Set up data loading and API integration
3. Implement error handling and loading states

### Phase 6: Testing and Optimization
1. Convert and update all tests
2. Performance optimization and bundle analysis
3. Final testing and deployment setup

## Technical Decisions

### UI Library Choice
**Decision**: Use Flowbite Svelte as the primary component library
**Rationale**: 
- Comprehensive Svelte component library with Tailwind CSS
- Pre-built components that match existing design patterns
- Strong TypeScript support and documentation
- Active maintenance and large community
- Easy migration path from Radix UI patterns

### State Management Approach
**Decision**: Use Svelte 5 runes for component state and stores for global state
**Rationale**:
- Svelte 5 runes provide more intuitive and performant reactivity
- $state() and $derived() runes simplify component-level state management
- Stores remain ideal for cross-component and persistent state
- Better TypeScript integration with runes

### Build Configuration
**Decision**: Use SvelteKit with Vite, TypeScript, and Svelte 5
**Rationale**:
- Native TypeScript support with improved inference
- Faster development builds with Vite
- Better tree shaking and optimization
- Svelte 5's compile-time optimizations
- Simpler configuration than Next.js