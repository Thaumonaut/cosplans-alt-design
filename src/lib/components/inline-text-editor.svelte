<script lang="ts">
  import { cn } from '$lib/utils';
  import { onMount } from 'svelte';
  
  interface Props {
    value: string;
    onchange?: (value: string) => void;
    placeholder?: string;
    class?: string;
    variant?: 'title' | 'heading' | 'body' | 'caption';
    multiline?: boolean;
    id?: string;
  }
  
  let {
    value = $bindable(''),
    onchange,
    placeholder = 'Type something...',
    class: className,
    variant = 'body',
    multiline = false,
    id
  }: Props = $props();
  
  let isFocused = $state(false);
  let textareaRef = $state<HTMLTextAreaElement>();
  
  const variantStyles = {
    title: 'text-3xl font-bold leading-tight',
    heading: 'text-xl font-semibold leading-snug',
    body: 'text-base leading-relaxed',
    caption: 'text-sm text-muted-foreground leading-relaxed',
  };
  
  const baseStyles = $derived(cn(
    'w-full resize-none border-none bg-transparent p-0 outline-none transition-colors',
    'placeholder:text-muted-foreground/50',
    isFocused && 'placeholder:text-muted-foreground/70',
    variantStyles[variant],
    className,
  ));
  
  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    value = target.value;
    onchange?.(value);
    
    if (multiline && textareaRef) {
      textareaRef.style.height = 'auto';
      textareaRef.style.height = `${textareaRef.scrollHeight}px`;
    }
  }
  
  function handleFocus() {
    isFocused = true;
  }
  
  function handleBlur() {
    isFocused = false;
  }
  
  $effect(() => {
    if (multiline && textareaRef) {
      textareaRef.style.height = 'auto';
      textareaRef.style.height = `${textareaRef.scrollHeight}px`;
    }
  });
</script>

{#if multiline}
  <textarea
    {id}
    bind:this={textareaRef}
    bind:value
    oninput={handleInput}
    onfocus={handleFocus}
    onblur={handleBlur}
    {placeholder}
    class={baseStyles}
    rows="1"
  ></textarea>
{:else}
  <input
    {id}
    type="text"
    bind:value
    oninput={handleInput}
    onfocus={handleFocus}
    onblur={handleBlur}
    {placeholder}
    class={baseStyles}
  />
{/if}