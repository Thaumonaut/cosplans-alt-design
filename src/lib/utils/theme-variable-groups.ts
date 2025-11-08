export interface VariableGroup {
	id: string;
	label: string;
	description: string;
	variables: string[];
	icon?: string;
}

export const VARIABLE_GROUPS: VariableGroup[] = [
	{
		id: 'backgrounds',
		label: 'Backgrounds',
		description: 'Background colors and hierarchy levels',
		icon: 'layers',
		variables: [
			'--theme-background',
			'--theme-background-pattern',
			'--theme-section-bg',
			'--theme-card-bg',
			'--theme-card-nested',
			'--theme-content-bg',
			'--theme-input-bg',
			'--theme-background-size',
			'--theme-background-position',
			'--theme-background-repeat',
			'--theme-background-blend',
			'--theme-background-pattern-opacity'
		]
	},
	{
		id: 'text',
		label: 'Text Colors',
		description: 'Foreground and text color variables',
		icon: 'type',
		variables: [
			'--theme-foreground',
			'--theme-text-muted',
			'--theme-text-disabled'
		]
	},
	{
		id: 'borders',
		label: 'Borders',
		description: 'Border colors and styles',
		icon: 'square',
		variables: [
			'--theme-border',
			'--theme-border-subtle',
			'--theme-border-strong',
			'--theme-border-focus'
		]
	},
	{
		id: 'interactive',
		label: 'Interactive States',
		description: 'Hover, active, and focus states',
		icon: 'mouse-pointer',
		variables: [
			'--theme-hover',
			'--theme-active',
			'--theme-focus',
			'--theme-interactive-hover',
			'--theme-interactive-active'
		]
	},
	{
		id: 'primary-accent',
		label: 'Primary & Accent',
		description: 'Primary and accent color variables',
		icon: 'palette',
		variables: [
			'--theme-primary',
			'--theme-primary-foreground',
			'--theme-primary-hover',
			'--theme-accent',
			'--theme-accent-foreground',
			'--theme-accent-hover'
		]
	},
	{
		id: 'semantic',
		label: 'Semantic Colors',
		description: 'Success, error, warning, and info colors',
		icon: 'alert-circle',
		variables: [
			'--theme-success',
			'--theme-success-bg',
			'--theme-error',
			'--theme-error-bg',
			'--theme-warning',
			'--theme-warning-bg',
			'--theme-info',
			'--theme-info-bg'
		]
	},
	{
		id: 'sidebar',
		label: 'Sidebar',
		description: 'Sidebar-specific theme variables',
		icon: 'sidebar',
		variables: [
			'--theme-sidebar-bg',
			'--theme-sidebar-text',
			'--theme-sidebar-muted',
			'--theme-sidebar-accent',
			'--theme-sidebar-hover',
			'--theme-sidebar-active',
			'--theme-sidebar-border',
			'--theme-sidebar-shadow'
		]
	},
	{
		id: 'header',
		label: 'Header',
		description: 'Header-specific theme variables',
		icon: 'header',
		variables: [
			'--theme-header-bg',
			'--theme-header-text',
			'--theme-header-muted',
			'--theme-header-hover',
			'--theme-header-active',
			'--theme-header-shadow'
		]
	},
	{
		id: 'shadows',
		label: 'Shadows',
		description: 'Shadow colors and styles',
		icon: 'shadow',
		variables: [
			'--theme-shadow-color',
			'--theme-shadow-sm',
			'--theme-shadow-md',
			'--theme-shadow-lg'
		]
	},
	{
		id: 'opacity-blur',
		label: 'Opacity & Blur',
		description: 'Opacity and blur effect variables',
		icon: 'droplet',
		variables: [
			'--theme-section-opacity',
			'--theme-card-opacity',
			'--theme-overlay-opacity',
			'--theme-blur-amount'
		]
	},
	{
		id: 'overlays',
		label: 'Overlays & Modals',
		description: 'Overlay and modal background variables',
		icon: 'layers',
		variables: [
			'--theme-overlay-bg',
			'--theme-modal-bg'
		]
	},
	{
		id: 'priority',
		label: 'Priority Badges',
		description: 'Priority badge color variables',
		icon: 'flag',
		variables: [
			'--theme-priority-low-bg',
			'--theme-priority-low-text',
			'--theme-priority-low-border',
			'--theme-priority-low-dot',
			'--theme-priority-medium-bg',
			'--theme-priority-medium-text',
			'--theme-priority-medium-border',
			'--theme-priority-medium-dot',
			'--theme-priority-high-bg',
			'--theme-priority-high-text',
			'--theme-priority-high-border',
			'--theme-priority-high-dot'
		]
	}
];

/**
 * Get all variable names from all groups
 */
export function getAllVariables(): string[] {
	return VARIABLE_GROUPS.flatMap(group => group.variables);
}

/**
 * Find the group that contains a specific variable
 */
export function getGroupForVariable(varName: string): VariableGroup | undefined {
	return VARIABLE_GROUPS.find(group => group.variables.includes(varName));
}

/**
 * Get variables that match a search query
 */
export function searchVariables(query: string): string[] {
	const lowerQuery = query.toLowerCase();
	return getAllVariables().filter(varName => 
		varName.toLowerCase().includes(lowerQuery)
	);
}

/**
 * Get groups that match a search query
 */
export function searchGroups(query: string): VariableGroup[] {
	const lowerQuery = query.toLowerCase();
	return VARIABLE_GROUPS.filter(group => 
		group.label.toLowerCase().includes(lowerQuery) ||
		group.description.toLowerCase().includes(lowerQuery) ||
		group.variables.some(v => v.toLowerCase().includes(lowerQuery))
	);
}

