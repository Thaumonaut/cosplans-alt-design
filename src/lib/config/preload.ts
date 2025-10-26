/**
 * Preloading configuration for critical application routes and resources
 */

// Critical routes that should be preloaded (using new {auth} structure)
export const CRITICAL_ROUTES = [
	'/',
	'/dashboard',
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

// Lazy-loaded route modules for code splitting (updated for (auth) structure)
export const LAZY_ROUTES = {
	accessories: () => import('../../routes/(auth)/accessories/+page.svelte'),
	archived: () => import('../../routes/(auth)/archived/+page.svelte'),
	budget: () => import('../../routes/(auth)/budget/+page.svelte'),
	calendar: () => import('../../routes/(auth)/calendar/+page.svelte'),
	equipment: () => import('../../routes/(auth)/equipment/+page.svelte'),
	events: () => import('../../routes/(auth)/events/+page.svelte'),
	ideas: () => import('../../routes/(auth)/ideas/+page.svelte'),
	marketplace: () => import('../../routes/(auth)/marketplace/+page.svelte'),
	materials: () => import('../../routes/(auth)/materials/+page.svelte'),
	messages: () => import('../../routes/(auth)/messages/+page.svelte'),
	photoshoots: () => import('../../routes/(auth)/photoshoots/+page.svelte'),
	'post-production': () => import('../../routes/(auth)/post-production/+page.svelte'),
	profile: () => import('../../routes/(auth)/profile/+page.svelte'),
	props: () => import('../../routes/(auth)/props/+page.svelte'),
	tasks: () => import('../../routes/(auth)/tasks/+page.svelte'),
	timeline: () => import('../../routes/(auth)/timeline/+page.svelte'),
	tools: () => import('../../routes/(auth)/tools/+page.svelte')
} as const;

// Component lazy loading configuration
export const LAZY_COMPONENTS = {
	'character-creation-form': () => import('../components/character-creation-form.svelte'),
	'service-creation-form': () => import('../components/service-creation-form.svelte'),
	'search-dialog': () => import('../components/search-dialog.svelte')
} as const;