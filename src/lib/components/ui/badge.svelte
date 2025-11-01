<script lang="ts">
  import { cva, type VariantProps } from 'class-variance-authority'
  import { cn } from '$lib/utils.js'

  const badgeVariants = cva(
    'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden h-[22px]',
    {
      variants: {
        variant: {
          default:
            'border-transparent bg-[var(--theme-primary)] text-white [a&]:hover:bg-[var(--theme-primary-hover)]',
          secondary:
            'border-transparent bg-[color-mix(in_srgb,var(--theme-muted)_30%,transparent)] text-[var(--theme-foreground)] border-[color-mix(in_srgb,var(--theme-muted)_40%,transparent)] [a&]:hover:bg-[color-mix(in_srgb,var(--theme-muted)_40%,transparent)]',
          destructive:
            'border-transparent bg-[var(--theme-error)] text-white [a&]:hover:bg-[color-mix(in_srgb,var(--theme-error)_90%,black)] focus-visible:ring-[var(--theme-error)]/20 dark:focus-visible:ring-[var(--theme-error)]/40',
          outline:
            'border-[var(--theme-border)] bg-transparent text-[var(--theme-foreground)] [a&]:hover:bg-[var(--theme-sidebar-hover)] [a&]:hover:text-[var(--theme-foreground)]',
        },
      },
      defaultVariants: {
        variant: 'default',
      },
    },
  )

  interface BadgeProps {
    variant?: VariantProps<typeof badgeVariants>['variant']
    element?: 'span' | 'a'
    class?: string
    href?: string
  }

  let {
    variant = 'default',
    element = 'span',
    class: className = '',
    href,
    children,
    ...restProps
  }: BadgeProps & { children?: any } = $props()

  // Determine the element type based on props
  const elementType = $derived(href ? 'a' : element)
</script>

{#if elementType === 'a'}
  <a
    {href}
    data-slot="badge"
    class={cn(badgeVariants({ variant }), className)}
    {...restProps}
  >
    {@render children?.()}
  </a>
{:else}
  <span
    data-slot="badge"
    class={cn(badgeVariants({ variant }), className)}
    {...restProps}
  >
    {@render children?.()}
  </span>
{/if}