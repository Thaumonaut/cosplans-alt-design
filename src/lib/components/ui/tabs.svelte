<script lang="ts">
  import { cn } from '$lib/utils'

  interface TabsProps {
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
    className?: string
    children?: any
  }

  let { value = $bindable(), defaultValue, onValueChange, className = '', children }: TabsProps = $props()

  let internalValue = $state(value || defaultValue || '')

  $effect(() => {
    if (value !== undefined) {
      internalValue = value
    }
  })

  function handleValueChange(newValue: string) {
    internalValue = newValue
    value = newValue
    onValueChange?.(newValue)
  }
</script>

<div class={cn('flex flex-col gap-2', className)} data-slot="tabs">
  {@render children({ value: internalValue, setValue: handleValueChange })}
</div>
