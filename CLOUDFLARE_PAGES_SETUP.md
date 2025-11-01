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
2. The `wrangler.jsonc` file is for Cloudflare Workers, not Pages
3. For Pages, you don't need wrangler - just connect the GitHub repo and set the build settings above

## Troubleshooting

If deployment fails:
- Check that build output directory is `.svelte-kit/cloudflare`
- Verify Node.js version is 22 or later
- Check build logs in Cloudflare dashboard for specific errors
- Ensure all environment variables are set

