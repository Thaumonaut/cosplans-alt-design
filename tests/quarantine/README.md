# Test Quarantine

This directory contains tests that have been identified as **flaky** (tests that intermittently fail).

## Purpose

Flaky tests can:
- Block CI/CD pipelines
- Reduce confidence in test suite
- Waste developer time investigating non-issues
- Hide real failures

Instead of disabling or deleting flaky tests, we **quarantine** them to:
- Keep them separate from stable tests
- Continue running them (but failures don't block CI/CD)
- Track and fix them systematically
- Learn about system instabilities

## Process

### 1. Identifying Flaky Tests

Tests are flagged as flaky when they:
- Pass after retry (detected by custom Playwright reporter)
- Fail intermittently without code changes
- Pass locally but fail in CI/CD inconsistently

The flaky test reporter automatically generates `test-results/flaky-tests.json` with detected flaky tests.

### 2. Moving Tests to Quarantine

**When to quarantine**:
- Test has been flaky 2+ times in the past week
- Test passes on retry but failure is not immediately fixable
- Team decides to investigate later

**How to quarantine**:

```bash
# Move test file to quarantine
mv tests/e2e/some-feature/flaky-test.spec.ts tests/quarantine/

# Or create a copy to preserve original location
cp tests/e2e/some-feature/flaky-test.spec.ts tests/quarantine/flaky-test.spec.ts
```

**Update test file** with metadata:

```typescript
/**
 * QUARANTINED: 2025-10-27
 * REASON: Test fails intermittently due to race condition in API calls
 * ISSUE: https://github.com/org/repo/issues/123
 * OWNER: @developer-name
 */

import { test, expect } from '@playwright/test';

test.describe('Flaky Test (QUARANTINE)', () => {
  test('flaky test', async ({ page }) => {
    // ... test code
  });
});
```

### 3. Running Quarantined Tests

Quarantined tests run in a separate CI/CD job that doesn't block merges:

```bash
# Run only quarantined tests
bun test:e2e tests/quarantine/

# Quarantined tests in CI/CD
# See: .github/workflows/test-quarantine.yml
```

### 4. Weekly Review Process

**Every Monday**:

1. Review `test-results/flaky-tests.json` for newly detected flaky tests
2. Review all quarantined tests in this directory
3. For each test:
   - **Fix**: If root cause identified, fix and move back to main suite
   - **Keep**: If still investigating, keep in quarantine
   - **Delete**: If test is obsolete or testing wrong thing, delete

4. Update test metadata with investigation notes

### 5. Fixing Flaky Tests

**Common causes and fixes**:

| Cause | Fix |
|-------|-----|
| Race conditions | Add explicit waits: `await page.waitForResponse('/api/data')` |
| Timing issues | Use `waitFor` instead of `waitForTimeout` |
| Unstable selectors | Use `data-testid` attributes instead of CSS classes |
| Network delays | Mock API responses or increase timeout |
| State pollution | Ensure proper cleanup in `afterEach` |
| Animation timing | Wait for animations: `await page.locator('.modal').waitFor({ state: 'visible' })` |

**When fixed**:

1. Move test back to original location:
   ```bash
   mv tests/quarantine/fixed-test.spec.ts tests/e2e/some-feature/
   ```

2. Remove quarantine metadata from test file

3. Verify test passes consistently (run 10+ times locally)

4. Update tracking issue as resolved

## Current Quarantined Tests

<!-- Update this list manually when moving tests in/out -->

| Test File | Reason | Date Quarantined | Issue | Owner |
|-----------|--------|------------------|-------|-------|
| _(none yet)_ | - | - | - | - |

## Statistics

**Goal**: 0 quarantined tests

**Current**: 0 tests in quarantine

**Fixed this month**: 0 tests

## CI/CD Integration

### Main Test Suite (Blocking)
- Location: `tests/e2e/`, `tests/unit/`, `tests/integration/`
- Failures: **Block PR merge**
- Runs on: Every pull request

### Quarantine Suite (Non-Blocking)
- Location: `tests/quarantine/`
- Failures: **Do not block PR merge**
- Runs on: Daily schedule
- Reports: Sent to #test-quarantine Slack channel

## Best Practices

1. **Don't ignore flaky tests** - Quarantine them instead
2. **Set a fix deadline** - Aim to fix within 2 weeks
3. **Document thoroughly** - Help others understand the issue
4. **Investigate root causes** - Don't just add more retries
5. **Review regularly** - Weekly review keeps quarantine small
6. **Track patterns** - Multiple flaky tests might indicate systemic issues

## Resources

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Flaky Test Detection Documentation](../config/flaky-test-reporter.ts)
- [Test Timeout Configuration](../config/timeouts.ts)

