/**
 * Celebration Store
 * 
 * Manages celebration state for task completions.
 * Provides a simple API to trigger celebrations.
 */
import { writable } from 'svelte/store';
import { getEncouragingMessage } from '$lib/utils/encouraging-messages';

export interface CelebrationState {
	trigger: boolean;
	message: string;
	taskTitle?: string;
}

const initialState: CelebrationState = {
	trigger: false,
	message: '',
	taskTitle: undefined,
};

function createCelebrationStore() {
	const { subscribe, set, update } = writable<CelebrationState>(initialState);

	return {
		subscribe,
		
		/**
		 * Trigger a celebration with an optional custom message
		 */
		celebrate(taskTitle?: string, customMessage?: string) {
			set({
				trigger: true,
				message: customMessage || getEncouragingMessage(),
				taskTitle,
			});
			
			// Reset trigger after a short delay to allow re-triggering
			setTimeout(() => {
				update(state => ({ ...state, trigger: false }));
			}, 100);
		},
		
		/**
		 * Reset celebration state
		 */
		reset() {
			set(initialState);
		},
	};
}

export const celebration = createCelebrationStore();


