/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Use new theme system variables with fallback to old HSL variables
        background: 'var(--theme-background, hsl(var(--background)))',
        foreground: 'var(--theme-foreground, hsl(var(--foreground)))',
        card: 'var(--theme-card-bg, hsl(var(--card)))',
        'card-foreground': 'var(--theme-foreground, hsl(var(--card-foreground)))',
        popover: 'var(--theme-popover, hsl(var(--popover)))',
        'popover-foreground': 'var(--theme-foreground, hsl(var(--popover-foreground)))',
        primary: 'var(--theme-primary, hsl(var(--primary)))',
        'primary-foreground': 'var(--theme-foreground, hsl(var(--primary-foreground)))',
        secondary: 'var(--theme-secondary, hsl(var(--secondary)))',
        'secondary-foreground': 'var(--theme-foreground, hsl(var(--secondary-foreground)))',
        muted: 'var(--theme-muted, hsl(var(--muted)))',
        'muted-foreground': 'var(--theme-sidebar-muted, hsl(var(--muted-foreground)))',
        accent: 'var(--theme-interactive-hover, var(--theme-accent, hsl(var(--accent))))',
        'accent-foreground': 'var(--theme-foreground, hsl(var(--accent-foreground)))',
        'interactive-hover': 'var(--theme-interactive-hover, rgba(237, 233, 254, 0.6))',
        'interactive-active': 'var(--theme-interactive-active, rgba(221, 214, 254, 0.7))',
        destructive: 'var(--theme-error, hsl(var(--destructive)))',
        'destructive-foreground': 'var(--theme-foreground, hsl(var(--destructive-foreground)))',
        border: 'var(--theme-border, hsl(var(--border)))',
        input: 'var(--theme-input-bg, hsl(var(--input)))',
        ring: 'var(--theme-focus, hsl(var(--ring)))',
        'chart-1': 'var(--theme-primary, hsl(var(--chart-1)))',
        'chart-2': 'var(--theme-accent, hsl(var(--chart-2)))',
        'chart-3': 'var(--theme-success, hsl(var(--chart-3)))',
        'chart-4': 'var(--theme-warning, hsl(var(--chart-4)))',
        'chart-5': 'var(--theme-info, hsl(var(--chart-5)))',
        // Sidebar colors - use new theme variables
        sidebar: 'var(--theme-sidebar-bg, hsl(var(--sidebar)))',
        'sidebar-foreground': 'var(--theme-sidebar-text, hsl(var(--sidebar-foreground)))',
        'sidebar-primary': 'var(--theme-sidebar-accent, hsl(var(--sidebar-primary)))',
        'sidebar-primary-foreground': 'var(--theme-sidebar-text, hsl(var(--sidebar-primary-foreground)))',
        'sidebar-accent': 'var(--theme-sidebar-hover, hsl(var(--sidebar-accent)))',
        'sidebar-accent-foreground': 'var(--theme-sidebar-text, hsl(var(--sidebar-accent-foreground)))',
        'sidebar-active': 'var(--theme-sidebar-active, hsl(var(--sidebar-accent)))',
        'sidebar-active-foreground': 'var(--theme-sidebar-text, hsl(var(--sidebar-accent-foreground)))',
        'sidebar-border': 'var(--theme-sidebar-border, hsl(var(--sidebar-border)))',
        'sidebar-ring': 'var(--theme-sidebar-accent, hsl(var(--sidebar-ring)))',
        // Semantic colors from theme system
        success: 'var(--theme-success)',
        error: 'var(--theme-error)',
        warning: 'var(--theme-warning)',
        info: 'var(--theme-info)'
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    }
  },
  plugins: [require('flowbite/plugin')],
  safelist: [
    'sm:w-[600px]',
    'lg:w-[800px]',
    'sm:!w-[600px]',
    'lg:!w-[800px]'
  ]
}