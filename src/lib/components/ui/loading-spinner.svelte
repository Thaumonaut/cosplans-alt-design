<script lang="ts">
  interface Props {
    size?: 'sm' | 'md' | 'lg';
    class?: string;
  }
  
  let { size = 'md', class: className = '' }: Props = $props();
  
  const sizeClasses = {
    sm: 'size-4',
    md: 'size-8', 
    lg: 'size-12'
  };
</script>

<div class="flex items-center justify-center {className}">
  <div class="{sizeClasses[size]} animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
</div>