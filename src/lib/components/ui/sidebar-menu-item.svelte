<script lang="ts">
  import { cn } from '$lib/utils';

  interface Props {
    class?: string;
    children?: any;
  }

  let { class: className, children }: Props = $props();
</script>

<li class={cn('group/menu-item relative', className)}>
  {@render children?.()}
</li>