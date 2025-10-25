<script lang="ts">
  import { cn } from '$lib/utils';

  interface Props {
    class?: string;
    children?: any;
  }

  let { class: className, children }: Props = $props();
</script>

<div class={cn('flex flex-col gap-2 text-center sm:text-left', className)}>
  {@render children?.()}
</div>