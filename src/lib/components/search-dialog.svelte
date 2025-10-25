<script lang="ts">
  import { Search } from 'lucide-svelte';
  import { Button, Dialog, Input } from '$lib/components/ui';

  interface Props {
    placeholder?: string;
  }

  let { placeholder = "Search..." }: Props = $props();
  let open = $state(false);
</script>

<Dialog bind:open>
  <Button variant="outline" size="icon" slot="trigger">
    <Search class="size-5" />
  </Button>
  
  <div slot="content" class="sm:max-w-[600px]">
    <div class="mb-4">
      <h2 class="text-lg font-semibold">Search</h2>
    </div>
    <div class="relative">
      <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input {placeholder} class="pl-9" autofocus />
    </div>
    <div class="mt-4 text-sm text-muted-foreground">
      <p>Start typing to search...</p>
    </div>
  </div>
</Dialog>