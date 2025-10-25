<script lang="ts">
  import { cn } from '$lib/utils';

  interface Props {
    class?: string;
    children?: any;
  }

  let {
    class: className,
    children
  }: Props = $props();
</script>

<ul class={cn('group flex flex-1 list-none items-center justify-center gap-1', className)}>
  {@render children?.()}
</ul>