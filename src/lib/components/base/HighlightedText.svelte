<script lang="ts">
  import { highlightMatches } from '$lib/utils/search-highlight'

  interface Props {
    text: string
    query?: string
  }

  let { text, query = '' }: Props = $props()

  const matches = $derived(highlightMatches(text, query))
</script>

{#each matches as match}
  {#if match.isMatch}
    <mark class="bg-yellow-200 dark:bg-yellow-800/50 px-0.5 rounded">{match.text}</mark>
  {:else}
    {match.text}
  {/if}
{/each}

