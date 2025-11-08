<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		// Redirect to new theme builder route
		goto('/theme-builder');
	});
</script>

<div class="p-6">
	<p>Redirecting to Theme Builder...</p>
</div>
