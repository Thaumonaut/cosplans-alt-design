<script lang="ts">
  import {
    Sparkles,
    LayoutDashboard,
    Clock,
    ClipboardList,
    Hammer,
    Archive,
    MessageSquare,
    User,
    Calendar,
    CheckSquare,
    DollarSign,
    Shirt,
    Package,
    Wrench,
    Palette,
    Users,
    Camera,
    Edit3,
    Settings,
    LogOut,
    MapPin,
    UserCircle,
    Clapperboard,
    Film,
    Sofa,
    Folder,
    ChevronDown,
    Store,
    BookOpen,
    Scissors,
    PartyPopper,
    Coffee,
    ImagePlay,
    LayoutGrid,
    FileText,
  } from "lucide-svelte";

  import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter,
    Avatar,
    AvatarFallback,
    AvatarImage,
    DropdownMenu,
    DropdownMenuItem,
  } from "$lib/components/ui";
  import TeamSelector from "./team-selector.svelte";

  // MVP Navigation - Only show implemented features
  const mainNav = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, ready: true },
    { title: "Ideas", url: "/ideas", icon: Sparkles, ready: true },
    { title: "Projects", url: "/projects", icon: Folder, ready: true },
    { title: "Resources", url: "/resources", icon: Package, ready: true },
    { title: "Tools", url: "/tools", icon: Hammer, ready: true },
    { title: "Photoshoots", url: "/photoshoots", icon: Clapperboard, ready: true },
  ];

  const collaborationNav = [
    { title: "Teams", url: "/teams", icon: Users, ready: true },
    { title: "Calendar", url: "/calendar", icon: Calendar, ready: false },
  ];

  const settingsNav = [
    { title: "Settings", url: "/settings", icon: Settings, ready: false },
  ];

  // Collapsible state using proper Svelte 5 runes
  let collaborationOpen = $state(true);
  let settingsOpen = $state(false);
</script>

<Sidebar>
  <SidebarHeader class="border-b border-sidebar-border px-6 py-4">
    <div class="flex items-center gap-3">
      <div
        class="flex size-10 items-center justify-center rounded-xl bg-primary"
      >
        <Sparkles class="size-5 text-primary-foreground" />
      </div>
      <div class="flex flex-1 flex-col overflow-hidden">
        <span class="text-lg font-semibold">Cosplans</span>
      </div>
    </div>
    <div class="mt-3">
      <TeamSelector />
    </div>
  </SidebarHeader>

  <SidebarContent>
    <SidebarGroup>
      <SidebarGroupLabel>Main</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {#each mainNav as item}
            <SidebarMenuItem>
              {#if item.ready}
                <SidebarMenuButton href={item.url}>
                  <item.icon class="size-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              {:else}
                <div class="flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground opacity-60 pointer-events-none" title="coming soon">
                  <item.icon class="size-4" />
                  <span>{item.title}</span>
                </div>
              {/if}
            </SidebarMenuItem>
          {/each}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>

    <!-- Collaboration Section -->
    <SidebarGroup>
      <SidebarGroupLabel>
        <button
          class="flex w-full items-center justify-between"
          onclick={() => (collaborationOpen = !collaborationOpen)}
        >
          Collaboration
          <ChevronDown
            class="ml-auto size-4 transition-transform {collaborationOpen
              ? ''
              : '-rotate-90'}"
          />
        </button>
      </SidebarGroupLabel>
      {#if collaborationOpen}
        <SidebarGroupContent>
          <SidebarMenu>
            {#each collaborationNav as item}
              <SidebarMenuItem>
                {#if item.ready}
                  <SidebarMenuButton href={item.url}>
                    <item.icon class="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                {:else}
                  <div class="flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground opacity-60 pointer-events-none" title="Coming soon">
                    <item.icon class="size-4" />
                    <span>{item.title}</span>
                  </div>
                {/if}
              </SidebarMenuItem>
            {/each}
          </SidebarMenu>
        </SidebarGroupContent>
      {/if}
    </SidebarGroup>

    <!-- Settings Section -->
    <SidebarGroup>
      <SidebarGroupLabel>
        <button
          class="flex w-full items-center justify-between"
          onclick={() => (settingsOpen = !settingsOpen)}
        >
          Settings
          <ChevronDown
            class="ml-auto size-4 transition-transform {settingsOpen
              ? ''
              : '-rotate-90'}"
          />
        </button>
      </SidebarGroupLabel>
      {#if settingsOpen}
        <SidebarGroupContent>
          <SidebarMenu>
            {#each settingsNav as item}
              <SidebarMenuItem>
                {#if item.ready}
                  <SidebarMenuButton href={item.url}>
                    <item.icon class="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                {:else}
                  <div class="flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground opacity-60 pointer-events-none" title="Coming soon">
                    <item.icon class="size-4" />
                    <span>{item.title}</span>
                  </div>
                {/if}
              </SidebarMenuItem>
            {/each}
          </SidebarMenu>
        </SidebarGroupContent>
      {/if}
    </SidebarGroup>
  </SidebarContent>

  <SidebarFooter class="border-t border-sidebar-border p-4">
    <DropdownMenu placement="top-start">
      {#snippet trigger()}
        <button
          class="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent"
        >
          <Avatar class="size-8">
            <AvatarImage src="/placeholder-user.jpg" alt="avatar image" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div class="flex flex-col items-start text-sm">
            <span class="font-medium">John Doe</span>
            <span class="text-xs text-muted-foreground"
              >johndoe@example.com</span
            >
          </div>
        </button>
      {/snippet}

      {#snippet children()}
        <DropdownMenuItem>
          <a
            href="/settings/profile"
            class="flex cursor-pointer items-center w-full"
          >
            <User class="mr-2 size-4" />
            Profile Settings
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <a
            href="/settings/team"
            class="flex cursor-pointer items-center w-full"
          >
            <Settings class="mr-2 size-4" />
            Team Settings
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem class="text-destructive">
          <div class="flex cursor-pointer items-center w-full">
            <LogOut class="mr-2 size-4" />
            Sign Out
          </div>
        </DropdownMenuItem>
      {/snippet}
    </DropdownMenu>
  </SidebarFooter>
</Sidebar>
