<script lang="ts">
  import { Moon, Sun } from 'lucide-svelte';
  import { Button } from '$lib/components/ui';
  import { theme } from '$lib/stores/theme';

  let themeState = $state({ resolvedMode: 'light' as 'light' | 'dark', activeId: 'light-default' });

  // Subscribe to theme changes reactively
  $effect(() => {
    const unsubscribe = theme.subscribe((state) => {
      themeState = state;
    });
    return unsubscribe;
  });

  function toggleTheme() {
    const currentMode = themeState.resolvedMode;
    // Cycle through light/dark themes - find next available theme in opposite mode
    const nextMode = currentMode === 'light' ? 'dark' : 'light';
    const nextThemeId = nextMode === 'dark' ? 'dark-default' : 'light-default';
    theme.setTheme(nextThemeId);
  }

  const isDark = $derived(themeState.resolvedMode === 'dark');
</script>

<Button variant="ghost" size="icon" onclick={toggleTheme}>
  <Sun class="size-5 rotate-0 scale-100 transition-all {isDark ? '-rotate-90 scale-0' : ''}" />
  <Moon class="absolute size-5 rotate-90 scale-0 transition-all {isDark ? 'rotate-0 scale-100' : ''}" />
  <span class="sr-only">Toggle theme</span>
</Button>