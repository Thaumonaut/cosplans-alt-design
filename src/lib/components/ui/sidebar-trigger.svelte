<script lang="ts">
  import { PanelLeft } from 'lucide-svelte';
  import { Button } from '$lib/components/ui';
  import { getSidebarContext } from './sidebar-context.svelte.ts';
  import { cn } from '$lib/utils';

  interface Props {
    class?: string;
    size?: 'default' | 'sm' | 'lg' | 'icon';
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  }

  let { 
    class: className,
    size = 'icon',
    variant = 'ghost'
  }: Props = $props();

  let sidebarContext: ReturnType<typeof getSidebarContext> | null = null;
  
  try {
    sidebarContext = getSidebarContext();
  } catch {
    // Context not available, component will be hidden
  }

  function handleClick() {
    if (sidebarContext) {
      sidebarContext.toggleSidebar();
    }
  }
</script>

<Button 
  {variant} 
  {size} 
  class={cn('md:hidden', className)}
  onclick={handleClick}
  aria-label="Toggle sidebar"
>
  <PanelLeft class="size-4" />
</Button>