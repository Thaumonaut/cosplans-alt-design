<script lang="ts">
  import { cn } from '$lib/utils'

  interface Props {
    value?: string
    editable?: boolean
    onSave?: (value: string) => Promise<void> | void
    onValidate?: (value: string) => string | null
    placeholder?: string
    className?: string
    variant?: 'title' | 'heading' | 'body' | 'caption'
    multiline?: boolean
  }

  let {
    value = $bindable(''),
    editable = true,
    onSave,
    onValidate,
    placeholder = 'Type something...',
    className = '',
    variant = 'body',
    multiline = false,
  }: Props = $props()

  let isFocused = $state(false)
  let isSaving = $state(false)
  let error = $state<string | null>(null)
  let lastSavedValue = $state(value)
  let textareaElement: HTMLTextAreaElement | null = $state(null)
  let inputElement: HTMLInputElement | null = $state(null)

  const variantStyles = {
    title: 'text-3xl font-bold leading-tight',
    heading: 'text-xl font-semibold leading-snug',
    body: 'text-base leading-relaxed',
    caption: 'text-sm text-muted-foreground leading-relaxed',
  }

  let baseStyles = $derived(
    cn(
      'w-full resize-none border-none bg-transparent p-0 outline-none transition-colors',
      'placeholder:text-muted-foreground/50',
      isFocused && 'placeholder:text-muted-foreground/70',
      !editable && 'cursor-not-allowed opacity-60',
      variantStyles[variant],
      className
    )
  )

  $effect(() => {
    if (multiline && textareaElement) {
      textareaElement.style.height = 'auto'
      textareaElement.style.height = `${textareaElement.scrollHeight}px`
    }
  })

  async function handleBlur() {
    if (!editable || !onSave || value === lastSavedValue) return
    
    // Validate if validator provided
    if (onValidate) {
      const validationError = onValidate(value)
      if (validationError) {
        error = validationError
        value = lastSavedValue
        return
      }
    }
    
    lastSavedValue = value
    isSaving = true
    error = null
    try {
      await onSave(value)
    } catch (err: any) {
      value = lastSavedValue
      error = err?.message || 'Save failed'
    } finally {
      isSaving = false
    }
  }

  function handleInput(newValue: string) {
    if (!editable) return
    value = newValue
    error = null
  }
</script>

{#if multiline}
  <textarea
    bind:this={textareaElement}
    bind:value
    oninput={(e) => handleInput((e.target as HTMLTextAreaElement).value)}
    onfocus={() => (isFocused = true)}
    onblur={() => {
      isFocused = false
      handleBlur()
    }}
    {placeholder}
    disabled={!editable}
    class={baseStyles}
    rows={1}
  ></textarea>
{:else}
  <input
    bind:this={inputElement}
    type="text"
    bind:value
    oninput={(e) => handleInput((e.target as HTMLInputElement).value)}
    onfocus={() => (isFocused = true)}
    onblur={() => {
      isFocused = false
      handleBlur()
    }}
    {placeholder}
    disabled={!editable}
    class={baseStyles}
  />
{/if}

{#if isSaving}
  <span class="text-sm text-gray-500">Saving...</span>
{/if}

{#if error}
  <span class="text-sm text-red-600">{error}</span>
{/if}
