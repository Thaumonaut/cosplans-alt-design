<script lang="ts">
  import { Palette, Check, Sun, Moon, Sparkles } from 'lucide-svelte';
  import { Button, DropdownMenu, DropdownMenuItem } from '$lib/components/ui';
  import { theme } from '$lib/stores/theme';
  import { THEME_VARIANTS, DEFAULT_THEME_ID } from '$lib/utils/theme-variants';
  import { goto } from '$app/navigation';

  let themeState = $state({ resolvedMode: 'light' as 'light' | 'dark', activeId: DEFAULT_THEME_ID, customThemes: [] });

  // Subscribe to theme changes reactively
  $effect(() => {
    const unsubscribe = theme.subscribe((state) => {
      themeState = state;
    });
    return unsubscribe;
  });

  // Get default themes (exclude them from grouped lists)
  const defaultLight = $derived(THEME_VARIANTS.find(v => v.id === 'light-default'));
  const defaultDark = $derived(THEME_VARIANTS.find(v => v.id === 'dark-default'));
  
  // Group non-default themes by mode
  const lightThemes = $derived(THEME_VARIANTS.filter(v => v.mode === 'light' && v.id !== 'light-default'));
  const darkThemes = $derived(THEME_VARIANTS.filter(v => v.mode === 'dark' && v.id !== 'dark-default'));

  // Get current theme label
  const currentTheme = $derived(
    THEME_VARIANTS.find(v => v.id === themeState.activeId) ||
    themeState.customThemes.find(t => t.id === themeState.activeId) ||
    THEME_VARIANTS[0]
  );

  // Get custom themes
  const customThemes = $derived(themeState.customThemes || []);

  function selectTheme(themeId: string) {
    theme.setTheme(themeId);
  }
  
  function createCustomTheme() {
    goto('/theme-builder');
  }

  function editCustomTheme(themeId: string) {
    goto(`/theme-builder?theme=${themeId}`);
  }

  function deleteCustomTheme(themeId: string, event: MouseEvent) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this custom theme?')) {
      theme.deleteCustomTheme(themeId);
    }
  }
</script>

<DropdownMenu placement="bottom-end">
  {#snippet trigger()}
    <Button variant="ghost" size="sm" class="gap-2">
      <Palette class="size-4" />
      <span class="hidden sm:inline">{currentTheme.label}</span>
    </Button>
  {/snippet}

  {#snippet children()}
    <div class="py-1.5">
      <!-- Default Light and Default Dark at top -->
      {#if defaultLight}
        <DropdownMenuItem onclick={() => selectTheme(defaultLight.id)}>
          <div class="flex w-full items-center justify-between gap-3 px-2">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <Sun class="size-4 shrink-0 text-muted-foreground" />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate">{defaultLight.label}</div>
              </div>
            </div>
            {#if themeState.activeId === defaultLight.id}
              <Check class="size-4 shrink-0 text-[var(--theme-primary)]" />
            {/if}
          </div>
        </DropdownMenuItem>
      {/if}
      
      {#if defaultDark}
        <DropdownMenuItem onclick={() => selectTheme(defaultDark.id)}>
          <div class="flex w-full items-center justify-between gap-3 px-2">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <Moon class="size-4 shrink-0 text-muted-foreground" />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate">{defaultDark.label}</div>
              </div>
            </div>
            {#if themeState.activeId === defaultDark.id}
              <Check class="size-4 shrink-0 text-[var(--theme-primary)]" />
            {/if}
          </div>
        </DropdownMenuItem>
      {/if}
      
      <div class="border-t border-[var(--theme-border)] my-1"></div>

      <!-- Light Themes Section -->
      <div class="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Light Themes
      </div>
      {#each lightThemes as variant}
        <DropdownMenuItem onclick={() => selectTheme(variant.id)}>
          <div class="flex w-full items-center justify-between gap-3 px-2">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <Sun class="size-4 shrink-0 text-muted-foreground" />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate">{variant.label}</div>
              </div>
            </div>
            {#if themeState.activeId === variant.id}
              <Check class="size-4 shrink-0 text-[var(--theme-primary)]" />
            {/if}
          </div>
        </DropdownMenuItem>
      {/each}

      <div class="border-t border-[var(--theme-border)] my-1"></div>

      <!-- Dark Themes Section -->
      <div class="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Dark Themes
      </div>
      {#each darkThemes as variant}
        <DropdownMenuItem onclick={() => selectTheme(variant.id)}>
          <div class="flex w-full items-center justify-between gap-3 px-2">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <Moon class="size-4 shrink-0 text-muted-foreground" />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate">{variant.label}</div>
              </div>
            </div>
            {#if themeState.activeId === variant.id}
              <Check class="size-4 shrink-0 text-[var(--theme-primary)]" />
            {/if}
          </div>
        </DropdownMenuItem>
      {/each}

      <div class="border-t border-[var(--theme-border)] my-1"></div>

      <!-- Custom Themes Section -->
      {#if customThemes.length > 0}
        <div class="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Custom Themes
        </div>
        {#each customThemes as customTheme}
          <DropdownMenuItem onclick={() => selectTheme(customTheme.id)}>
            <div class="flex w-full items-center justify-between gap-3 px-2">
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <Sparkles class="size-4 shrink-0 text-[var(--theme-primary)]" />
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium truncate">{customTheme.label}</div>
                  {#if customTheme.description}
                    <div class="text-xs truncate" style="color: var(--theme-text-muted);">{customTheme.description}</div>
                  {/if}
                </div>
              </div>
              <div class="flex items-center gap-1">
                {#if themeState.activeId === customTheme.id}
                  <Check class="size-4 shrink-0 text-[var(--theme-primary)]" />
                {/if}
                <button
                  type="button"
                  onclick={(e) => editCustomTheme(customTheme.id)}
                  class="p-1 rounded hover:bg-[var(--theme-hover)]"
                  title="Edit theme"
                  onmouseenter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-hover)'}
                  onmouseleave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <svg class="size-3" style="color: var(--theme-text-muted);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onclick={(e) => deleteCustomTheme(customTheme.id, e)}
                  class="p-1 rounded hover:bg-[var(--theme-error-bg)]"
                  title="Delete theme"
                  onmouseenter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-error-bg)'}
                  onmouseleave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <svg class="size-3" style="color: var(--theme-error);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </DropdownMenuItem>
        {/each}
        <div class="border-t border-[var(--theme-border)] my-1"></div>
      {/if}

      <!-- Create Custom Theme -->
      <DropdownMenuItem onclick={createCustomTheme}>
        <div class="flex w-full items-center gap-3 px-2">
          <Sparkles class="size-4 shrink-0 text-[var(--theme-primary)]" />
          <div class="text-sm font-medium text-[var(--theme-primary)]">Theme Builder</div>
        </div>
      </DropdownMenuItem>
    </div>
  {/snippet}
</DropdownMenu>
