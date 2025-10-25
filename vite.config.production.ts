import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	
	// Production-specific optimizations
	optimizeDeps: {
		include: [
			'flowbite-svelte',
			'lucide-svelte',
			'date-fns',
			'clsx',
			'tailwind-merge'
		]
	},
	
	build: {
		target: 'esnext',
		minify: 'esbuild',
		sourcemap: false,
		cssMinify: true,
		rollupOptions: {
			output: {
				// Aggressive chunk splitting for optimal caching
				manualChunks: (id) => {
					// Node modules chunking
					if (id.includes('node_modules')) {
						if (id.includes('flowbite-svelte') || id.includes('lucide-svelte')) {
							return 'vendor-ui';
						}
						if (id.includes('date-fns') || id.includes('clsx') || id.includes('tailwind-merge')) {
							return 'vendor-utils';
						}
						if (id.includes('zod')) {
							return 'vendor-validation';
						}
						return 'vendor';
					}
					
					// Component chunking
					if (id.includes('src/lib/components/ui')) {
						return 'ui-components';
					}
					if (id.includes('src/lib/components')) {
						return 'components';
					}
					if (id.includes('src/lib/stores')) {
						return 'stores';
					}
				},
				// Optimize chunk names
				chunkFileNames: 'chunks/[name]-[hash].js',
				entryFileNames: 'entries/[name]-[hash].js',
				assetFileNames: 'assets/[name]-[hash].[ext]'
			}
		},
		chunkSizeWarningLimit: 500,
		// Enable compression
		reportCompressedSize: true
	},
	
	resolve: {
		alias: {
			'@': resolve('./src'),
			'$lib': resolve('./src/lib'),
			'$components': resolve('./src/lib/components'),
			'$stores': resolve('./src/lib/stores'),
			'$types': resolve('./src/lib/types')
		}
	},
	
	// Production CSS optimization
	css: {
		devSourcemap: false
	}
});