<script lang="ts">
  import { cn } from '$lib/utils';
  import { Check } from 'lucide-svelte';
  
  interface Props {
    checked?: boolean;
    class?: string;
    onchange?: (checked: boolean) => void;
  }
  
  let { checked = false, class: className, onchange, ...restProps }: Props = $props();
  
  function handleChange() {
    checked = !checked;
    onchange?.(checked);
  }
</script>

<button
  type="button"
  role="checkbox"
  aria-checked={checked}
  class={cn(
    'peer border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
    checked && 'bg-primary text-primary-foreground border-primary',
    className
  )}
  onclick={handleChange}
  {...restProps}
>
  {#if checked}
    <Check class="size-3.5" />
  {/if}
</button>