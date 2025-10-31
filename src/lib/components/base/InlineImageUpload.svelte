<script lang="ts">
  import { processImage } from '$lib/utils/image'

  interface Props {
    images: string[]
    editable?: boolean
    onSave: (images: string[]) => Promise<void>
    multiple?: boolean
  }

  let { images = $bindable([]), editable = true, onSave, multiple = false }: Props = $props()

  let isUploading = $state(false)
  let error = $state<string | null>(null)
  let dragActive = $state(false)

  async function handleFileSelect(files: FileList | null) {
    if (!files || !editable) return
    isUploading = true
    error = null
    try {
      const newUrls: string[] = []
      for (const file of Array.from(files)) {
        const processed = await processImage(file)
        // TODO: upload to Supabase Storage and get URLs
        // For now, just store placeholder
        newUrls.push(URL.createObjectURL(file))
      }
      const updated = multiple ? [...images, ...newUrls] : newUrls
      await onSave(updated)
    } catch (err: any) {
      error = err?.message || 'Upload failed'
    } finally {
      isUploading = false
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    if (editable) dragActive = true
  }

  function handleDragLeave() {
    dragActive = false
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    dragActive = false
    if (e.dataTransfer?.files) {
      handleFileSelect(e.dataTransfer.files)
    }
  }
</script>

<div
  role="button"
  tabindex="0"
  class="border-2 border-dashed rounded p-4"
  class:border-blue-400={dragActive}
  class:border-gray-300={!dragActive}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
>
  <input
    type="file"
    accept="image/*"
    multiple={multiple}
    disabled={!editable || isUploading}
    onchange={(e) => handleFileSelect((e.target as HTMLInputElement)?.files)}
    class="hidden"
    id="image-upload"
  />
  <label for="image-upload" class="cursor-pointer block">
    {#if isUploading}
      Uploading...
    {:else}
      {images.length ? `Edit images (${images.length})` : 'Upload images'}
    {/if}
  </label>
</div>

{#if error}
  <span class="text-sm text-red-600">{error}</span>
{/if}

{#if images.length}
  <div class="grid grid-cols-3 gap-2 mt-2">
    {#each images as url}
      <img src={url} alt="Uploaded" class="w-full h-24 object-cover rounded" />
    {/each}
  </div>
{/if}

