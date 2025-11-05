<script lang="ts">
  import { cn } from '$lib/utils'
  import { ChevronDown, Check } from 'lucide-svelte'
  import { DropdownMenu, DropdownMenuItem } from '$lib/components/ui'
  
  export interface TagOption {
    value: string
    label: string
    color?: string
    dotColor?: string
    badge?: string
    style?: string
    dotStyle?: string
  }
  
  interface Props {
    options?: TagOption[]
    currentValue?: string
    editable?: boolean
    onChange?: (value: string) => Promise<void> | void
    getTagColor?: (option: TagOption | null) => string
    getDotColor?: (option: TagOption | null) => string
    placeholder?: string
    class?: string
    // Legacy props for components that use TagSelector incorrectly
    onAddTag?: (tag: string) => void
  }
  
  let { 
    options = [], 
    currentValue = '', 
    editable = true, 
    onChange,
    getTagColor,
    getDotColor,
    placeholder = 'Select...',
    class: className = '',
    onAddTag
  }: Props = $props()
  
  const currentOption = $derived(options.find(opt => opt.value === currentValue) || null)
  
  const defaultGetTagColor = (option: TagOption | null): string => {
    if (!option) return 'bg-muted text-muted-foreground border-transparent'
    if (option.color) {
      // If color is provided, use it directly
      return option.color
    }
    return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
  }
  
  const defaultGetDotColor = (option: TagOption | null): string => {
    if (!option) return 'bg-gray-500'
    if (option.dotColor) return option.dotColor
    return 'bg-blue-500'
  }
  
  const tagColorFn = getTagColor || defaultGetTagColor
  const dotColorFn = getDotColor || defaultGetDotColor
  
  async function selectOption(option: TagOption) {
    if (!editable || option.value === currentValue) return
    if (onChange) {
      await onChange(option.value)
    }
  }
  
  // Handle legacy onAddTag prop - show a simple add button
  let showAddTagInput = $state(false)
  let newTagValue = $state('')
  
  function handleAddTag() {
    if (onAddTag && newTagValue.trim()) {
      onAddTag(newTagValue.trim())
      newTagValue = ''
      showAddTagInput = false
    }
  }
</script>

<div class={cn('relative inline-block', className)}>
  {#if onAddTag}
    <!-- Legacy mode: Tag adder instead of selector -->
    {#if showAddTagInput}
      <div class="flex items-center gap-1">
        <input
          type="text"
          bind:value={newTagValue}
          onkeydown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAddTag()
            } else if (e.key === 'Escape') {
              showAddTagInput = false
              newTagValue = ''
            }
          }}
          placeholder="Add tag..."
          class="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
          style="border-color: var(--theme-border); background-color: var(--theme-input-bg); color: var(--theme-foreground);"
          autofocus
        />
        <button
          type="button"
          onclick={handleAddTag}
          class="px-2 py-1 text-sm rounded bg-primary text-primary-foreground hover:opacity-90"
          style="background-color: var(--theme-primary); color: white;"
        >
          Add
        </button>
        <button
          type="button"
          onclick={() => {
            showAddTagInput = false
            newTagValue = ''
          }}
          class="px-2 py-1 text-sm rounded hover:bg-muted"
          style="color: var(--theme-foreground);"
        >
          Cancel
        </button>
      </div>
    {:else}
      <button
        type="button"
        onclick={() => showAddTagInput = true}
        class="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-all cursor-pointer hover:opacity-90 hover:shadow-sm bg-muted text-muted-foreground border-transparent"
        style="border-color: var(--theme-border);"
      >
        <span>+ Add Tag</span>
      </button>
    {/if}
  {:else if editable}
    <DropdownMenu placement="bottom-start">
      {#snippet trigger()}
        <button
          type="button"
          class={cn(
            'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-all cursor-pointer hover:opacity-90 hover:shadow-sm',
            tagColorFn(currentOption)
          )}
          style={currentOption?.style || undefined}
        >
          {#if currentOption}
            {#if dotColorFn(currentOption) || currentOption.dotStyle}
              <div class={cn('size-2 rounded-full', dotColorFn(currentOption))} style={currentOption?.dotStyle || undefined}></div>
            {/if}
            <span>{currentOption.label}</span>
            {#if currentOption.badge}
              <span class="ml-0.5 text-xs">{currentOption.badge}</span>
            {/if}
          {:else}
            <span>{placeholder}</span>
          {/if}
          <ChevronDown class="size-3 opacity-80" />
        </button>
      {/snippet}
      
      {#snippet children()}
        <div class="py-1.5 min-w-[180px]">
          {#each options as option}
            <DropdownMenuItem onclick={() => selectOption(option)}>
              <div class="flex w-full items-center justify-between gap-3 text-left">
                <div class="flex items-center gap-2">
                  {#if dotColorFn(option) || option.dotStyle}
                    <div class={cn('size-2 rounded-full', dotColorFn(option))} style={option?.dotStyle || undefined}></div>
                  {/if}
                  <span class="text-sm font-medium text-left">{option.label}</span>
                  {#if option.badge}
                    <span class="text-xs text-muted-foreground">{option.badge}</span>
                  {/if}
                </div>
                {#if currentValue === option.value}
                  <Check class="size-4 text-[var(--theme-primary)] shrink-0" />
                {/if}
              </div>
            </DropdownMenuItem>
          {/each}
        </div>
      {/snippet}
    </DropdownMenu>
  {:else}
    <div
      class={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium cursor-default',
        tagColorFn(currentOption)
      )}
      style={currentOption?.style || undefined}
    >
      {#if currentOption}
        {#if dotColorFn(currentOption) || currentOption.dotStyle}
          <div class={cn('size-2 rounded-full', dotColorFn(currentOption))} style={currentOption?.dotStyle || undefined}></div>
        {/if}
        <span>{currentOption.label}</span>
        {#if currentOption.badge}
          <span class="ml-0.5 text-xs">{currentOption.badge}</span>
        {/if}
      {:else}
        <span>{placeholder}</span>
      {/if}
    </div>
  {/if}
</div>
