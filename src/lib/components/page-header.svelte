<script lang="ts">
  import { Bell } from "lucide-svelte";
  import {
    Button,
    DropdownMenu,
    DropdownMenuItem,
    SidebarTrigger,
  } from "$lib/components/ui";
  import SearchDialog from "./search-dialog.svelte";
  import ThemeToggle from "./theme-toggle.svelte";

  interface Props {
    searchPlaceholder?: string;
    notifications?: Array<{
      title: string;
      description: string;
    }>;
    children?: any;
  }

  let {
    searchPlaceholder = "Search...",
    notifications = [],
    children,
  }: Props = $props();
</script>

<header
  class="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
  <div class="flex items-center gap-3">
    <SidebarTrigger />
    <SearchDialog placeholder={searchPlaceholder} />
  </div>
  <div class="flex items-center gap-2">
    <ThemeToggle />

    {#if notifications.length > 0}
      <DropdownMenu>
        {#snippet trigger()}
          <Button variant="ghost" size="icon" class="relative">
            <Bell class="size-5" />
            <span
              class="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary"
            ></span>
          </Button>
        {/snippet}

        {#snippet children()}
          {#each notifications as notification}
            <DropdownMenuItem>
              <div class="flex flex-col gap-1">
                <p class="font-medium">{notification.title}</p>
                <p class="text-sm text-muted-foreground">
                  {notification.description}
                </p>
              </div>
            </DropdownMenuItem>
          {/each}
        {/snippet}
      </DropdownMenu>
    {:else}
      <Button variant="ghost" size="icon" class="relative" disabled>
        <Bell class="size-5" />
      </Button>
    {/if}

    {@render children?.()}
  </div>
</header>
