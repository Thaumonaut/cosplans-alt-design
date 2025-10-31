<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'

  onMount(() => {
    goto('/ideas')
  })
</script>

<svelte:head>
  <title>Planning - Cosplay Tracker</title>
</svelte:head>

<div class="p-6">
  <p>Redirecting to Ideas...</p>
</div>