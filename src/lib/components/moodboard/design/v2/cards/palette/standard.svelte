<script lang="ts">
  import VariantCard from "../_shared/VariantCard.svelte";
  import type { CardDescriptor } from "../types";

  let { card }: { card: CardDescriptor } = $props();
</script>

<VariantCard {card} />
