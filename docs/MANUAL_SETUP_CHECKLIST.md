# Manual Test Environment Setup Checklist

Track your progress through the manual setup tasks (T041-T045).

**Time Required:** 30-45 minutes  
**Prerequisites:** GitHub admin access, Supabase account

---

## Pre-Setup Verification

Before starting, verify infrastructure is ready:

```bash
cd /home/jek/Downloads/cosplay-tracker

# Verify all files exist
ls -la tests/config/timeouts.ts
ls -la tests/utils/test-database.ts
ls -la tests/utils/factory.ts
ls -la TESTING.md

# Check package scripts
grep "test:" package.json
```

✅ All infrastructure files exist and scripts are configured

---

## Task T042: Create Test Supabase Project

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete

### Steps:

1. [ ] Go to https://supabase.com/dashboard
2. [ ] Click "New Project"
3. [ ] Configure project:
   - Name: `cosplay-tracker-test`
   - Region: _________________ (choose closest to CI/CD)
   - Password: _________________ (saved securely)
4. [ ] Wait for provisioning (2-3 minutes)
5. [ ] Copy credentials:
   - URL: _________________________________________________
   - Key: _________________________________________________

### Create .env.test:

```bash
cd /home/jek/Downloads/cosplay-tracker
cp .env.test.template .env.test
# Edit .env.test with your credentials
nano .env.test
```

6. [ ] .env.test created with correct values

### Verification:

```bash
# Test .env.test is loaded
source .env.test
echo "URL: $SUPABASE_TEST_URL"
echo "Key: ${SUPABASE_TEST_KEY:0:20}..." # Shows first 20 chars

# Or using bun
bun run -e 'console.log("URL:", process.env.SUPABASE_TEST_URL)'
```

7. [ ] Verification passed

**⏱️ Estimated Time:** 10 minutes

---

## Task T043: Apply Test Schema Migrations

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete

### Steps:

1. [ ] Open test Supabase project
2. [ ] Navigate to SQL Editor
3. [ ] Create new query
4. [ ] Copy migration SQL:

```bash
# Linux (copy to clipboard)
cat supabase/migrations/20250000000000_test_schema_functions.sql | xclip -selection clipboard

# macOS
cat supabase/migrations/20250000000000_test_schema_functions.sql | pbcopy

# Windows
Get-Content supabase/migrations/20250000000000_test_schema_functions.sql | Set-Clipboard

# Or just view the file
cat supabase/migrations/20250000000000_test_schema_functions.sql
```

5. [ ] Paste into SQL Editor
6. [ ] Click "Run"
7. [ ] Verify success (should see "Success. No rows returned")

### Verification Query:

Run this in SQL Editor to verify functions exist:

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%test%'
ORDER BY routine_name;
```

Expected results:
- [ ] `cleanup_orphaned_test_schemas`
- [ ] `clone_schema_structure`
- [ ] `create_test_schema`
- [ ] `drop_test_schema`
- [ ] `list_test_schemas`

### Local Test:

```bash
cd /home/jek/Downloads/cosplay-tracker
bun test:verify
# Should show: "✓ All test schema functions are available"
```

8. [ ] All 5 functions verified

**⏱️ Estimated Time:** 5 minutes

---

## Task T044: Configure GitHub Actions Secrets

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete

### Steps:

1. [ ] Go to GitHub repository
2. [ ] Click Settings → Secrets and variables → Actions
3. [ ] Add secret: `SUPABASE_TEST_URL`
   - Name: `SUPABASE_TEST_URL`
   - Value: (from T042)
4. [ ] Add secret: `SUPABASE_TEST_KEY`
   - Name: `SUPABASE_TEST_KEY`
   - Value: (from T042)

### Verification:

5. [ ] Both secrets appear in "Repository secrets" list
6. [ ] Make a test commit to trigger workflows:

```bash
cd /home/jek/Downloads/cosplay-tracker
echo "# Test Environment Setup Complete" >> docs/MANUAL_SETUP_CHECKLIST.md
git add docs/MANUAL_SETUP_CHECKLIST.md
git commit -m "docs: mark test environment setup milestone"
git push
```

7. [ ] Go to GitHub Actions tab
8. [ ] Verify workflows start running
9. [ ] Check workflow logs show secrets are available (they'll be partially redacted)

**⏱️ Estimated Time:** 5 minutes

---

## Task T045: Deploy Staging Environment

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete

### Option Selected:
- [ ] Cloudflare Pages (Recommended)
- [ ] Vercel
- [ ] Local Only (Development)

### Option A: Cloudflare Pages

1. [ ] Go to https://dash.cloudflare.com/
2. [ ] Navigate to Workers & Pages
3. [ ] Click "Create application" → "Pages"
4. [ ] Connect GitHub repository
5. [ ] Configure build:
   - Build command: `bun run build`
   - Build output: `build`
   - Root directory: `/`
6. [ ] Add environment variables:
   - `PUBLIC_SUPABASE_URL`: (production Supabase URL)
   - `PUBLIC_SUPABASE_ANON_KEY`: (production key)
7. [ ] Click "Save and Deploy"
8. [ ] Wait for deployment (~2-3 minutes)
9. [ ] Copy staging URL: _________________________________________________

### Option B: Vercel

1. [ ] Go to https://vercel.com/dashboard
2. [ ] Click "Add New..." → "Project"
3. [ ] Import GitHub repository
4. [ ] Configure:
   - Framework: SvelteKit
   - Build Command: `bun run build`
   - Output: `build`
5. [ ] Add environment variables (same as above)
6. [ ] Click "Deploy"
7. [ ] Copy staging URL: _________________________________________________

### Update .env.test:

```bash
nano .env.test
# Update TEST_BASE_URL with your staging URL
```

10. [ ] .env.test updated with staging URL

### Verification:

```bash
# Test staging URL
curl -I <your-staging-url>
# Should return 200 OK
```

11. [ ] Staging environment accessible
12. [ ] Application loads without errors

**⏱️ Estimated Time:** 10-15 minutes

---

## Task T041: Configure Branch Protection Rules

**Status:** [ ] Not Started | [ ] In Progress | [ ] Complete

### Steps:

1. [ ] Go to GitHub repository
2. [ ] Click Settings → Branches
3. [ ] Click "Add rule"
4. [ ] Branch name pattern: `main`
5. [ ] Enable "Require status checks to pass before merging"
6. [ ] Enable "Require branches to be up to date before merging"
7. [ ] Search and select status checks:
   - [ ] `Run Unit Tests / test`
   - [ ] `Run E2E Tests / test`
   - [ ] `Run Integration Tests / test`
8. [ ] (Optional) Enable "Require a pull request before merging"
   - Required approvals: 1
9. [ ] (Optional) Enable "Require conversation resolution"
10. [ ] Click "Create"

### Verification:

```bash
# Try to push directly to main (should fail)
git checkout main
git pull
echo "test" >> test.txt
git add test.txt
git commit -m "test: branch protection"
git push origin main
# Should see: "required status checks are expected"
```

11. [ ] Branch protection is enforced
12. [ ] Can only merge via pull request

**⏱️ Estimated Time:** 5 minutes

---

## Final Verification

After completing all tasks, run the comprehensive verification:

```bash
cd /home/jek/Downloads/cosplay-tracker
bun test:verify
```

### Expected Output:

```
✓ All checks passed!

Your test environment is fully configured and ready to use.

Next steps:
  1. Start writing tests as you build features
  2. Run tests locally: bun test
  3. Push to GitHub to trigger CI/CD
```

### Manual Checks:

- [ ] .env.test file exists with correct values
- [ ] Supabase test project is accessible
- [ ] All 5 SQL functions are created
- [ ] GitHub secrets are configured
- [ ] Staging environment is deployed
- [ ] Branch protection is enabled
- [ ] `bun test:verify` passes all checks

---

## Completion Summary

**Date Started:** ___________________  
**Date Completed:** ___________________

### Tasks Completed:
- [ ] T042: Test Supabase Project
- [ ] T043: SQL Migrations
- [ ] T044: GitHub Secrets
- [ ] T045: Staging Environment
- [ ] T041: Branch Protection

### Total Time: ___________ minutes

---

## Next Steps

Now that the test environment is complete:

1. **Start Building Features**
   - Implement authentication
   - Build project management
   - Create task system

2. **Write Tests As You Go**
   - Follow test-first development
   - Write E2E test → Fail → Implement → Pass
   - Use factories and POMs from infrastructure

3. **Monitor CI/CD**
   - Check GitHub Actions on every push
   - Review flaky test reports
   - Maintain 80%+ coverage

4. **Refer to Documentation**
   - `TESTING.md` - Developer guide
   - `docs/TEST_ENVIRONMENT_SETUP.md` - Detailed setup instructions
   - `tests/quarantine/README.md` - Flaky test management

---

## Troubleshooting

If you encounter issues during setup:

1. **Verification script fails**
   ```bash
   bun test:verify
   # Review specific check that failed
   ```

2. **Supabase connection errors**
   ```bash
   # Test credentials manually
   curl <SUPABASE_TEST_URL>/rest/v1/
   ```

3. **GitHub Actions not running**
   - Check .github/workflows/ files exist
   - Verify secrets are at repository level (not environment)
   - Re-run failed workflows after fixing

4. **Staging deployment fails**
   - Check build logs for errors
   - Verify environment variables are set
   - Test build locally: `bun run build`

**Need Help?** Review `docs/TEST_ENVIRONMENT_SETUP.md` for detailed troubleshooting.

---

**✅ Once all tasks are complete, you're ready to start testing! 🎉**

