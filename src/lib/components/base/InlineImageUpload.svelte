<script lang="ts">
  import { get } from 'svelte/store'
  import { processImage } from '$lib/utils/image'
  import { uploadImageToStorage } from '$lib/utils/storage'
  import { currentTeam } from '$lib/stores/teams'

  interface Props {
    images: string[]
    editable?: boolean
    onSave: (images: string[]) => Promise<void>
    multiple?: boolean
    folder?: string // Optional folder path in storage (defaults to 'ideas')
  }

  let { images = $bindable([]), editable = true, onSave, multiple = false, folder = 'ideas' }: Props = $props()

  let isUploading = $state(false)
  let error = $state<string | null>(null)
  let dragActive = $state(false)
  let uploadProgress = $state<number>(0)

  async function handleFileSelect(files: FileList | null) {
    if (!files || !editable) return
    
    // Get current team ID
    const team = get(currentTeam)
    if (!team) {
      error = 'No team selected. Please select a team first.'
      return
    }

    isUploading = true
    error = null
    uploadProgress = 0
    try {
      const newUrls: string[] = []
      const filesArray = Array.from(files)
      const totalFiles = filesArray.length

      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i]
        
        // Process the image (compress/resize)
        const processed = await processImage(file)
        
        // Upload the display version to Supabase Storage with team ID
        const result = await uploadImageToStorage(processed.display, folder, team.id)
        
        // Use the public URL from Supabase Storage
        newUrls.push(result.url)
        
        // Update progress
        uploadProgress = ((i + 1) / totalFiles) * 100
      }

      const updated = multiple ? [...images, ...newUrls] : newUrls
      await onSave(updated)
    } catch (err: any) {
      error = err?.message || 'Upload failed'
      console.error('Upload error:', err)
    } finally {
      isUploading = false
      uploadProgress = 0
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
      <div class="space-y-2">
        <div>Uploading... {Math.round(uploadProgress)}%</div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-blue-600 h-2 rounded-full transition-all" style="width: {uploadProgress}%"></div>
        </div>
      </div>
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

