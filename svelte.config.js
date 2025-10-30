import cloudflare from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Use Cloudflare adapter to target Cloudflare Workers/Pages
		adapter: cloudflare(),
		
		// Path aliases for cleaner imports
		alias: {
			'@': './src',
			'@/*': './src/*',
			'$lib': './src/lib',
			'$lib/*': './src/lib/*',
			'$components': './src/lib/components',
			'$components/*': './src/lib/components/*',
			'$stores': './src/lib/stores',
			'$stores/*': './src/lib/stores/*',
			'$types': './src/lib/types',
			'$types/*': './src/lib/types/*'
		},
		

		
		// Service worker configuration
		serviceWorker: {
			register: false // Enable if you want offline support
		},
		
		// CSP configuration for security
		csp: {
			mode: 'auto',
			directives: {
				'script-src': ['self']
			}
		}
	}
};

export default config;
