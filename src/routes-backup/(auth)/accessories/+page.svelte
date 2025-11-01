<script lang="ts">
  import { Plus, Filter, Grid3x3, List } from 'lucide-svelte';
  import { Button, Badge, DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '$lib/components/ui';
  import { onMount } from 'svelte';
  import { resourceService } from '$lib/api/services/resourceService';
  import { currentTeam } from '$lib/stores/teams';
  import { get } from 'svelte/store';

  interface Accessory {
    id: string;
    name: string;
    character: string;
    image: string;
    type: string;
    status: 'planning' | 'in-progress' | 'completed';
    materials: string[];
  }

  let accessories = $state<Accessory[]>([]);
  let loading = $state(true);

  const statusColors = {
    planning: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    "in-progress": "bg-primary/10 text-primary",
    completed: "bg-green-500/10 text-green-700 dark:text-green-400",
  };

  const typeColors = {
    headwear: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    jewelry: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
    eyewear: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    other: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  };

  let viewMode = $state<"grid" | "list">("grid");
  let filters = $state({
    type: [] as string[],
    status: [] as string[],
  });

  async function loadAccessories() {
    try {
      loading = true;
      const team = get(currentTeam);
      if (!team) {
        accessories = [];
        return;
      }

      const resources = await resourceService.list({ category: 'accessory' });
      
      accessories = resources.map(resource => {
        const metadata = resource.metadata as any;
        const material = metadata?.material || '';
        const materials = material ? [material] : [];
        
        let status: 'planning' | 'in-progress' | 'completed' = 'planning';
        if (resource.metadata && 'status' in resource.metadata) {
          const resourceStatus = (resource.metadata as any).status;
          if (resourceStatus === 'completed') status = 'completed';
          else if (resourceStatus === 'in-progress' || resourceStatus === 'acquired') status = 'in-progress';
        }

        return {
          id: resource.id,
          name: resource.name,
          character: 'Unknown',
          image: resource.images[0] || '/placeholder.svg',
          type: metadata?.accessoryType || 'other',
          status,
          materials,
        };
      });
    } catch (error) {
      console.error('Failed to load accessories:', error);
      accessories = [];
    } finally {
      loading = false;
    }
  }

  function toggleFilter(category: keyof typeof filters, value: string) {
    const currentFilters = filters[category];
    if (currentFilters.includes(value)) {
      filters[category] = currentFilters.filter((v) => v !== value);
    } else {
      filters[category] = [...currentFilters, value];
    }
  }

  const filteredAccessories = $derived(() => {
    let filtered = accessories;
    if (filters.type.length > 0) {
      filtered = filtered.filter(a => filters.type.includes(a.type));
    }
    if (filters.status.length > 0) {
      filtered = filtered.filter(a => filters.status.includes(a.status));
    }
    return filtered;
  });

  onMount(() => {
    loadAccessories();
    const unsubscribe = currentTeam.subscribe(() => {
      loadAccessories();
    });
    return unsubscribe;
  });
</script>

<svelte:head>
  <title>Accessories - Cosplay Tracker</title>
</svelte:head>

<div class="p-6">
  <!-- Header with actions -->
  <div class="mb-8 flex items-center justify-between">
    <div>
      <h1 class="text-balance text-3xl font-bold leading-tight">Accessories</h1>
      <p class="text-pretty text-muted-foreground">
        {#if loading}
          Loading accessories...
        {:else}
          {filteredAccessories.length} {filteredAccessories.length === 1 ? 'accessory' : 'accessories'} across all projects
        {/if}
      </p>
    </div>
    
    <div class="flex items-center gap-2">
      <Button variant="outline" size="icon" onclick={() => viewMode = viewMode === "grid" ? "list" : "grid"}>
        {#if viewMode === "grid"}
          <List class="size-5" />
        {:else}
          <Grid3x3 class="size-5" />
        {/if}
      </Button>
      
      <DropdownMenu>
        <Button variant="outline" size="icon" slot="trigger">
          <Filter class="size-5" />
        </Button>
        
        <div slot="content" class="w-56">
          <DropdownMenuLabel>Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {#each ["headwear", "jewelry", "eyewear", "other"] as type}
            <DropdownMenuItem 
              class="capitalize cursor-pointer"
              onclick={() => toggleFilter("type", type)}
            >
              <input 
                type="checkbox" 
                checked={filters.type.includes(type)}
                class="mr-2"
                readonly
              />
              {type}
            </DropdownMenuItem>
          {/each}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {#each ["planning", "in-progress", "completed"] as status}
            <DropdownMenuItem 
              class="capitalize cursor-pointer"
              onclick={() => toggleFilter("status", status)}
            >
              <input 
                type="checkbox" 
                checked={filters.status.includes(status)}
                class="mr-2"
                readonly
              />
              {status.replace("-", " ")}
            </DropdownMenuItem>
          {/each}
        </div>
      </DropdownMenu>
      
      <Button size="icon">
        <Plus class="size-5" />
      </Button>
    </div>
  </div>

  <!-- Accessories Grid/List View -->
  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="mb-4 inline-block size-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p class="text-sm text-muted-foreground">Loading accessories...</p>
      </div>
    </div>
  {:else if filteredAccessories.length === 0}
    <div class="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 py-16">
      <p class="mb-2 text-lg font-medium text-muted-foreground">No accessories found</p>
      <p class="mb-6 text-center text-sm text-muted-foreground max-w-md">
        Get started by creating your first accessory resource.
      </p>
    </div>
  {:else if viewMode === "grid"}
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {#each filteredAccessories as accessory (accessory.id)}
        <div class="group overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg">
          <div class="relative aspect-square overflow-hidden bg-muted">
            <img
              src={accessory.image || "/placeholder.svg"}
              alt={accessory.name}
              class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div class="absolute right-2 top-2">
              <Badge class={typeColors[accessory.type]} variant="secondary">
                {accessory.type}
              </Badge>
            </div>
          </div>
          <div class="p-4">
            <h3 class="mb-1 line-clamp-1 font-semibold leading-snug">{accessory.name}</h3>
            <p class="mb-3 text-sm text-muted-foreground">{accessory.character}</p>

            <div class="mb-3">
              <p class="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Materials
              </p>
              <div class="flex flex-wrap gap-1">
                {#each accessory.materials as material}
                  <Badge variant="outline" class="text-xs">
                    {material}
                  </Badge>
                {/each}
              </div>
            </div>

            <Badge class={statusColors[accessory.status]} variant="secondary">
              {accessory.status.replace("-", " ")}
            </Badge>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="space-y-4">
      {#each filteredAccessories as accessory (accessory.id)}
        <div class="flex gap-4 overflow-hidden rounded-xl border bg-card p-4 transition-all hover:shadow-lg">
          <div class="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
            <img
              src={accessory.image || "/placeholder.svg"}
              alt={accessory.name}
              class="size-full object-cover"
            />
          </div>
          <div class="flex flex-1 flex-col gap-2">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h3 class="font-semibold leading-snug">{accessory.name}</h3>
                <p class="text-sm text-muted-foreground">{accessory.character}</p>
              </div>
              <div class="flex gap-2">
                <Badge class={typeColors[accessory.type]} variant="secondary">
                  {accessory.type}
                </Badge>
                <Badge class={statusColors[accessory.status]} variant="secondary">
                  {accessory.status.replace("-", " ")}
                </Badge>
              </div>
            </div>

            <div>
              <p class="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Materials
              </p>
              <div class="flex flex-wrap gap-1">
                {#each accessory.materials as material}
                  <Badge variant="outline" class="text-xs">
                    {material}
                  </Badge>
                {/each}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>