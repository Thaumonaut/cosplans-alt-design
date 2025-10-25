<script lang="ts">
  import { DropdownDivider } from 'flowbite-svelte';
  import { cn } from '$lib/utils';

  interface Props {
    class?: string;
  }

  let { class: className }: Props = $props();
</script>

<DropdownDivider class={cn('bg-border -mx-1 my-1 h-px', className)} />