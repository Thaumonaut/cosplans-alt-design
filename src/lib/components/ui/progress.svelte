<script lang="ts">
  import { cn } from '$lib/utils';
  
  interface Props {
    value?: number;
    class?: string;
  }
  
  let { value = 0, class: className, ...restProps }: Props = $props();
</script>

<div
  class={cn(
    'bg-primary/20 relative h-2 w-full overflow-hidden rounded-full',
    className
  )}
  {...restProps}
>
  <div
    class="bg-primary h-full w-full flex-1 transition-all"
    style="transform: translateX(-{100 - value}%)"
  ></div>
</div>