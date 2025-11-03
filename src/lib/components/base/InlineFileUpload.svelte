<script lang="ts">
  /**
   * Inline File Upload Component
   * Feature: 003-modern-task-ui
   * Purpose: Drag-and-drop file upload with preview
   */
  import { cn } from '$lib/utils'

  interface Props {
    onUpload?: (files: File[]) => Promise<void> | void
    accept?: string // MIME types (e.g., "image/*,application/pdf")
    maxFiles?: number
    maxSizeBytes?: number // Default 25MB
    multiple?: boolean
    disabled?: boolean
    className?: string
    showPreview?: boolean
  }

  let {
    onUpload,
    accept = '*/*',
    maxFiles = 10,
    maxSizeBytes = 26214400, // 25MB
    multiple = true,
    disabled = false,
    className = '',
    showPreview = true,
  }: Props = $props()

  let isDragging = $state(false)
  let isUploading = $state(false)
  let error = $state<string | null>(null)
  let files = $state<File[]>([])
  let fileInputElement: HTMLInputElement | null = $state(null)

  function handleDragEnter(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    if (!disabled) {
      isDragging = true
    }
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    isDragging = false
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
  }

  async function handleDrop(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    isDragging = false

    if (disabled) return

    const droppedFiles = Array.from(event.dataTransfer?.files || [])
    await processFiles(droppedFiles)
  }

  async function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement
    const selectedFiles = Array.from(target.files || [])
    await processFiles(selectedFiles)
    
    // Reset input so same file can be selected again
    target.value = ''
  }

  async function processFiles(newFiles: File[]) {
    error = null

    // Validate number of files
    if (files.length + newFiles.length > maxFiles) {
      error = `Maximum ${maxFiles} files allowed`
      return
    }

    // Validate file sizes
    const oversizedFiles = newFiles.filter(f => f.size > maxSizeBytes)
    if (oversizedFiles.length > 0) {
      error = `Files must be under ${formatFileSize(maxSizeBytes)}`
      return
    }

    // Add files to list
    files = [...files, ...newFiles]

    // Upload if handler provided
    if (onUpload) {
      isUploading = true
      try {
        await onUpload(newFiles)
      } catch (err: any) {
        error = err?.message || 'Upload failed'
        // Remove failed files
        files = files.filter(f => !newFiles.includes(f))
      } finally {
        isUploading = false
      }
    }
  }

  function removeFile(fileToRemove: File) {
    files = files.filter(f => f !== fileToRemove)
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  function getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️'
    if (mimeType.startsWith('video/')) return '🎥'
    if (mimeType.startsWith('audio/')) return '🎵'
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('word')) return '📝'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦'
    return '📎'
  }

  function isImage(file: File): boolean {
    return file.type.startsWith('image/')
  }

  function getObjectURL(file: File): string {
    return URL.createObjectURL(file)
  }
</script>

<div class={cn('space-y-3', className)}>
  <!-- Drop Zone -->
  <div
    ondragenter={handleDragEnter}
    ondragleave={handleDragLeave}
    ondragover={handleDragOver}
    ondrop={handleDrop}
    class={cn(
      'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors',
      isDragging && !disabled && 'border-blue-500 bg-blue-50',
      !isDragging && !disabled && 'border-gray-300 hover:border-gray-400',
      disabled && 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60',
      isUploading && 'cursor-wait opacity-70'
    )}
  >
    {#if isUploading}
      <!-- Uploading State -->
      <svg class="h-10 w-10 animate-spin text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="mt-2 text-sm text-gray-600">Uploading...</p>
    {:else}
      <!-- Upload Icon -->
      <svg class="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>

      <div class="mt-2 text-center">
        <p class="text-sm text-gray-600">
          <button
            type="button"
            onclick={() => fileInputElement?.click()}
            disabled={disabled}
            class="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline disabled:cursor-not-allowed disabled:text-gray-400"
          >
            Click to upload
          </button>
          or drag and drop
        </p>
        <p class="mt-1 text-xs text-gray-500">
          {accept === '*/*' ? 'Any file type' : accept} up to {formatFileSize(maxSizeBytes)}
        </p>
        <p class="text-xs text-gray-500">
          Maximum {maxFiles} files
        </p>
      </div>
    {/if}

    <!-- Hidden File Input -->
    <input
      bind:this={fileInputElement}
      type="file"
      {accept}
      {multiple}
      disabled={disabled || isUploading}
      onchange={handleFileSelect}
      class="hidden"
    />
  </div>

  <!-- Error Message -->
  {#if error}
    <div class="flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-800">
      <svg class="h-5 w-5 flex-shrink-0 text-red-400" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
      </svg>
      <span>{error}</span>
    </div>
  {/if}

  <!-- File Preview List -->
  {#if showPreview && files.length > 0}
    <div class="space-y-2">
      <p class="text-sm font-medium text-gray-700">
        Selected Files ({files.length})
      </p>
      <div class="space-y-2">
        {#each files as file (file.name + file.size)}
          <div class="flex items-center gap-3 rounded-md border border-gray-200 bg-white p-3">
            <!-- File Icon or Image Preview -->
            {#if isImage(file)}
              <img
                src={getObjectURL(file)}
                alt={file.name}
                class="h-12 w-12 rounded object-cover"
              />
            {:else}
              <div class="flex h-12 w-12 items-center justify-center rounded bg-gray-100 text-2xl">
                {getFileIcon(file.type)}
              </div>
            {/if}

            <!-- File Info -->
            <div class="flex-1 min-w-0">
              <p class="truncate text-sm font-medium text-gray-900">
                {file.name}
              </p>
              <p class="text-xs text-gray-500">
                {formatFileSize(file.size)}
              </p>
            </div>

            <!-- Remove Button -->
            {#if !disabled && !isUploading}
              <button
                type="button"
                onclick={() => removeFile(file)}
                class="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
                aria-label="Remove file"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

