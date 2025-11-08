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
      color: '', // Use inline style instead
      dotColor: '', // Use inline style instead
      style: 'background-color: var(--theme-priority-low-bg, #dbeafe); color: var(--theme-priority-low-text, #1e40af); border-color: var(--theme-priority-low-border, #93c5fd);',
      dotStyle: 'background-color: var(--theme-priority-low-dot, #3b82f6);'
    },
    { 
      value: 'medium', 
      label: 'Medium',
      color: '', // Use inline style instead
      dotColor: '', // Use inline style instead
      style: 'background-color: var(--theme-priority-medium-bg, #fef3c7); color: var(--theme-priority-medium-text, #92400e); border-color: var(--theme-priority-medium-border, #fbbf24);',
      dotStyle: 'background-color: var(--theme-priority-medium-dot, #f59e0b);'
    },
    { 
      value: 'high', 
      label: 'High',
      color: '', // Use inline style instead
      dotColor: '', // Use inline style instead
      style: 'background-color: var(--theme-priority-high-bg, #fce7f3); color: var(--theme-priority-high-text, #9f1239); border-color: var(--theme-priority-high-border, #f472b6);',
      dotStyle: 'background-color: var(--theme-priority-high-dot, #ef4444);'
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
