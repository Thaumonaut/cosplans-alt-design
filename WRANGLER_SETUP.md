# Wrangler Configuration Guide

This guide explains how to use the `wrangler.jsonc` configuration file for Cloudflare Workers/Pages deployment.

## Configuration Files

- **`wrangler.jsonc`** - Main Cloudflare configuration (committed to git)
- **`.dev.vars.example`** - Template for local development variables
- **`.dev.vars`** - Your local development variables (gitignored)

## Setting Up Environment Variables

### For Cloudflare Pages (Dashboard)

1. Go to your Cloudflare Pages project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add these variables:
   - `PUBLIC_SUPABASE_URL` = `https://your-project.supabase.co`
   - `PUBLIC_SUPABASE_ANON_KEY` = `your-anon-key`
   - `NODE_VERSION` = `22` (optional, for build environment)

### For Cloudflare Workers (Command Line)

Use the `wrangler secret put` command to securely store sensitive values:

```bash
# Set Supabase URL
wrangler secret put PUBLIC_SUPABASE_URL
# (wrangler will prompt you to enter the value)

# Set Supabase anonymous key
wrangler secret put PUBLIC_SUPABASE_ANON_KEY
# (wrangler will prompt you to enter the value)
```

**Note:** Secrets are encrypted and stored securely. They won't appear in your `wrangler.jsonc` file.

### For Local Development

1. **Copy the example file:**
   ```bash
   cp .dev.vars.example .dev.vars
   ```

2. **Edit `.dev.vars` with your credentials:**
   ```bash
   PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Run locally:**
   ```bash
   pnpm run build
   wrangler pages dev .svelte-kit/cloudflare
   ```

## Environment-Specific Configuration

The `wrangler.jsonc` file includes environment-specific settings:

- **`production`** - Production environment settings
- **`staging`** - Staging environment settings

To deploy to a specific environment:

```bash
# Deploy to production
wrangler pages deploy .svelte-kit/cloudflare --env production

# Deploy to staging  
wrangler pages deploy .svelte-kit/cloudflare --env staging
```

## Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

**Note:** The `PUBLIC_` prefix is required for SvelteKit to expose these variables to the client-side code.

## Optional Configuration

### Cloudflare KV (Key-Value Storage)

If you need to use Cloudflare KV, uncomment and configure in `wrangler.jsonc`:

```jsonc
"kv_namespaces": [
  { "binding": "CACHE", "id": "your-kv-namespace-id" }
]
```

Then create the namespace:
```bash
wrangler kv:namespace create "CACHE"
```

## Verification

To verify your configuration:

```bash
# Check wrangler can parse the config
wrangler pages project list

# Validate environment variables are set (for Workers)
wrangler secret list
```

## Security Notes

1. **Never commit secrets** - `.dev.vars` is gitignored
2. **Use `wrangler secret put`** for production secrets (Workers)
3. **Use Cloudflare Dashboard** for Pages environment variables
4. **Rotate keys regularly** - Update secrets if compromised

## Troubleshooting

### "Missing environment variable" error

- Ensure variables are set in Cloudflare Dashboard (Pages) or via `wrangler secret put` (Workers)
- For local development, verify `.dev.vars` exists and contains required variables
- Restart your dev server after adding/changing environment variables

### Wrangler can't find the config

- Ensure `wrangler.jsonc` is in the project root
- Verify the JSONC syntax is correct (comments are allowed)

### Build output not found

- Run `pnpm run build` first to generate `.svelte-kit/cloudflare/`
- Verify build output directory is `.svelte-kit/cloudflare` (not `build`)

