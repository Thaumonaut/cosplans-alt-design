<script lang="ts">
  import { Palette, Check } from 'lucide-svelte';
  import { Button, DropdownMenu, DropdownMenuItem } from '$lib/components/ui';
  import { theme } from '$lib/stores/theme';
  import { THEME_VARIANTS } from '$lib/utils/theme-variants';

  let themeState = $state({ resolvedMode: 'light' as 'light' | 'dark', activeId: 'light-default' });

  // Subscribe to theme changes reactively
  $effect(() => {
    const unsubscribe = theme.subscribe((state) => {
      themeState = state;
    });
    return unsubscribe;
  });

  // Group themes by mode
  const lightThemes = $derived(THEME_VARIANTS.filter(v => v.mode === 'light'));
  const darkThemes = $derived(THEME_VARIANTS.filter(v => v.mode === 'dark'));

  function selectTheme(themeId: string) {
    theme.setTheme(themeId);
  }
</script>

<DropdownMenu placement="bottom-end">
  {#snippet trigger()}
    <Button variant="ghost" size="icon">
      <Palette class="size-5" />
      <span class="sr-only">Select theme</span>
    </Button>
  {/snippet}

  {#snippet children()}
    <div class="px-2 py-1.5">
      <div class="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Light Themes
      </div>
      {#each lightThemes as variant}
        <DropdownMenuItem onclick={() => selectTheme(variant.id)}>
          <div class="flex w-full items-center justify-between gap-3">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div
                class="size-4 rounded border shrink-0"
                style="background: {variant.preview.background}; border-color: {variant.preview.primary}"
              ></div>
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

      <div class="px-2 py-1.5 mt-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Dark Themes
      </div>
      {#each darkThemes as variant}
        <DropdownMenuItem onclick={() => selectTheme(variant.id)}>
          <div class="flex w-full items-center justify-between gap-3">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div
                class="size-4 rounded border shrink-0"
                style="background: {variant.preview.background}; border-color: {variant.preview.primary}"
              ></div>
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
    </div>
  {/snippet}
</DropdownMenu>
