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

<nav class={cn('relative flex max-w-max flex-1 items-center justify-center', className)}>
  {@render children?.()}
</nav>