<script lang="ts">
  import TagSelector, { type TagOption } from './TagSelector.svelte'
  
  export type Priority = 'low' | 'medium' | 'high'
  
  interface Props {
    currentPriority: Priority
    editable?: boolean
    onPriorityChange: (priority: Priority) => Promise<void> | void
    class?: string
  }
  
  let { 
    currentPriority, 
    editable = true, 
    onPriorityChange, 
    class: className = ''
  }: Props = $props()
  
  const priorityOptions: TagOption[] = [
    { 
      value: 'low', 
      label: 'Low',
      color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      dotColor: 'bg-blue-500'
    },
    { 
      value: 'medium', 
      label: 'Medium',
      color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      dotColor: 'bg-amber-500'
    },
    { 
      value: 'high', 
      label: 'High',
      color: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      dotColor: 'bg-rose-500'
    },
  ]
</script>

<TagSelector
  options={priorityOptions}
  currentValue={currentPriority}
  {editable}
  onChange={(value) => onPriorityChange(value as Priority)}
  class={className}
/>
