<script lang="ts">
  import { cn } from '$lib/utils';

  interface Props {
    class?: string;
    children?: any;
  }

  let { class: className, children }: Props = $props();
</script>

<div class={cn('relative flex w-full min-w-0 flex-col p-2', className)}>
  {@render children?.()}
</div>