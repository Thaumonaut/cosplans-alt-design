import { writable } from 'svelte/store';

export interface PageHeaderConfig {
	showBackButton?: boolean;
	backUrl?: string;
	title?: string;
	description?: string;
	actions?: any; // Snippet for action buttons
}

const initialState: PageHeaderConfig = {
	showBackButton: false,
	backUrl: undefined,
	title: undefined,
	description: undefined,
	actions: undefined,
};

function createPageHeaderStore() {
	const { subscribe, set, update } = writable<PageHeaderConfig>(initialState);

	return {
		subscribe,
		setConfig: (config: Partial<PageHeaderConfig>) => {
			update((current) => ({ ...current, ...config }));
		},
		reset: () => set(initialState),
	};
}

export const pageHeader = createPageHeaderStore();


