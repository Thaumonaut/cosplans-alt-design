<script lang="ts">
  import { cn } from '$lib/utils';

  interface Props {
    class?: string;
    children?: any;
  }

  let { class: className, children }: Props = $props();
</script>

<div class={cn('w-full text-sm', className)}>
  {@render children?.()}
</div>