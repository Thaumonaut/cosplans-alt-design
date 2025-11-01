<script lang="ts">
  import { Palette, Check, Sun, Moon, Sparkles } from 'lucide-svelte';
  import { Button, DropdownMenu, DropdownMenuItem } from '$lib/components/ui';
  import { theme } from '$lib/stores/theme';
  import { THEME_VARIANTS, DEFAULT_THEME_ID } from '$lib/utils/theme-variants';

  let themeState = $state({ resolvedMode: 'light' as 'light' | 'dark', activeId: DEFAULT_THEME_ID });

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
  const currentTheme = $derived(THEME_VARIANTS.find(v => v.id === themeState.activeId) || THEME_VARIANTS[0]);

  function selectTheme(themeId: string) {
    theme.setTheme(themeId);
  }
  
  function createCustomTheme() {
    // TODO: Open custom theme builder modal/component
    console.log('Create custom theme clicked');
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
      <!-- Default Light at top -->
      {#if defaultLight}
        <DropdownMenuItem onclick={() => selectTheme(defaultLight.id)}>
          <div class="flex w-full items-center justify-between gap-3 px-2">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <Sun class="size-4 shrink-0 text-muted-foreground" />
              <div class="flex-1 min-w-0">
                <div class="font-medium truncate">{defaultLight.label}</div>
              </div>
            </div>
            {#if themeState.activeId === defaultLight.id}
              <Check class="size-4 shrink-0" />
            {/if}
          </div>
        </DropdownMenuItem>
        <div class="border-t border-[var(--theme-border)] my-1"></div>
      {/if}

      <!-- Default Dark -->
      {#if defaultDark}
        <DropdownMenuItem onclick={() => selectTheme(defaultDark.id)}>
          <div class="flex w-full items-center justify-between gap-3 px-2">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <Moon class="size-4 shrink-0 text-muted-foreground" />
              <div class="flex-1 min-w-0">
                <div class="font-medium truncate">{defaultDark.label}</div>
              </div>
            </div>
            {#if themeState.activeId === defaultDark.id}
              <Check class="size-4 shrink-0" />
            {/if}
          </div>
        </DropdownMenuItem>
        <div class="border-t border-[var(--theme-border)] my-1"></div>
      {/if}

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
                <div class="font-medium truncate">{variant.label}</div>
                {#if variant.description}
                  <div class="text-xs text-muted-foreground truncate">{variant.description}</div>
                {/if}
              </div>
            </div>
            {#if themeState.activeId === variant.id}
              <Check class="size-4 shrink-0" />
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
                <div class="font-medium truncate">{variant.label}</div>
                {#if variant.description}
                  <div class="text-xs text-muted-foreground truncate">{variant.description}</div>
                {/if}
              </div>
            </div>
            {#if themeState.activeId === variant.id}
              <Check class="size-4 shrink-0" />
            {/if}
          </div>
        </DropdownMenuItem>
      {/each}

      <div class="border-t border-[var(--theme-border)] my-1"></div>

      <!-- Create Custom Theme -->
      <DropdownMenuItem onclick={createCustomTheme}>
        <div class="flex w-full items-center gap-3 px-2 text-[var(--theme-primary)]">
          <Sparkles class="size-4 shrink-0" />
          <div class="font-medium">Create Custom Theme</div>
        </div>
      </DropdownMenuItem>
    </div>
  {/snippet}
</DropdownMenu>
