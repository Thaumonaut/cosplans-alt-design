<script lang="ts">
  import { ChevronRight, Home } from 'lucide-svelte'
  import { goto } from '$app/navigation'

  interface BreadcrumbItem {
    label: string
    href?: string
  }

  interface Props {
    items: BreadcrumbItem[]
    homeHref?: string
  }

  let { 
    items = [],
    homeHref = '/dashboard'
  }: Props = $props()

  function handleClick(item: BreadcrumbItem, isLast: boolean) {
    if (!isLast && item.href) {
      goto(item.href)
    }
  }
</script>

<nav class="flex items-center space-x-2 text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
  <a
    href={homeHref}
    onclick={(e) => {
      e.preventDefault()
      goto(homeHref)
    }}
    class="hover:text-foreground transition-colors"
    aria-label="Home"
  >
    <Home class="size-4" />
  </a>
  
  {#each items as item, index}
    <ChevronRight class="size-4" />
    {#if item.href && index < items.length - 1}
      <a
        href={item.href}
        onclick={(e) => {
          e.preventDefault()
          handleClick(item, false)
        }}
        class="hover:text-foreground transition-colors"
      >
        {item.label}
      </a>
    {:else}
      <span class="text-foreground font-medium">{item.label}</span>
    {/if}
  {/each}
</nav>

