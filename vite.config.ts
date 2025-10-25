import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	
	// Dependency optimization
	optimizeDeps: {
		include: [
			'flowbite-svelte',
			'lucide-svelte',
			'date-fns',
			'clsx',
			'tailwind-merge'
		]
	},
	
	// Build configuration
	build: {
		target: 'esnext',
		minify: 'esbuild',
		sourcemap: false, // Set to true for debugging production issues
		rollupOptions: {
			output: {
				// Manual chunk splitting for better caching
				manualChunks: (id) => {
					if (id.includes('node_modules')) {
						if (id.includes('flowbite-svelte') || id.includes('lucide-svelte')) {
							return 'vendor-ui';
						}
						if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
							return 'vendor-utils';
						}
						if (id.includes('zod')) {
							return 'vendor-validation';
						}
					}
				}
			}
		},
		// Chunk size warning limit
		chunkSizeWarningLimit: 1000
	},
	
	// Development server configuration
	server: {
		fs: {
			allow: ['..']
		}
	},
	
	// Path resolution
	resolve: {
		alias: {
			'@': resolve('./src'),
			'$lib': resolve('./src/lib'),
			'$components': resolve('./src/lib/components'),
			'$stores': resolve('./src/lib/stores'),
			'$types': resolve('./src/lib/types')
		}
	},
	
	// CSS configuration
	css: {
		devSourcemap: true
	}
});
