<script lang="ts">
  /**
   * Inline Tag Input Component
   * Feature: 003-modern-task-ui
   * Purpose: Multi-tag input with inline editing
   */
  import { cn } from '$lib/utils'

  interface Props {
    value?: string[] // Array of tags
    editable?: boolean
    onSave?: (tags: string[]) => Promise<void> | void
    placeholder?: string
    className?: string
    maxTags?: number
    suggestions?: string[] // Optional tag suggestions
  }

  let {
    value = $bindable([]),
    editable = true,
    onSave,
    placeholder = 'Add tags...',
    className = '',
    maxTags = 10,
    suggestions = [],
  }: Props = $props()

  let inputValue = $state('')
  let isFocused = $state(false)
  let isSaving = $state(false)
  let showSuggestions = $state(false)
  let inputElement: HTMLInputElement | null = $state(null)

  // Filter suggestions based on input and exclude already selected tags
  let filteredSuggestions = $derived(() => {
    if (!inputValue || !suggestions.length) return []
    const query = inputValue.toLowerCase()
    return suggestions
      .filter(s => s.toLowerCase().includes(query))
      .filter(s => !value.includes(s))
      .slice(0, 5)
  })

  function addTag(tag: string) {
    if (!editable) return
    
    const trimmedTag = tag.trim().toLowerCase()
    
    // Validate tag
    if (!trimmedTag) return
    if (value.includes(trimmedTag)) return
    if (value.length >= maxTags) return
    
    // Add tag
    const newTags = [...value, trimmedTag]
    value = newTags
    inputValue = ''
    showSuggestions = false
    
    // Auto-save
    if (onSave) {
      saveTagsAsync(newTags)
    }
  }

  function removeTag(tagToRemove: string) {
    if (!editable) return
    
    const newTags = value.filter(t => t !== tagToRemove)
    value = newTags
    
    // Auto-save
    if (onSave) {
      saveTagsAsync(newTags)
    }
  }

  async function saveTagsAsync(tags: string[]) {
    if (!onSave) return
    
    isSaving = true
    try {
      await onSave(tags)
    } catch (err) {
      console.error('Failed to save tags:', err)
    } finally {
      isSaving = false
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (!editable) return

    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      if (inputValue.trim()) {
        addTag(inputValue)
      }
    } else if (event.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last tag on backspace when input is empty
      removeTag(value[value.length - 1])
    } else if (event.key === 'Escape') {
      inputValue = ''
      showSuggestions = false
      inputElement?.blur()
    }
  }

  function handleInput() {
    showSuggestions = inputValue.length > 0 && filteredSuggestions().length > 0
  }

  function handleBlur() {
    // Delay to allow clicking suggestions
    setTimeout(() => {
      showSuggestions = false
      isFocused = false
      
      // Add tag on blur if input has value
      if (inputValue.trim()) {
        addTag(inputValue)
      }
    }, 200)
  }
</script>

<div class={cn('relative', className)}>
  <div
    class={cn(
      'flex min-h-[38px] w-full flex-wrap items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2 py-1.5 transition-colors',
      isFocused && 'border-blue-500 ring-1 ring-blue-500',
      !editable && 'cursor-not-allowed bg-gray-50 opacity-60',
      isSaving && 'opacity-70'
    )}
  >
    <!-- Tag Pills -->
    {#each value as tag (tag)}
      <span
        class="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-700"
      >
        {tag}
        {#if editable}
          <button
            type="button"
            onclick={() => removeTag(tag)}
            class="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-blue-200 focus:outline-none"
            aria-label="Remove tag"
          >
            <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        {/if}
      </span>
    {/each}

    <!-- Input Field -->
    {#if editable && value.length < maxTags}
      <input
        bind:this={inputElement}
        bind:value={inputValue}
        type="text"
        placeholder={value.length === 0 ? placeholder : ''}
        onkeydown={handleKeyDown}
        oninput={handleInput}
        onfocus={() => {
          isFocused = true
          showSuggestions = inputValue.length > 0 && filteredSuggestions().length > 0
        }}
        onblur={handleBlur}
        class="min-w-[120px] flex-1 border-none bg-transparent px-1 text-sm outline-none placeholder:text-gray-400"
      />
    {/if}

    <!-- Saving Indicator -->
    {#if isSaving}
      <svg class="h-4 w-4 animate-spin text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    {/if}
  </div>

  <!-- Suggestions Dropdown -->
  {#if showSuggestions && filteredSuggestions().length > 0}
    <div class="absolute left-0 right-0 z-50 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg">
      <div class="max-h-40 overflow-y-auto p-1">
        {#each filteredSuggestions() as suggestion (suggestion)}
          <button
            type="button"
            onclick={() => addTag(suggestion)}
            class="flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100"
          >
            <span class="flex-1">{suggestion}</span>
            <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Helper Text -->
  {#if editable && value.length >= maxTags}
    <p class="mt-1 text-xs text-gray-500">
      Maximum {maxTags} tags reached
    </p>
  {:else if editable}
    <p class="mt-1 text-xs text-gray-500">
      Press Enter or comma to add tag
    </p>
  {/if}
</div>

