import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
	plugins: [
		sveltekit(),
		// Bundle analyzer plugin
		visualizer({
			filename: 'dist/stats.html',
			open: true,
			gzipSize: true,
			brotliSize: true,
			template: 'treemap' // 'treemap', 'sunburst', 'network'
		})
	],
	
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
		sourcemap: true, // Enable for analysis
		rollupOptions: {
			output: {
				manualChunks: {
					'vendor-ui': ['flowbite-svelte', 'lucide-svelte'],
					'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge', 'class-variance-authority'],
					'vendor-validation': ['zod']
				}
			}
		},
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
	}
});