<script lang="ts">
  import CardRenderer from "$lib/components/moodboard/design/v2/cards/CardRenderer.svelte";
  import { cardRegistryKeys } from "$lib/components/moodboard/design/v2/cards/registry";
  import {
    assertCardCoverage,
    computeCoverage,
  } from "$lib/components/moodboard/design/v2/cards/coverage";
  import { designLabCards } from "$lib/components/moodboard/design/v2/spec/design-lab-card-fixtures";
  import { cardSystemV2CardKeys } from "$lib/components/moodboard/design/v2/spec/card-system-v2.inventory";

  const expectedKeys = [...cardSystemV2CardKeys];
  const registryKeys = [...cardRegistryKeys];
  const fixtureKeys = designLabCards.map((card) => card.key);

  const registryCoverage = computeCoverage(expectedKeys, registryKeys);
  const fixtureCoverage = computeCoverage(expectedKeys, fixtureKeys);

  let guardError = $state<string | null>(null);

  try {
    assertCardCoverage(expectedKeys, registryKeys);
    assertCardCoverage(expectedKeys, fixtureKeys);
  } catch (error) {
    guardError =
      error instanceof Error ? error.message : "Unknown coverage error";
  }
</script>

<div
  class="min-h-screen bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-100"
>
  <div
    class="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90"
  >
    <h1 class="text-xl font-semibold">Design Lab: Card System V2 Coverage</h1>
    <p class="mt-1 text-sm text-slate-600 dark:text-zinc-400">
      Inventory-driven gallery for per-variant Svelte component parity.
    </p>
  </div>

  {#if import.meta.env.DEV}
    <div class="mx-auto mt-4 max-w-7xl px-6">
      <div
        class="rounded-xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h2
          class="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-zinc-400"
        >
          Coverage Diagnostics (DEV)
        </h2>
        <div class="mt-3 grid gap-3 md:grid-cols-2">
          <div
            class="rounded-lg border border-slate-200 p-3 dark:border-zinc-700"
          >
            <p class="text-xs font-semibold uppercase text-slate-500">
              Registry
            </p>
            <p class="mt-1 text-sm">
              Expected: {expectedKeys.length} | Actual: {registryKeys.length}
            </p>
            <p class="text-sm">
              Missing: {registryCoverage.missing.length} | Extra: {registryCoverage
                .extra.length}
            </p>
          </div>
          <div
            class="rounded-lg border border-slate-200 p-3 dark:border-zinc-700"
          >
            <p class="text-xs font-semibold uppercase text-slate-500">
              Fixture
            </p>
            <p class="mt-1 text-sm">
              Expected: {expectedKeys.length} | Actual: {fixtureKeys.length}
            </p>
            <p class="text-sm">
              Missing: {fixtureCoverage.missing.length} | Extra: {fixtureCoverage
                .extra.length}
            </p>
          </div>
        </div>
        {#if guardError}
          <pre
            class="mt-3 overflow-x-auto rounded bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">{guardError}</pre>
        {/if}
      </div>
    </div>
  {/if}

  <main class="mx-auto max-w-7xl px-6 py-6">
    <div
      class="grid auto-rows-[110px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {#each designLabCards as card}
        <CardRenderer {card} />
      {/each}
    </div>
  </main>
</div>
