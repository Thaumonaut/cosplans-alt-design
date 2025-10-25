/**
 * Performance optimization utilities for the SvelteKit application
 */

// Lazy loading utility for dynamic imports
export async function lazyLoad<T>(importFn: () => Promise<T>): Promise<T> {
	try {
		return await importFn();
	} catch (error) {
		console.error('Failed to lazy load module:', error);
		throw error;
	}
}

// Preload critical resources
export function preloadRoute(href: string): void {
	if (typeof window !== 'undefined') {
		const link = document.createElement('link');
		link.rel = 'prefetch';
		link.href = href;
		document.head.appendChild(link);
	}
}

// Image lazy loading with intersection observer
export function createImageLazyLoader() {
	if (typeof window === 'undefined') return;
	
	const imageObserver = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				const img = entry.target as HTMLImageElement;
				const src = img.dataset.src;
				if (src) {
					img.src = src;
					img.removeAttribute('data-src');
					imageObserver.unobserve(img);
				}
			}
		});
	});
	
	return {
		observe: (img: HTMLImageElement) => imageObserver.observe(img),
		disconnect: () => imageObserver.disconnect()
	};
}

// Debounce utility for performance-sensitive operations
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout>;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

// Throttle utility for scroll/resize events
export function throttle<T extends (...args: any[]) => any>(
	func: T,
	limit: number
): (...args: Parameters<T>) => void {
	let inThrottle: boolean;
	return (...args: Parameters<T>) => {
		if (!inThrottle) {
			func(...args);
			inThrottle = true;
			setTimeout(() => (inThrottle = false), limit);
		}
	};
}

// Bundle size monitoring (development only)
export function logBundleInfo() {
	if (import.meta.env.DEV) {
		console.log('Bundle analysis available at: /stats.html after build');
	}
}