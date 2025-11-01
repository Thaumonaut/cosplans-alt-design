# E2E Tests

End-to-end tests using Playwright for the Cosplay Tracker application.

## Setup

### Required Environment Variables

The E2E tests require authentication credentials. Set these in your environment or CI:

```bash
# Required for tests that need authentication
E2E_EMAIL=alice@test.com
E2E_PASSWORD=AliceTest123!

# Or use these alternative names
TEST_USER_EMAIL=alice@test.com
TEST_USER_PASSWORD=AliceTest123!
```

### Test User Setup

The E2E tests use fixed test users defined in `tests/utils/factory.ts`:

- **alice@test.com** / `AliceTest123!` - Primary test user
- **bob@test.com** / `BobTest123!` - Secondary test user
- **charlie@test.com** / `CharlieTest123!` - Team lead test user

**Important:** These users must exist in your test Supabase database. Create them via:
1. SQL migrations in `supabase/migrations/`
2. Manual creation in Supabase dashboard
3. Test setup scripts

## Running Tests

### Locally

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test file
pnpm test:e2e tests/e2e/dashboard.spec.ts

# Run in UI mode (helpful for debugging)
pnpm test:e2e:ui

# Run in headed mode (see browser)
pnpm test:e2e:headed

# Run specific test
pnpm test:e2e --grep "should load the dashboard"
```

### In CI

The GitHub Actions workflow automatically:
1. Installs Playwright browsers
2. Sets up test credentials from secrets
3. Runs all E2E tests

Ensure these secrets are configured:
- `SUPABASE_TEST_URL`
- `SUPABASE_TEST_KEY`
- `E2E_EMAIL` (optional, defaults to `alice@test.com`)
- `E2E_PASSWORD` (optional, defaults to `AliceTest123!`)

## Test Structure

### Authentication Helper

The `loginIfNeeded()` helper function automatically:
- Detects if authentication is required
- Handles redirects to login page
- Performs login if needed
- Waits for authentication to complete

Usage:
```typescript
import { loginIfNeeded } from './support/auth';

test('my test', async ({ page }) => {
  await page.goto('/dashboard');
  await loginIfNeeded(page); // Handles auth automatically
  // ... rest of test
});
```

### Test Files

- `dashboard.spec.ts` - Dashboard page tests
- `navigation.spec.ts` - Navigation and routing tests
- `forms.spec.ts` - Form interaction tests
- `resources/resource-management.spec.ts` - Resource CRUD tests
- `smoke.spec.ts` - Quick smoke tests

## Troubleshooting

### Tests Timing Out

1. **Check authentication**: Ensure `E2E_EMAIL` and `E2E_PASSWORD` are set
2. **Verify test user exists**: Check Supabase test database
3. **Check dev server**: Ensure dev server starts correctly (check Playwright logs)
4. **Increase timeouts**: Tests use 10-30s timeouts by default

### Login Failing

1. **Verify credentials**: Check email/password in environment variables
2. **Check Supabase connection**: Verify `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`
3. **Test manually**: Try logging in manually at `/login` with test credentials

### Page Elements Not Found

1. **Check selectors**: Verify element IDs/classes match current UI
2. **Wait for load**: Tests use `waitForLoadState('networkidle')` - ensure page finishes loading
3. **Check authentication**: Some pages require auth

### CI Failures

1. **Check workflow logs**: Look for specific error messages
2. **Verify secrets**: Ensure all required secrets are set
3. **Check browser installation**: Verify Playwright browsers installed correctly
4. **Review test output**: Check uploaded Playwright reports

## Best Practices

1. **Use `loginIfNeeded()`**: Don't manually implement login in tests
2. **Wait for network idle**: Use `waitForLoadState('networkidle')` after navigation
3. **Use explicit timeouts**: Set reasonable timeouts for assertions
4. **Test critical paths**: Focus on user-facing functionality
5. **Keep tests isolated**: Each test should be independent

## Debugging

### View Test Execution

```bash
# Open Playwright UI for visual debugging
pnpm test:e2e:ui

# Run with browser visible
pnpm test:e2e:headed

# Run in debug mode (step through)
pnpm test:e2e:debug
```

### View Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

### Capture Screenshots/Videos

Failed tests automatically capture:
- Screenshots (on failure)
- Videos (on failure)
- Traces (on first retry)

View these in `test-results/` directory or the HTML report.

