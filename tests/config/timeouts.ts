/**
 * Tiered Timeout Configuration
 * 
 * Defines timeout thresholds for different test types with warning levels.
 * Unit tests: 5s (fast feedback)
 * Integration tests: 30s (database queries + network)
 * E2E tests: 2min (browser startup + complex interactions)
 * 
 * Warnings triggered at 80% of timeout to identify slow tests before failure.
 */

export interface TimeoutTier {
  /** Test type identifier */
  name: string;
  /** Maximum time for test in milliseconds */
  timeout: number;
  /** Warn when test duration exceeds this threshold */
  warningAt: number;
  /** Warning threshold as percentage (default: 80%) */
  warningThreshold: number;
}

export const TIMEOUT_TIERS = {
  /** Unit tests: Fast, isolated component/function tests */
  UNIT: {
    name: 'unit',
    timeout: 5000, // 5 seconds
    warningAt: 4000, // 4 seconds (80%)
    warningThreshold: 0.8,
  } as TimeoutTier,

  /** Integration tests: Database queries, service layer tests */
  INTEGRATION: {
    name: 'integration',
    timeout: 30000, // 30 seconds
    warningAt: 24000, // 24 seconds (80%)
    warningThreshold: 0.8,
  } as TimeoutTier,

  /** E2E tests: Full browser-based user journey tests */
  E2E: {
    name: 'e2e',
    timeout: 120000, // 2 minutes
    warningAt: 96000, // 96 seconds (80%)
    warningThreshold: 0.8,
  } as TimeoutTier,

  /** Hook timeouts: beforeAll, afterAll, beforeEach, afterEach */
  HOOKS: {
    name: 'hooks',
    timeout: 10000, // 10 seconds
    warningAt: 8000, // 8 seconds (80%)
    warningThreshold: 0.8,
  } as TimeoutTier,
} as const;

/**
 * Get timeout configuration for a specific test type
 */
export function getTimeoutForType(type: 'unit' | 'integration' | 'e2e' | 'hooks'): TimeoutTier {
  switch (type) {
    case 'unit':
      return TIMEOUT_TIERS.UNIT;
    case 'integration':
      return TIMEOUT_TIERS.INTEGRATION;
    case 'e2e':
      return TIMEOUT_TIERS.E2E;
    case 'hooks':
      return TIMEOUT_TIERS.HOOKS;
    default:
      return TIMEOUT_TIERS.UNIT;
  }
}

/**
 * Check if test duration warrants a warning
 */
export function shouldWarn(duration: number, tier: TimeoutTier): boolean {
  return duration >= tier.warningAt;
}

/**
 * Format warning message for slow tests
 */
export function formatSlowTestWarning(testName: string, duration: number, tier: TimeoutTier): string {
  const percentage = Math.round((duration / tier.timeout) * 100);
  return `⚠️  Slow test approaching timeout: "${testName}" took ${duration}ms (${percentage}% of ${tier.timeout}ms ${tier.name} timeout)`;
}

/**
 * Global timeout configuration for entire test suites
 */
export const GLOBAL_TIMEOUTS = {
  /** Maximum time for entire unit test suite */
  UNIT_SUITE: 30000, // 30 seconds

  /** Maximum time for entire integration test suite */
  INTEGRATION_SUITE: 5 * 60 * 1000, // 5 minutes

  /** Maximum time for entire E2E test suite */
  E2E_SUITE: 10 * 60 * 1000, // 10 minutes
} as const;

/**
 * Assertion timeouts (for expect() statements)
 */
export const ASSERTION_TIMEOUTS = {
  /** Default assertion timeout for all test types */
  DEFAULT: 5000, // 5 seconds

  /** E2E assertion timeout (element may need time to appear) */
  E2E: 10000, // 10 seconds

  /** Visual regression assertion timeout (screenshot comparison) */
  VISUAL_REGRESSION: 30000, // 30 seconds
} as const;

/**
 * Helper function to create timeout warning handler for Vitest
 */
export function createTimeoutWarningHandler(tier: TimeoutTier) {
  return (test: { name: string; duration: number }) => {
    if (shouldWarn(test.duration, tier)) {
      console.warn(formatSlowTestWarning(test.name, test.duration, tier));
    }
  };
}
