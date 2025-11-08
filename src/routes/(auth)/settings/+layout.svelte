<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  
  // Settings layout component
  let { children }: { children: import('svelte').Snippet } = $props();
  const currentPath = $derived($page.url.pathname);
</script>

<div class="container mx-auto p-6">
  <div class="mb-6">
    <h1 class="text-3xl font-bold mb-2">Settings</h1>
    <p class="text-muted-foreground">Manage your account and application settings.</p>
  </div>
  
  <div class="grid gap-6 lg:grid-cols-4">
    <nav class="space-y-2">
      <button
        onclick={() => goto('/settings/profile')}
        class="w-full text-left block px-3 py-2 rounded-md hover:bg-muted transition-colors {currentPath === '/settings/profile' ? 'bg-muted font-medium' : ''}"
      >
        Profile
      </button>
      <button
        onclick={() => goto('/settings/preferences')}
        class="w-full text-left block px-3 py-2 rounded-md hover:bg-muted transition-colors {currentPath === '/settings/preferences' ? 'bg-muted font-medium' : ''}"
      >
        Preferences
      </button>
      <button
        onclick={() => goto('/settings/team')}
        class="w-full text-left block px-3 py-2 rounded-md hover:bg-muted transition-colors {currentPath === '/settings/team' ? 'bg-muted font-medium' : ''}"
      >
        Team
      </button>
      <button
        onclick={() => goto('/settings/task-stages')}
        class="w-full text-left block px-3 py-2 rounded-md hover:bg-muted transition-colors {currentPath === '/settings/task-stages' ? 'bg-muted font-medium' : ''}"
      >
        Task Stages
      </button>
      <button
        onclick={() => goto('/settings/theme-builder')}
        class="w-full text-left block px-3 py-2 rounded-md hover:bg-muted transition-colors {currentPath === '/settings/theme-builder' ? 'bg-muted font-medium' : ''}"
      >
        Theme Builder
      </button>
    </nav>
    
    <div class="lg:col-span-3">
      {@render children()}
    </div>
  </div>
</div>