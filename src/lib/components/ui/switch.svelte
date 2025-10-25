<script lang="ts">
  import { cn } from '$lib/utils';
  
  interface Props {
    checked?: boolean;
    onchange?: (checked: boolean) => void;
    class?: string;
    disabled?: boolean;
  }
  
  let { checked = $bindable(false), onchange, class: className, disabled = false, ...restProps }: Props = $props();
  
  function handleChange() {
    if (!disabled) {
      checked = !checked;
      onchange?.(checked);
    }
  }
</script>

<button
  type="button"
  role="switch"
  aria-checked={checked}
  class={cn(
    'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
    checked ? 'bg-primary' : 'bg-input',
    disabled && 'cursor-not-allowed opacity-50',
    className
  )}
  onclick={handleChange}
  {disabled}
  {...restProps}
>
  <span
    class={cn(
      'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform',
      checked ? 'translate-x-5' : 'translate-x-0'
    )}
  ></span>
</button>