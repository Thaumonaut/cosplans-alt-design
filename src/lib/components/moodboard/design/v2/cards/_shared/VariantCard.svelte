<script lang="ts">
  import { sizeClasses } from "../layout";
  import type { CardDescriptor } from "../types";

  let { card }: { card: CardDescriptor } = $props();

  const sizeClass = $derived(sizeClasses[card.size] ?? sizeClasses.medium);
</script>

<div
  class="{sizeClass} bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-700 p-4 shadow-sm hover:shadow-md transition-shadow"
>
  <div class="flex items-center justify-between gap-2 mb-3">
    <span
      class="text-[10px] font-semibold uppercase tracking-wide text-slate-500"
      >{card.sectionLabel}</span
    >
    <span
      class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700"
      >{card.key}</span
    >
  </div>
  <h3
    class="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight"
  >
    {card.familyLabel}
  </h3>
  <p class="text-xs text-slate-500 mt-1">{card.variantLabel}</p>
  <div
    class="mt-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-1"
  >
    <p><span class="font-medium">Family:</span> {card.family}</p>
    <p><span class="font-medium">Variant:</span> {card.variant}</p>
    <p><span class="font-medium">Fixture:</span> Design-lab inventory mock</p>
  </div>
</div>
