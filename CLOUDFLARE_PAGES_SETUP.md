# Cloudflare Pages Deployment Configuration

## Correct Build Settings

When setting up Cloudflare Pages in the dashboard, use these settings:

- **Build command**: `pnpm run build` (or `bun run build` if using bun)
- **Build output directory**: `.svelte-kit/cloudflare` ⚠️ **NOT `build`**
- **Root directory**: `/` (leave empty or use `/`)
- **Node.js version**: `22` (set via environment variable `NODE_VERSION`)

## Environment Variables

Add these in Cloudflare Pages dashboard under Settings → Environment Variables:

- `PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `NODE_VERSION`: `22` (if not set globally)

## Important Notes

1. The SvelteKit Cloudflare adapter outputs to `.svelte-kit/cloudflare/`, not `build/`
2. The `wrangler.jsonc` file is primarily for Cloudflare Workers, but also documents configuration
3. For Pages, environment variables are set in the dashboard (Settings → Environment Variables)
4. For Workers, use `wrangler secret put` command to set sensitive variables

## Using Wrangler for Local Development

If you want to test locally with Wrangler:

1. **Create `.dev.vars` file** (copy from `.dev.vars.example`):
   ```bash
   cp .dev.vars.example .dev.vars
   # Edit .dev.vars with your Supabase credentials
   ```

2. **Run locally with Wrangler**:
   ```bash
   pnpm run build
   wrangler pages dev .svelte-kit/cloudflare
   ```

3. **Set secrets for production** (Workers only):
   ```bash
   wrangler secret put PUBLIC_SUPABASE_URL
   wrangler secret put PUBLIC_SUPABASE_ANON_KEY
   ```

## Troubleshooting

If deployment fails:
- Check that build output directory is `.svelte-kit/cloudflare`
- Verify Node.js version is 22 or later
- Check build logs in Cloudflare dashboard for specific errors
- Ensure all environment variables are set

