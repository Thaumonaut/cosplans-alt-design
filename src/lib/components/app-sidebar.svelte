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
    ImageIcon,
    Users,
    Camera,
    Edit3,
    Settings,
    LogOut,
    PencilRuler,
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

  const projectPhases = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Timeline",
      url: "/timeline",
      icon: Clock,
    },
    {
      title: "Planning",
      url: "/planning",
      icon: ClipboardList,
    },
    {
      title: "In Progress",
      url: "/in-progress",
      icon: Hammer,
    },
    {
      title: "Archived",
      url: "/archived",
      icon: Archive,
    },
  ];

  const tools = [
    {
      title: "Marketplace",
      url: "/marketplace",
      icon: Users,
    },
    {
      title: "Profile",
      url: "/profile",
      icon: User,
    },
    {
      title: "Messages",
      url: "/messages",
      icon: MessageSquare,
    },
    {
      title: "Calendar",
      url: "/calendar",
      icon: Calendar,
    },
    {
      title: "Tasks",
      url: "/tasks",
      icon: CheckSquare,
    },
    {
      title: "Budget",
      url: "/budget",
      icon: DollarSign,
    },
  ];

  const resources = [
    {
      title: "Characters",
      url: "/characters",
      icon: Sparkles,
    },
    {
      title: "Outfits",
      url: "/outfits",
      icon: Shirt,
    },
    {
      title: "Props",
      url: "/props",
      icon: Package,
    },
    {
      title: "Accessories",
      url: "/accessories",
      icon: Palette,
    },
    {
      title: "Materials",
      url: "/materials",
      icon: PencilRuler,
    },
    {
      title: "Equipment",
      url: "/equipment",
      icon: Camera,
    },
    {
      title: "Tools",
      url: "/tools",
      icon: Wrench,
    },
  ];

  const events = [
    {
      title: "Events",
      url: "/events",
      icon: Users,
    },
    {
      title: "Photoshoots",
      url: "/photoshoots",
      icon: Camera,
    },
    {
      title: "Post Production",
      url: "/post-production",
      icon: Edit3,
    },
  ];


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
      <SidebarGroupLabel>Project Phases</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {#each projectPhases as item}
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

    <SidebarGroup>
      <SidebarGroupLabel>Tools</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {#each tools as item}
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

    <SidebarGroup>
      <SidebarGroupLabel>Resources</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {#each resources as item}
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

    <SidebarGroup>
      <SidebarGroupLabel>Events & Media</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {#each events as item}
            <SidebarMenuItem>
              <SidebarMenuButton href={item.url}>
                <item.icon class="size-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          {/each}
        </SidebarMenu>
      </SidebarGroupContent>
      <div class="h-[80px]"></div>
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
