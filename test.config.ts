/**
 * Comprehensive testing configuration for the SvelteKit application
 */

export const testConfig = {
  // Unit test configuration
  unit: {
    coverage: {
      threshold: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      },
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        '.svelte-kit/',
        'src/app.html',
        'src/lib/config/',
        'tests/'
      ]
    }
  },

  // Integration test configuration
  integration: {
    timeout: 10000,
    retries: 1
  },

  // E2E test configuration
  e2e: {
    baseURL: 'http://localhost:4173',
    timeout: 30000,
    retries: 2,
    browsers: ['chromium', 'firefox', 'webkit'],
    mobile: ['Mobile Chrome', 'Mobile Safari']
  },

  // Performance test thresholds
  performance: {
    // Lighthouse thresholds
    lighthouse: {
      performance: 90,
      accessibility: 95,
      bestPractices: 90,
      seo: 90
    },
    // Bundle size limits (in KB)
    bundleSize: {
      maxJSSize: 500,
      maxCSSSize: 100,
      maxTotalSize: 1000
    }
  }
};

export default testConfig;