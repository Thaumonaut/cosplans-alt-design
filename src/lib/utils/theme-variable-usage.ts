/**
 * Maps component/element identifiers to the theme variables they use
 * This is used for highlighting variable usage in the theme builder preview
 */
export interface VariableUsage {
	componentId: string;
	componentName: string;
	variables: string[];
	description?: string;
}

export const VARIABLE_USAGE_MAP: VariableUsage[] = [
	{
		componentId: 'button-primary',
		componentName: 'Primary Button',
		variables: [
			'--theme-primary',
			'--theme-primary-hover',
			'--theme-card-bg',
			'--theme-foreground'
		],
		description: 'Primary action buttons'
	},
	{
		componentId: 'button-outline',
		componentName: 'Outline Button',
		variables: [
			'--theme-border',
			'--theme-foreground',
			'--theme-hover',
			'--theme-active'
		],
		description: 'Secondary buttons with outline style'
	},
	{
		componentId: 'button-ghost',
		componentName: 'Ghost Button',
		variables: [
			'--theme-foreground',
			'--theme-hover',
			'--theme-active'
		],
		description: 'Minimal buttons with no background'
	},
	{
		componentId: 'card',
		componentName: 'Card',
		variables: [
			'--theme-card-bg',
			'--theme-border',
			'--theme-foreground',
			'--theme-text-muted',
			'--theme-shadow-md'
		],
		description: 'Card containers'
	},
	{
		componentId: 'card-nested',
		componentName: 'Nested Card',
		variables: [
			'--theme-card-nested',
			'--theme-border',
			'--theme-foreground'
		],
		description: 'Cards nested inside other cards'
	},
	{
		componentId: 'input',
		componentName: 'Input Field',
		variables: [
			'--theme-input-bg',
			'--theme-border',
			'--theme-border-focus',
			'--theme-foreground',
			'--theme-text-muted',
			'--theme-focus'
		],
		description: 'Text input fields'
	},
	{
		componentId: 'sidebar',
		componentName: 'Sidebar',
		variables: [
			'--theme-sidebar-bg',
			'--theme-sidebar-text',
			'--theme-sidebar-muted',
			'--theme-sidebar-accent',
			'--theme-sidebar-hover',
			'--theme-sidebar-active',
			'--theme-sidebar-border',
			'--theme-sidebar-shadow'
		],
		description: 'Application sidebar'
	},
	{
		componentId: 'header',
		componentName: 'Header',
		variables: [
			'--theme-header-bg',
			'--theme-header-text',
			'--theme-header-muted',
			'--theme-header-hover',
			'--theme-header-active',
			'--theme-header-shadow'
		],
		description: 'Application header'
	},
	{
		componentId: 'badge-success',
		componentName: 'Success Badge',
		variables: [
			'--theme-success',
			'--theme-success-bg',
			'--theme-foreground'
		],
		description: 'Success status indicators'
	},
	{
		componentId: 'badge-error',
		componentName: 'Error Badge',
		variables: [
			'--theme-error',
			'--theme-error-bg',
			'--theme-foreground'
		],
		description: 'Error status indicators'
	},
	{
		componentId: 'badge-warning',
		componentName: 'Warning Badge',
		variables: [
			'--theme-warning',
			'--theme-warning-bg',
			'--theme-foreground'
		],
		description: 'Warning status indicators'
	},
	{
		componentId: 'badge-info',
		componentName: 'Info Badge',
		variables: [
			'--theme-info',
			'--theme-info-bg',
			'--theme-foreground'
		],
		description: 'Info status indicators'
	},
	{
		componentId: 'priority-low',
		componentName: 'Low Priority',
		variables: [
			'--theme-priority-low-bg',
			'--theme-priority-low-text',
			'--theme-priority-low-border',
			'--theme-priority-low-dot'
		],
		description: 'Low priority task indicators'
	},
	{
		componentId: 'priority-medium',
		componentName: 'Medium Priority',
		variables: [
			'--theme-priority-medium-bg',
			'--theme-priority-medium-text',
			'--theme-priority-medium-border',
			'--theme-priority-medium-dot'
		],
		description: 'Medium priority task indicators'
	},
	{
		componentId: 'priority-high',
		componentName: 'High Priority',
		variables: [
			'--theme-priority-high-bg',
			'--theme-priority-high-text',
			'--theme-priority-high-border',
			'--theme-priority-high-dot'
		],
		description: 'High priority task indicators'
	},
	{
		componentId: 'modal',
		componentName: 'Modal',
		variables: [
			'--theme-modal-bg',
			'--theme-overlay-bg',
			'--theme-border',
			'--theme-foreground',
			'--theme-shadow-lg'
		],
		description: 'Modal dialogs and overlays'
	},
	{
		componentId: 'text-heading',
		componentName: 'Heading Text',
		variables: [
			'--theme-foreground'
		],
		description: 'Heading text elements'
	},
	{
		componentId: 'text-body',
		componentName: 'Body Text',
		variables: [
			'--theme-foreground'
		],
		description: 'Body text elements'
	},
	{
		componentId: 'text-muted',
		componentName: 'Muted Text',
		variables: [
			'--theme-text-muted'
		],
		description: 'Secondary/muted text'
	},
	{
		componentId: 'text-disabled',
		componentName: 'Disabled Text',
		variables: [
			'--theme-text-disabled'
		],
		description: 'Disabled text elements'
	}
];

/**
 * Get all components that use a specific variable
 */
export function getComponentsUsingVariable(varName: string): VariableUsage[] {
	return VARIABLE_USAGE_MAP.filter(usage => usage.variables.includes(varName));
}

/**
 * Get all variables used by a component
 */
export function getVariablesForComponent(componentId: string): string[] {
	const usage = VARIABLE_USAGE_MAP.find(u => u.componentId === componentId);
	return usage?.variables || [];
}

/**
 * Get usage information for a component
 */
export function getComponentUsage(componentId: string): VariableUsage | undefined {
	return VARIABLE_USAGE_MAP.find(u => u.componentId === componentId);
}

