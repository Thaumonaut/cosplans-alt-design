"use client"
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
} from "lucide-react"

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
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TeamSelector } from "@/components/team-selector"

const projectPhases = [
  {
    title: "Dashboard",
    url: "/",
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
]

const tools = [
  {
    title: "Messages",
    url: "/messages",
    icon: MessageSquare,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
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
  {
    title: "Marketplace",
    url: "/marketplace",
    icon: Users,
  },
]

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
    icon: Wrench,
  },
  {
    title: "Patterns",
    url: "/patterns",
    icon: ImageIcon,
  },
]

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
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary">
            <Sparkles className="size-5 text-primary-foreground" />
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="text-lg font-semibold">Cosplans</span>
          </div>
        </div>
        <div className="mt-3">
          <TeamSelector />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Project Phases</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projectPhases.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tools.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resources.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Events & Media</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {events.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent">
              <Avatar className="size-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-sm">
                <span className="font-medium">John Doe</span>
                <span className="text-xs text-muted-foreground">johndoe@example.com</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <a href="/settings/profile" className="flex cursor-pointer items-center">
                <User className="mr-2 size-4" />
                Profile Settings
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/settings/team" className="flex cursor-pointer items-center">
                <Settings className="mr-2 size-4" />
                Team Settings
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 size-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
