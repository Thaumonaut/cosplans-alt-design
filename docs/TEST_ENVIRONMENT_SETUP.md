# Test Environment Setup Guide

This guide walks you through setting up the test environment for the Cosplay Tracker application.

**Estimated time:** 30-45 minutes

---

## Prerequisites

- [ ] GitHub account with admin access to the repository
- [ ] Supabase account (free tier works fine)
- [ ] Access to deployment platform (Cloudflare Pages, Vercel, or similar)

---

## Task T042: Create Test Supabase Project

### Step 1: Create Test Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in details:
   - **Organization**: Your organization
   - **Project Name**: `cosplay-tracker-test`
   - **Database Password**: Generate a strong password (save it securely)
   - **Region**: Choose closest to your CI/CD runners (e.g., `us-east-1`)
   - **Pricing Plan**: Free tier is sufficient
4. Click **"Create new project"**
5. Wait 2-3 minutes for project to be provisioned

### Step 2: Copy Project Credentials

Once the project is ready:

1. Go to **Project Settings** → **API**
2. Copy the following values:

```env
# Save these values - you'll need them later
SUPABASE_TEST_URL=<Project URL>
SUPABASE_TEST_KEY=<anon public key>
```

### Step 3: Create Local .env.test File

Create `.env.test` in your project root:

```bash
# /home/jek/Downloads/cosplay-tracker/.env.test
SUPABASE_TEST_URL=https://your-project.supabase.co
SUPABASE_TEST_KEY=your-anon-key-here
TEST_BASE_URL=http://localhost:5173

# E2E Test User Credentials (required for E2E tests)
E2E_EMAIL=alice@test.com
E2E_PASSWORD=AliceTest123!
```

**Note:** 
- `E2E_EMAIL` and `E2E_PASSWORD` are required for E2E tests that need authentication
- The test user must exist in your Supabase test database
- These credentials are automatically loaded by Playwright (configured in `playwright.config.ts`)
- Alternative variable names: `TEST_USER_EMAIL` / `TEST_USER_PASSWORD`

**Security Note:** `.env.test` is already in `.gitignore` - do not commit credentials!

### ✅ Verification

```bash
# Test connection
cd /home/jek/Downloads/cosplay-tracker
bun run -e 'console.log("URL:", process.env.SUPABASE_TEST_URL || "NOT SET")'
```

---

## Task T043: Apply Test Schema Migrations

### Step 1: Open Supabase SQL Editor

1. In your test Supabase project, navigate to **SQL Editor**
2. Click **"New Query"**

### Step 2: Run Test Schema Functions Migration

Copy the contents of `supabase/migrations/20250000000000_test_schema_functions.sql` and paste into the SQL editor.

**Or use this quick command:**

```bash
# Copy migration SQL to clipboard (Linux)
cat supabase/migrations/20250000000000_test_schema_functions.sql | xclip -selection clipboard

# macOS
cat supabase/migrations/20250000000000_test_schema_functions.sql | pbcopy

# Windows (PowerShell)
Get-Content supabase/migrations/20250000000000_test_schema_functions.sql | Set-Clipboard
```

Then paste into Supabase SQL Editor and click **"Run"**.

### Step 3: Verify Functions Were Created

Run this verification query in SQL Editor:

```sql
-- List all test schema functions
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%test%'
ORDER BY routine_name;
```

**Expected output:**
- `cleanup_orphaned_test_schemas`
- `clone_schema_structure`
- `create_test_schema`
- `drop_test_schema`
- `list_test_schemas`

### ✅ Verification

Test schema creation locally:

```bash
# Create a test script
cat > /tmp/test-schema.js << 'EOF'
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_TEST_URL;
const key = process.env.SUPABASE_TEST_KEY;

const supabase = createClient(url, key);

async function test() {
  console.log('Testing schema functions...');
  
  // Test list function
  const { data, error } = await supabase.rpc('list_test_schemas');
  
  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
  
  console.log('✅ Schema functions working!');
  console.log('Current test schemas:', data || []);
}

test();
EOF

# Run test
bun run /tmp/test-schema.js
```

---

## Task T044: Configure GitHub Actions Secrets

### Step 1: Navigate to Repository Settings

1. Go to your GitHub repository
2. Click **Settings** (top menu)
3. In left sidebar, click **Secrets and variables** → **Actions**

### Step 2: Add Test Supabase Secrets

Click **"New repository secret"** for each:

**Secret 1: SUPABASE_TEST_URL**
- Name: `SUPABASE_TEST_URL`
- Value: `https://your-project.supabase.co` (from T042)
- Click **"Add secret"**

**Secret 2: SUPABASE_TEST_KEY**
- Name: `SUPABASE_TEST_KEY`
- Value: `your-anon-key` (from T042)
- Click **"Add secret"**

### ✅ Verification

Secrets are set correctly if you see them listed under "Repository secrets":
- ✅ `SUPABASE_TEST_URL`
- ✅ `SUPABASE_TEST_KEY`

**Note:** You won't be able to view secret values after creation (this is normal).

To test secrets work in CI/CD, make a small commit and check workflow logs.

---

## Task T045: Deploy Staging Environment

You have several options for staging deployment:

### Option A: Cloudflare Pages (Recommended)

**Advantages:**
- Free unlimited builds
- Fast global CDN
- Automatic preview deployments
- Built-in analytics

**Steps:**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click **Workers & Pages** → **Create application** → **Pages**
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command**: `bun run build`
   - **Build output directory**: `build`
   - **Root directory**: `/`
5. Add environment variables:
   - `PUBLIC_SUPABASE_URL`: (your production Supabase URL)
   - `PUBLIC_SUPABASE_ANON_KEY`: (your production key)
6. Click **"Save and Deploy"**

**Staging URL format:**
- Main: `https://cosplay-tracker.pages.dev`
- Previews: `https://<branch>.cosplay-tracker.pages.dev`

### Option B: Vercel

**Steps:**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: SvelteKit
   - **Build Command**: `bun run build`
   - **Output Directory**: `build`
5. Add environment variables (same as above)
6. Click **"Deploy"**

**Staging URL format:**
- Main: `https://cosplay-tracker.vercel.app`
- Previews: `https://cosplay-tracker-git-<branch>.vercel.app`

### Option C: Local Staging (Development Only)

For local testing without external deployment:

```bash
# Run staging server locally
bun run build
bun run preview

# Staging URL: http://localhost:4173
```

**Note:** Local staging won't work for CI/CD E2E tests - use Cloudflare or Vercel for automated testing.

### ✅ Verification

1. Visit your staging URL
2. Verify the application loads
3. Check browser console for errors
4. Test basic navigation

Update your `.env.test` with staging URL:

```bash
TEST_BASE_URL=https://your-staging-url.pages.dev
```

---

## Task T041: Configure Branch Protection Rules

### Step 1: Navigate to Branch Settings

1. Go to your GitHub repository
2. Click **Settings** → **Branches**
3. Under "Branch protection rules", click **"Add rule"**

### Step 2: Configure Protection Rule

**Branch name pattern:** `main`

Enable the following:

#### Required Status Checks
- [x] **Require status checks to pass before merging**
- [x] **Require branches to be up to date before merging**

Search and select these status checks:
- ✅ `Run Unit Tests / test`
- ✅ `Run E2E Tests / test`
- ✅ `Run Integration Tests / test`

#### Additional Settings (Recommended)
- [x] **Require a pull request before merging**
  - Required approvals: 1 (adjust based on team size)
- [x] **Require conversation resolution before merging**
- [x] **Do not allow bypassing the above settings** (recommended)

### Step 3: Save Rule

Click **"Create"** to save the branch protection rule.

### ✅ Verification

1. Create a test branch: `git checkout -b test-branch`
2. Make a small change and commit
3. Push and create a pull request
4. Verify that status checks appear and must pass before merge

---

## Complete Verification Checklist

After completing all tasks, verify everything works:

### 1. Test Database Connection

```bash
cd /home/jek/Downloads/cosplay-tracker
bun run tests/utils/cleanup.ts
# Should connect and show "No orphaned test schemas found"
```

### 2. Run Unit Tests Locally

```bash
bun test:unit
# Should pass (0 tests initially, but framework works)
```

### 3. Run E2E Tests Locally

```bash
bun test:e2e
# May fail if no tests exist, but Playwright should start correctly
```

### 4. Test CI/CD

Make a small commit and push:

```bash
echo "# Test" >> TESTING.md
git add TESTING.md
git commit -m "test: verify CI/CD integration"
git push
```

Check GitHub Actions:
- ✅ Unit tests workflow should run
- ✅ Secrets should be available in logs (partially redacted)
- ✅ Tests should execute successfully

### 5. Test Branch Protection

Try to push directly to `main`:

```bash
git push origin main
# Should be rejected if protection is enabled
```

---

## Troubleshooting

### Issue: "Failed to connect to Supabase"

**Solution:**
1. Verify `.env.test` has correct URL and key
2. Check Supabase project is active (not paused)
3. Test connection with: `curl <SUPABASE_TEST_URL>/rest/v1/`

### Issue: "GitHub Actions secrets not found"

**Solution:**
1. Verify secrets are set at **repository** level (not environment)
2. Secret names must match exactly: `SUPABASE_TEST_URL`, `SUPABASE_TEST_KEY`
3. Re-run failed workflow after adding secrets

### Issue: "Playwright browsers not found in CI"

**Solution:**
- Workflows include `bunx playwright install --with-deps` step
- Check workflow logs for installation errors
- May need to clear GitHub Actions cache

### Issue: "Schema isolation not working"

**Solution:**
1. Verify SQL functions were created (run verification query)
2. Check function permissions: `GRANT EXECUTE ON FUNCTION ... TO PUBLIC`
3. Review Supabase logs for RPC errors

---

## Summary

After completing this guide, you'll have:

- ✅ Test Supabase project with schema isolation functions
- ✅ GitHub Actions secrets configured
- ✅ Staging environment deployed
- ✅ Branch protection rules enabled
- ✅ Full test infrastructure operational

**Next Step:** Start writing tests as you build features! See `TESTING.md` for developer guide.

---

## Quick Reference

### Useful Commands

```bash
# Run all tests
bun test

# Run specific test type
bun test:unit
bun test:integration
bun test:e2e

# Run with coverage
bun test:coverage

# Clean up orphaned test schemas
bun run test:cleanup

# Run tests in watch mode
bun test:watch
```

### Important Files

- `.env.test` - Local test environment variables
- `TESTING.md` - Developer testing guide
- `tests/quarantine/README.md` - Flaky test management
- `.github/workflows/` - CI/CD configuration

### Support

If you encounter issues:
1. Check `TESTING.md` troubleshooting section
2. Review GitHub Actions logs
3. Check Supabase project logs
4. Verify all secrets and environment variables are set correctly

