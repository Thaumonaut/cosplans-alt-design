# Pull Request Merge Checklist

## Branch: `002-mvp-redesign` → `main`

## Required Status Checks

Based on branch protection rules, the following status checks must pass before merging:

### ✅ Test Workflows (Must Pass)

1. **Run Unit Tests** (`test-unit.yml`)
   - Runs: `bun test:unit`
   - Status: ⚠️ **Needs to pass in CI**
   - Note: These run on all pushes, so should be passing

2. **Run Integration Tests** (`test-integration.yml`)
   - Runs: `bun test:integration`
   - Requires: `SUPABASE_TEST_URL` and `SUPABASE_TEST_KEY` secrets
   - Status: ⚠️ **Needs to pass in CI**
   - Note: Requires test environment secrets to be configured

3. **Run E2E Tests** (`test-e2e.yml`)
   - Runs: `bunx playwright test`
   - Requires: `SUPABASE_TEST_URL` and `SUPABASE_TEST_KEY` secrets
   - Environment: `cosplans-test`
   - Status: ⚠️ **Needs to pass in CI**
   - Note: Fixed Playwright config to use `bun run dev` in CI

### 📋 Additional Requirements

Based on branch protection configuration:

- [ ] **Require status checks to pass before merging** ✅ (Configured)
- [ ] **Require branches to be up to date before merging** ✅ (Configured)
- [ ] **All three test workflows must pass** ⚠️ (Check GitHub PR page)
- [ ] **Code review approval** (if required)
- [ ] **No merge conflicts** ✅ (Check locally)

## Current Status

### ✅ Completed Fixes

1. **E2E Test Configuration** ✅
   - Fixed Playwright webServer to use `bun run dev` in CI
   - Updated to run full test suite (not just smoke tests)
   - Added proper environment variable handling

2. **Cloudflare Deployment** ✅
   - Created comprehensive `wrangler.jsonc` configuration
   - Added `CLOUDFLARE_PAGES_SETUP.md` documentation
   - Documented correct build output directory: `.svelte-kit/cloudflare`

3. **Unit Tests** ✅
   - All 30 unit tests passing locally
   - Should pass in CI

### ⚠️ Items to Verify

1. **GitHub Secrets Configuration**
   - Verify `SUPABASE_TEST_URL` is set in repository secrets
   - Verify `SUPABASE_TEST_KEY` is set in repository secrets
   - Verify `cosplans-test` environment exists with proper secrets

2. **CI/CD Workflow Status**
   - Check GitHub Actions runs for the PR
   - Verify all three workflows complete successfully
   - Check for any workflow failures or errors

3. **Merge Conflicts**
   - Run: `git fetch origin main && git merge-base origin/main HEAD`
   - Check if branch is up to date with main

## How to Check Status

### 1. Check GitHub PR Page

Visit the PR page on GitHub and check:
- [ ] All required status checks are listed
- [ ] All checks show ✅ green (passing)
- [ ] No ❌ red checks (failing)
- [ ] No ⏳ pending checks

### 2. Verify Secrets Are Configured

Go to: **Repository → Settings → Secrets and variables → Actions**

Verify these secrets exist:
- ✅ `SUPABASE_TEST_URL`
- ✅ `SUPABASE_TEST_KEY`

Go to: **Repository → Settings → Environments → cosplans-test**

Verify environment exists and has:
- ✅ `SUPABASE_TEST_URL`
- ✅ `SUPABASE_TEST_KEY`

### 3. Test Locally Before Merging

```bash
# Ensure you're on the branch
git checkout 002-mvp-redesign
git pull origin 002-mvp-redesign

# Run all tests locally
pnpm test:unit
pnpm test:integration
pnpm test:e2e --project=chromium --grep="smoke"

# Check for merge conflicts
git fetch origin main
git merge-base origin/main HEAD
git diff origin/main...HEAD --name-only
```

## Common Issues & Solutions

### Issue: E2E Tests Failing in CI

**Possible Causes:**
- Missing or incorrect `SUPABASE_TEST_URL` / `SUPABASE_TEST_KEY`
- Playwright browsers not installed in CI
- Dev server not starting properly

**Solutions:**
- Verify secrets are set correctly
- Check `.github/workflows/test-e2e.yml` uses `bunx playwright install --with-deps`
- Ensure Playwright config uses `bun run dev` (already fixed)

### Issue: Integration Tests Failing

**Possible Causes:**
- Missing Supabase test secrets
- Test database not accessible
- Migration issues

**Solutions:**
- Verify `SUPABASE_TEST_URL` and `SUPABASE_TEST_KEY` secrets
- Check test database is accessible
- Run `bun run test:verify` locally

### Issue: Unit Tests Failing

**Possible Causes:**
- Test environment issues
- Dependency problems

**Solutions:**
- Run `pnpm test:unit` locally
- Check for TypeScript errors: `pnpm check`
- Verify dependencies: `pnpm install`

### Issue: "Required status checks are expected"

**Cause:** Branch protection rules expect specific check names

**Solution:** Ensure workflow job names match:
- `Run Unit Tests / test`
- `Run Integration Tests / test`  
- `Run E2E Tests / test`

## Next Steps

1. **Check GitHub PR Page** for current status of all checks
2. **Verify Secrets** are configured in GitHub repository settings
3. **Run Tests Locally** to catch issues before CI runs
4. **Review PR** - ensure all changes are approved
5. **Merge When Ready** - all checks must be ✅ green

## Deployment After Merge

After successfully merging to `main`:

1. **Cloudflare Pages will auto-deploy** (if configured)
2. **Verify deployment** at your Cloudflare Pages URL
3. **Check environment variables** are set in Cloudflare dashboard
4. **Test production deployment** to ensure everything works

---

**Last Updated:** Based on current branch state and workflow configurations

