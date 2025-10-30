# Quick Test Environment Setup Guide

**⏱️ Total Time: 30-45 minutes**

This is a condensed version of the setup process. For detailed instructions, see `TEST_ENVIRONMENT_SETUP.md`.

---

## 🚀 Quick Start (5 Steps)

### 1️⃣ Create Test Supabase Project (10 min)

```
1. Go to https://supabase.com/dashboard
2. Create new project: "cosplay-tracker-test"
3. Copy URL and anon key
4. Create .env.test with credentials
```

### 2️⃣ Apply SQL Migrations (5 min)

```
1. Open Supabase SQL Editor
2. Copy contents of: supabase/migrations/20250000000000_test_schema_functions.sql
3. Paste and run
4. Verify 5 functions created
```

### 3️⃣ Configure GitHub Secrets (5 min)

```
1. GitHub repo → Settings → Secrets → Actions
2. Add SUPABASE_TEST_URL
3. Add SUPABASE_TEST_KEY
```

### 4️⃣ Deploy Staging (10 min)

**Cloudflare Pages (Recommended):**
```
1. https://dash.cloudflare.com/ → Workers & Pages
2. Create Pages → Connect GitHub repo
3. Build: "bun run build", Output: "build"
4. Add env vars (SUPABASE URL/KEY)
5. Deploy
```

**OR Vercel:**
```
1. https://vercel.com/dashboard → New Project
2. Import GitHub repo
3. Framework: SvelteKit
4. Add env vars
5. Deploy
```

### 5️⃣ Branch Protection (5 min)

```
1. GitHub → Settings → Branches
2. Add rule for "main"
3. Require status checks:
   - Run Unit Tests
   - Run E2E Tests  
   - Run Integration Tests
4. Save
```

---

## ✅ Verification

```bash
cd /home/jek/Downloads/cosplay-tracker

# Run comprehensive verification
bun test:verify

# Expected: "✓ All checks passed!"
```

---

## 📋 Checklist

- [ ] Supabase test project created
- [ ] .env.test file configured
- [ ] SQL functions deployed (5 functions)
- [ ] GitHub secrets added (2 secrets)
- [ ] Staging environment deployed
- [ ] Branch protection enabled
- [ ] `bun test:verify` passes

---

## 🆘 Quick Troubleshooting

**Connection failed?**
```bash
# Test Supabase connection
curl <SUPABASE_TEST_URL>/rest/v1/
```

**Functions missing?**
```sql
-- Run in Supabase SQL Editor
SELECT routine_name FROM information_schema.routines
WHERE routine_name LIKE '%test%';
```

**Secrets not working?**
- Must be at repository level (not environment)
- Names must match exactly: `SUPABASE_TEST_URL`, `SUPABASE_TEST_KEY`

---

## 📚 Resources

- **Detailed Guide:** `docs/TEST_ENVIRONMENT_SETUP.md`
- **Progress Tracker:** `docs/MANUAL_SETUP_CHECKLIST.md`
- **Testing Guide:** `TESTING.md`
- **Verification Script:** `bun test:verify`

---

## 🎉 Ready to Test!

Once setup is complete:

```bash
# Write your first test
mkdir -p tests/e2e/example
nano tests/e2e/example/sample.spec.ts

# Run it
bun test:e2e

# Push and watch CI/CD run
git push
```

Happy testing! 🚀

