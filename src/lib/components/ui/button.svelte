<script lang="ts">
  import { cva, type VariantProps } from 'class-variance-authority'
  import { cn } from '$lib/utils.js'
  
  const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    {
      variants: {
        variant: {
          default: 'bg-primary text-primary-foreground hover:bg-primary/90',
          destructive:
            'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
          outline:
            'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
          secondary:
            'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          ghost:
            'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
          link: 'text-primary underline-offset-4 hover:underline',
        },
        size: {
          default: 'h-9 px-4 py-2 has-[>svg]:px-3',
          sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
          lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
          icon: 'size-9',
          'icon-sm': 'size-8',
          'icon-lg': 'size-10',
        },
      },
      defaultVariants: {
        variant: 'default',
        size: 'default',
      },
    },
  )

  interface ButtonProps {
    variant?: VariantProps<typeof buttonVariants>['variant']
    size?: VariantProps<typeof buttonVariants>['size']
    element?: 'button' | 'a'
    class?: string
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
    href?: string
    onclick?: (event: MouseEvent) => void
    onkeydown?: (event: KeyboardEvent) => void
    onkeyup?: (event: KeyboardEvent) => void
    onfocus?: (event: FocusEvent) => void
    onblur?: (event: FocusEvent) => void
  }

  let {
    variant = 'default',
    size = 'default',
    element = 'button',
    class: className = '',
    disabled = false,
    type = 'button',
    href,
    onclick,
    children,
    ...restProps
  }: ButtonProps & { children?: any } = $props()

  // Determine the element type based on props
  const elementType = $derived(href ? 'a' : element)
  
      // Wrap onclick handler
      function handleClick(e: MouseEvent) {
        if (!disabled && onclick) {
          onclick(e)
        }
      }
</script>

{#if elementType === 'a'}
  <a
    {href}
    data-slot="button"
    class={cn(buttonVariants({ variant, size, class: className }))}
    onclick={handleClick}
    {...restProps}
  >
    {@render children?.()}
  </a>
{:else}
  <button
    {type}
    {disabled}
    data-slot="button"
    class={cn(buttonVariants({ variant, size, class: className }))}
    onclick={handleClick}
    {...restProps}
  >
    {@render children?.()}
  </button>
{/if}