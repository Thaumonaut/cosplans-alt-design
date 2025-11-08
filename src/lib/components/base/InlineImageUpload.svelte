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
        
        try {
          // Process the image (compress/resize) - validates size and type
          const processed = await processImage(file)
          
          // Upload the display version to Supabase Storage with team ID
          const result = await uploadImageToStorage(processed.display, folder, team.id)
          
          // Use the public URL from Supabase Storage
          newUrls.push(result.url)
          
          // Update progress
          uploadProgress = ((i + 1) / totalFiles) * 100
        } catch (err: any) {
          // Re-throw with clearer error message for image validation errors
          if (err.name === 'ImageSizeError' || err.message?.includes('10MB')) {
            throw new Error(`Image "${file.name}": ${err.message}`)
          }
          throw err
        }
      }

      const updated = multiple ? [...images, ...newUrls] : newUrls
      await onSave(updated)
    } catch (err: any) {
      // Show user-friendly error messages
      if (err.message) {
        error = err.message
      } else if (err.name === 'ImageSizeError') {
        error = err.message || 'Image size exceeds the maximum allowed size of 10MB'
      } else {
        error = 'Upload failed. Please try again.'
      }
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
  class="border-2 border-dashed rounded-lg p-8 bg-[var(--theme-input-bg)] backdrop-blur-sm transition-colors"
  class:border-[var(--theme-primary)]={dragActive}
  class:border-[var(--theme-border)]={!dragActive}
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
  <label for="image-upload" class="cursor-pointer block text-center">
    {#if isUploading}
      <div class="space-y-2">
        <div class="text-[var(--theme-foreground)]">Uploading... {Math.round(uploadProgress)}%</div>
        <div class="w-full bg-[var(--theme-muted)] rounded-full h-2">
          <div class="bg-[var(--theme-primary)] h-2 rounded-full transition-all" style="width: {uploadProgress}%"></div>
        </div>
      </div>
    {:else}
      <div class="flex flex-col items-center gap-2">
        <svg class="size-12 text-[var(--theme-muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <span class="text-sm text-[var(--theme-muted-foreground)]">{images.length ? `Edit images (${images.length})` : 'Upload images'}</span>
      </div>
    {/if}
  </label>
</div>

{#if error}
  <span class="text-sm text-[var(--theme-error)]">{error}</span>
{/if}

{#if images.length}
  <div class="grid grid-cols-3 gap-2 mt-2">
    {#each images as url}
      <img 
        src={url} 
        alt="Uploaded" 
        class="w-full h-24 object-cover rounded"
        loading="lazy"
      />
    {/each}
  </div>
{/if}

