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

  const mainNav = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Planning", url: "/planning", icon: ClipboardList },
    { title: "Projects", url: "/projects", icon: Folder },
    { title: "Post-Production", url: "/post-production", icon: Edit3 },
    { title: "Archive", url: "/archived", icon: Archive },
  ];

  const trackingNav = [
    { title: "Calendar", url: "/calendar", icon: Calendar },
    { title: "Timeline", url: "/timeline", icon: Clock },
    { title: "Tasks", url: "/tasks", icon: CheckSquare },
    { title: "Budget", url: "/budget", icon: DollarSign },
    { title: "Notes", url: "/notes", icon: FileText },
  ];

  const socialNav = [
    { title: "Marketplace", url: "/marketplace", icon: Store },
    { title: "Profile", url: "/profile", icon: User },
    { title: "Messages", url: "/messages", icon: MessageSquare },
    { title: "Tutorials", url: "/tutorials", icon: BookOpen },
    { title: "Patterns", url: "/patterns", icon: Scissors },
  ];

  const eventsNav = [
    { title: "Photoshoots", url: "/photoshoots", icon: Clapperboard },
    { title: "Conventions", url: "/conventions", icon: PartyPopper },
    { title: "Meetups", url: "/meetups", icon: Coffee },
  ];

  const resourcesNav = [
    { title: "Photo Gallery", url: "/gallery", icon: ImagePlay },
    { title: "Characters", url: "/characters", icon: Sparkles },
    { title: "Moodboards", url: "/moodboards", icon: LayoutGrid },
  ];

  const characterResources = [
    { title: "Outfits", url: "/outfits", icon: Shirt },
    { title: "Accessories & Makeup", url: "/accessories", icon: Palette },
    { title: "Props", url: "/props", icon: Package },
    { title: "Materials", url: "/materials", icon: Wrench },
    { title: "Tools", url: "/tools", icon: Hammer },
  ];

  const photographyResources = [
    { title: "Equipment", url: "/equipment", icon: Camera },
    { title: "Crew", url: "/crew", icon: UserCircle },
    { title: "Locations", url: "/locations", icon: MapPin },
    { title: "Poses", url: "/poses", icon: Users },
    { title: "Shots", url: "/shots", icon: Film },
    { title: "Sets", url: "/sets", icon: Sofa },
  ];

  // Collapsible state using proper Svelte 5 runes
  let trackingOpen = $state(true);
  let socialOpen = $state(true);
  let eventsOpen = $state(true);
  let resourcesOpen = $state(true);
  let characterOpen = $state(true);
  let photographyOpen = $state(true);
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
              <SidebarMenuButton href={item.url}>
                <item.icon class="size-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          {/each}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>

    <!-- Tracking Section -->
    <SidebarGroup>
      <SidebarGroupLabel>
        <button
          class="flex w-full items-center justify-between"
          onclick={() => (trackingOpen = !trackingOpen)}
        >
          Tracking
          <ChevronDown
            class="ml-auto size-4 transition-transform {trackingOpen
              ? ''
              : '-rotate-90'}"
          />
        </button>
      </SidebarGroupLabel>
      {#if trackingOpen}
        <SidebarGroupContent>
          <SidebarMenu>
            {#each trackingNav as item}
              <SidebarMenuItem>
                <SidebarMenuButton href={item.url}>
                  <item.icon class="size-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            {/each}
          </SidebarMenu>
        </SidebarGroupContent>
      {/if}
    </SidebarGroup>

    <!-- Social Section -->
    <SidebarGroup>
      <SidebarGroupLabel>
        <button
          class="flex w-full items-center justify-between"
          onclick={() => (socialOpen = !socialOpen)}
        >
          Social
          <ChevronDown
            class="ml-auto size-4 transition-transform {socialOpen
              ? ''
              : '-rotate-90'}"
          />
        </button>
      </SidebarGroupLabel>
      {#if socialOpen}
        <SidebarGroupContent>
          <SidebarMenu>
            {#each socialNav as item}
              <SidebarMenuItem>
                <SidebarMenuButton href={item.url}>
                  <item.icon class="size-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            {/each}
          </SidebarMenu>
        </SidebarGroupContent>
      {/if}
    </SidebarGroup>

    <!-- Events Section -->
    <SidebarGroup>
      <SidebarGroupLabel>
        <button
          class="flex w-full items-center justify-between"
          onclick={() => (eventsOpen = !eventsOpen)}
        >
          Events
          <ChevronDown
            class="ml-auto size-4 transition-transform {eventsOpen
              ? ''
              : '-rotate-90'}"
          />
        </button>
      </SidebarGroupLabel>
      {#if eventsOpen}
        <SidebarGroupContent>
          <SidebarMenu>
            {#each eventsNav as item}
              <SidebarMenuItem>
                <SidebarMenuButton href={item.url}>
                  <item.icon class="size-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            {/each}
          </SidebarMenu>
        </SidebarGroupContent>
      {/if}
    </SidebarGroup>

    <!-- Resources Section -->
    <SidebarGroup>
      <SidebarGroupLabel>
        <button
          class="flex w-full items-center justify-between"
          onclick={() => (resourcesOpen = !resourcesOpen)}
        >
          Resources
          <ChevronDown
            class="ml-auto size-4 transition-transform {resourcesOpen
              ? ''
              : '-rotate-90'}"
          />
        </button>
      </SidebarGroupLabel>
      {#if resourcesOpen}
        <SidebarGroupContent>
          <SidebarMenu>
            {#each resourcesNav as item}
              <SidebarMenuItem>
                <SidebarMenuButton href={item.url}>
                  <item.icon class="size-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            {/each}

            <!-- Character Subsection -->
            <SidebarMenuItem>
              <SidebarMenuButton
                onclick={() => (characterOpen = !characterOpen)}
                class="data-[state=open]:bg-sidebar-accent"
              >
                <Shirt class="size-4" />
                <span>Character</span>
                <ChevronDown
                  class="ml-auto size-4 transition-transform {characterOpen
                    ? ''
                    : '-rotate-90'}"
                />
              </SidebarMenuButton>
              {#if characterOpen}
                <div class="border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5">
                  {#each characterResources as item}
                    <SidebarMenuItem>
                      <SidebarMenuButton href={item.url} class="h-7 text-sm">
                        <item.icon class="size-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  {/each}
                </div>
              {/if}
            </SidebarMenuItem>

            <!-- Photography Subsection -->
            <SidebarMenuItem>
              <SidebarMenuButton
                onclick={() => (photographyOpen = !photographyOpen)}
                class="data-[state=open]:bg-sidebar-accent"
              >
                <Camera class="size-4" />
                <span>Photography</span>
                <ChevronDown
                  class="ml-auto size-4 transition-transform {photographyOpen
                    ? ''
                    : '-rotate-90'}"
                />
              </SidebarMenuButton>
              {#if photographyOpen}
                <div class="border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5">
                  {#each photographyResources as item}
                    <SidebarMenuItem>
                      <SidebarMenuButton href={item.url} class="h-7 text-sm">
                        <item.icon class="size-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  {/each}
                </div>
              {/if}
            </SidebarMenuItem>
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
