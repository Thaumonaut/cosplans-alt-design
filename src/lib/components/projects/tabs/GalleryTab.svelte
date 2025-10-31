<script lang="ts">
  import { Card, Button } from 'flowbite-svelte'
  import { Plus, ImageIcon, X, Upload } from 'lucide-svelte'
  import InlineImageUpload from '$lib/components/base/InlineImageUpload.svelte'
  import type { Project } from '$lib/types/domain/project'

  interface Props {
    project?: Project | null
    images: string[]
    editable?: boolean
    onUpdate?: (images: string[]) => Promise<void>
  }

  let { project, images, editable = true, onUpdate }: Props = $props()
</script>

<div class="mx-auto max-w-6xl space-y-6">
  <!-- Upload Section -->
  {#if editable && !images || images.length === 0}
    <div class="rounded-lg border-2 border-dashed bg-background p-8 text-center">
      <Upload class="mx-auto mb-4 size-12 text-muted-foreground" />
      <p class="mb-2 text-sm font-medium">Upload reference images</p>
      <p class="mb-4 text-xs text-muted-foreground">Drag and drop images here, or click to browse</p>
      {#if onUpdate}
        <InlineImageUpload
          images={images}
          editable={true}
          onSave={onUpdate}
          multiple={true}
        />
      {/if}
    </div>
  {:else if editable}
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Gallery</h2>
      {#if onUpdate}
        <div class="inline-block">
          <InlineImageUpload
            images={images}
            editable={true}
            onSave={onUpdate}
            multiple={true}
          />
        </div>
      {:else}
        <Button color="primary" size="sm" disabled>
          <Plus class="mr-2 size-4" />
          Add Images
        </Button>
      {/if}
    </div>
  {/if}

  <!-- Image Grid -->
  {#if images && images.length > 0}
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each images as imageUrl (imageUrl)}
        <div class="group relative aspect-square overflow-hidden rounded-lg bg-muted shadow-sm transition-all hover:shadow-md">
          <img src={imageUrl} alt="Reference" class="size-full object-cover" />
          {#if editable && onUpdate}
            <button
              onclick={async () => {
                const updated = images.filter(img => img !== imageUrl)
                await onUpdate?.(updated)
              }}
              class="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X class="size-4 text-destructive" />
            </button>
          {/if}
        </div>
      {/each}
    </div>
  {:else if !editable}
    <Card class="flex flex-col items-center justify-center py-12">
      <ImageIcon class="mb-4 size-12 text-muted-foreground opacity-50" />
      <p class="text-sm text-muted-foreground">No images</p>
    </Card>
  {/if}
</div>
