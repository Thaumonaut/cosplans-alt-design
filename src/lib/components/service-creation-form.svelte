<script lang="ts">
  import InlineTextEditor from './inline-text-editor.svelte';
  import { Button, Badge, Label, Input, Textarea, Select, Switch } from '$lib/components/ui';
  import { ImagePlus, X, Plus } from 'lucide-svelte';
  
  const serviceCategories = [
    'Wig Styling',
    'Photography',
    'Makeup',
    'Costume Making',
    'Prop Making',
    'Group Cosplay',
    'Consultation',
    'Other',
  ];
  
  let title = $state('');
  let description = $state('');
  let category = $state('');
  let minPrice = $state('');
  let maxPrice = $state('');
  let turnaround = $state('');
  let tags = $state<string[]>([]);
  let newTag = $state('');
  let isActive = $state(true);
  let images = $state<string[]>([]);
  
  function handleAddTag() {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      tags = [...tags, newTag.trim()];
      newTag = '';
    }
  }
  
  function handleRemoveTag(tagToRemove: string) {
    tags = tags.filter((tag) => tag !== tagToRemove);
  }
  
  function handleImageUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
      images = [...images, ...newImages];
    }
  }
  
  function handleRemoveImage(index: number) {
    images = images.filter((_, i) => i !== index);
  }
  
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTag();
    }
  }
</script>

<div class="space-y-8">
  <!-- Service Title -->
  <div class="space-y-2">
    <Label class="text-xs uppercase tracking-wide text-muted-foreground">Service Title</Label>
    <InlineTextEditor
      bind:value={title}
      placeholder="Enter service title..."
      variant="title"
      class="text-2xl"
    />
  </div>

  <!-- Category -->
  <div class="space-y-2">
    <Label class="text-xs uppercase tracking-wide text-muted-foreground">Category</Label>
    <Select bind:value={category}>
      <option value="" disabled>Select a category</option>
      {#each serviceCategories as cat}
        <option value={cat.toLowerCase().replace(/\s+/g, '-')}>
          {cat}
        </option>
      {/each}
    </Select>
  </div>

  <!-- Description -->
  <div class="space-y-2">
    <Label class="text-xs uppercase tracking-wide text-muted-foreground">Description</Label>
    <Textarea
      bind:value={description}
      placeholder="Describe your service in detail..."
      class="min-h-32 resize-none"
    />
  </div>

  <!-- Pricing -->
  <div class="space-y-2">
    <Label class="text-xs uppercase tracking-wide text-muted-foreground">Pricing Range</Label>
    <div class="flex items-center gap-4">
      <div class="flex-1">
        <Input
          type="number"
          bind:value={minPrice}
          placeholder="Min price"
          class="w-full"
        />
      </div>
      <span class="text-muted-foreground">to</span>
      <div class="flex-1">
        <Input
          type="number"
          bind:value={maxPrice}
          placeholder="Max price"
          class="w-full"
        />
      </div>
    </div>
  </div>

  <!-- Turnaround Time -->
  <div class="space-y-2">
    <Label class="text-xs uppercase tracking-wide text-muted-foreground">Turnaround Time</Label>
    <Input
      bind:value={turnaround}
      placeholder="e.g., 3-5 days, 1-2 weeks"
    />
  </div>

  <!-- Tags -->
  <div class="space-y-2">
    <Label class="text-xs uppercase tracking-wide text-muted-foreground">Tags</Label>
    <div class="flex flex-wrap gap-2">
      {#each tags as tag (tag)}
        <Badge variant="secondary" class="gap-1">
          {tag}
          <button onclick={() => handleRemoveTag(tag)} class="ml-1 hover:text-destructive">
            <X class="size-3" />
          </button>
        </Badge>
      {/each}
    </div>
    <div class="flex gap-2">
      <Input
        bind:value={newTag}
        onkeydown={handleKeyDown}
        placeholder="Add a tag..."
        class="flex-1"
      />
      <Button type="button" size="sm" variant="outline" onclick={handleAddTag}>
        <Plus class="size-4" />
      </Button>
    </div>
  </div>

  <!-- Portfolio Images -->
  <div class="space-y-2">
    <Label class="text-xs uppercase tracking-wide text-muted-foreground">Portfolio Images</Label>
    <div class="grid grid-cols-3 gap-4">
      {#each images as image, index (index)}
        <div class="group relative aspect-square overflow-hidden rounded-lg">
          <img
            src={image || '/placeholder.svg'}
            alt={`Portfolio ${index + 1}`}
            class="size-full object-cover"
          />
          <button
            onclick={() => handleRemoveImage(index)}
            class="absolute right-2 top-2 rounded-full bg-destructive p-1 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <X class="size-4 text-destructive-foreground" />
          </button>
        </div>
      {/each}
      <label class="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50">
        <ImagePlus class="size-8 text-muted-foreground" />
        <span class="text-xs text-muted-foreground">Add Image</span>
        <input type="file" accept="image/*" multiple onchange={handleImageUpload} class="hidden" />
      </label>
    </div>
  </div>

  <!-- Active Status -->
  <div class="flex items-center justify-between rounded-lg border p-4">
    <div class="space-y-0.5">
      <Label class="text-sm font-medium">Active Service</Label>
      <p class="text-xs text-muted-foreground">Make this service visible in the marketplace</p>
    </div>
    <Switch bind:checked={isActive} />
  </div>

  <!-- Actions -->
  <div class="flex gap-3">
    <Button class="flex-1">Create Service</Button>
    <Button variant="outline" class="flex-1 bg-transparent">
      Save as Draft
    </Button>
  </div>
</div>