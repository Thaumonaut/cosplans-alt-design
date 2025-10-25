/**
 * Preloading configuration for critical application routes and resources
 */

// Critical routes that should be preloaded
export const CRITICAL_ROUTES = [
	'/',
	'/characters',
	'/projects',
	'/planning'
] as const;

// Resources to preload on app initialization
export const CRITICAL_RESOURCES = [
	// Critical CSS (handled by SvelteKit)
	// Critical images
	'/placeholder-logo.svg',
	'/placeholder-user.jpg'
] as const;

// Lazy-loaded route modules for code splitting
export const LAZY_ROUTES = {
	accessories: () => import('../../routes/accessories/+page.svelte'),
	archived: () => import('../../routes/archived/+page.svelte'),
	budget: () => import('../../routes/budget/+page.svelte'),
	calendar: () => import('../../routes/calendar/+page.svelte'),
	equipment: () => import('../../routes/equipment/+page.svelte'),
	events: () => import('../../routes/events/+page.svelte'),
	ideas: () => import('../../routes/ideas/+page.svelte'),
	marketplace: () => import('../../routes/marketplace/+page.svelte'),
	materials: () => import('../../routes/materials/+page.svelte'),
	messages: () => import('../../routes/messages/+page.svelte'),
	photoshoots: () => import('../../routes/photoshoots/+page.svelte'),
	'post-production': () => import('../../routes/post-production/+page.svelte'),
	profile: () => import('../../routes/profile/+page.svelte'),
	props: () => import('../../routes/props/+page.svelte'),
	tasks: () => import('../../routes/tasks/+page.svelte'),
	timeline: () => import('../../routes/timeline/+page.svelte'),
	tools: () => import('../../routes/tools/+page.svelte')
} as const;

// Component lazy loading configuration
export const LAZY_COMPONENTS = {
	'character-creation-form': () => import('../components/character-creation-form.svelte'),
	'service-creation-form': () => import('../components/service-creation-form.svelte'),
	'search-dialog': () => import('../components/search-dialog.svelte')
} as const;