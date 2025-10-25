<script lang="ts">
  import { cn } from '$lib/utils';

  interface Props {
    class?: string;
    children?: any;
  }

  let { class: className, children }: Props = $props();
</script>

<div class={cn('flex min-h-0 flex-1 flex-col gap-2 overflow-auto', className)}>
  {@render children?.()}
</div>