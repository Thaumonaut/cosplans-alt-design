<script lang="ts">
  // Settings layout component
</script>

<div class="container mx-auto p-6">
  <div class="mb-6">
    <h1 class="text-3xl font-bold mb-2">Settings</h1>
    <p class="text-muted-foreground">Manage your account and application settings.</p>
  </div>
  
  <div class="grid gap-6 lg:grid-cols-4">
    <nav class="space-y-2">
      <a href="/settings/profile" class="block px-3 py-2 rounded-md hover:bg-muted">
        Profile Settings
      </a>
      <a href="/settings/team" class="block px-3 py-2 rounded-md hover:bg-muted">
        Team Settings
      </a>
    </nav>
    
    <div class="lg:col-span-3">
      <slot />
    </div>
  </div>
</div>