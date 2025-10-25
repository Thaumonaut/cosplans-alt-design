<script lang="ts">
  import { cn } from '$lib/utils.js'

  interface TextareaProps {
    value?: string
    placeholder?: string
    disabled?: boolean
    readonly?: boolean
    required?: boolean
    rows?: number
    cols?: number
    class?: string
    id?: string
    name?: string
  }

  let {
    value = $bindable(''),
    placeholder,
    disabled = false,
    readonly = false,
    required = false,
    rows,
    cols,
    class: className = '',
    id,
    name,
    ...restProps
  }: TextareaProps = $props()
</script>

<textarea
  {placeholder}
  {disabled}
  {readonly}
  {required}
  {rows}
  {cols}
  {id}
  {name}
  bind:value
  data-slot="textarea"
  class={cn(
    'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
    className,
  )}
  {...restProps}
></textarea>