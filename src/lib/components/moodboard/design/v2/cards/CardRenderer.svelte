<script lang="ts">
  import { resolveCardComponent } from "./registry";
  import type { CardDescriptor } from "./types";

  let { card }: { card: CardDescriptor } = $props();

  const component = $derived(resolveCardComponent(card.key));
</script>

{#if component}
  <svelte:component this={component} {card} />
{:else}
  <div
    class="col-span-1 row-span-2 rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-700"
  >
    Missing component for <code>{card.key}</code>
  </div>
{/if}
