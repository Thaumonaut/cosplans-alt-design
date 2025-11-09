<script lang="ts">
	// This component is a wrapper that provides highlighting context
	// The actual highlighting is done in ThemePreview component
	interface Props {
		selectedVariable?: string;
	}

	let { selectedVariable }: Props = $props();
</script>

<slot {selectedVariable} />

