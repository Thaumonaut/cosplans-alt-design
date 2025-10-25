import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { EventCard } from "@/components/event-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/page-header"

const upcomingEvents = [
  {
    id: 1,
    name: "Anime Expo 2025",
    date: "2025-07-04",
    endDate: "2025-07-07",
    location: "Los Angeles Convention Center",
    type: "convention" as const,
    cosplays: [
      {
        character: "Malenia, Blade of Miquella",
        series: "Elden Ring",
        day: "Day 1",
      },
      {
        character: "Ciri",
        series: "The Witcher 3",
        day: "Day 2",
      },
    ],
    checklist: {
      total: 15,
      completed: 8,
    },
    daysUntil: 130,
  },
  {
    id: 2,
    name: "Local Comic Con",
    date: "2025-05-15",
    endDate: "2025-05-16",
    location: "City Convention Center",
    type: "convention" as const,
    cosplays: [
      {
        character: "Raiden Shogun",
        series: "Genshin Impact",
        day: "Day 1",
      },
    ],
    checklist: {
      total: 10,
      completed: 3,
    },
    daysUntil: 80,
  },
]

const pastEvents = [
  {
    id: 3,
    name: "Winter Wondercon 2024",
    date: "2024-12-10",
    endDate: "2024-12-12",
    location: "Downtown Convention Hall",
    type: "convention" as const,
    cosplays: [
      {
        character: "Ciri",
        series: "The Witcher 3",
        day: "All Days",
      },
    ],
    photos: 45,
    rating: 5,
  },
]

export default function EventsPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="max-w-full flex-1 overflow-x-hidden">
          <PageHeader
            searchPlaceholder="Search events..."
            notifications={[
              {
                title: "Event in 2 weeks",
                description: "Anime Expo 2025 - Start packing!",
              },
            ]}
          />

          <div className="p-6">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-balance text-3xl font-bold leading-tight">Events</h1>
                <p className="text-pretty text-muted-foreground">
                  Manage your conventions, photoshoots, and cosplay gatherings
                </p>
              </div>
              <Button variant="outline" size="icon">
                <CalendarIcon className="size-5" />
              </Button>
            </div>

            <Tabs defaultValue="upcoming" className="space-y-6">
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming ({upcomingEvents.length})</TabsTrigger>
                <TabsTrigger value="past">Past Events ({pastEvents.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-6">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} {...event} status="upcoming" />
                ))}
              </TabsContent>

              <TabsContent value="past" className="space-y-6">
                {pastEvents.map((event) => (
                  <EventCard key={event.id} {...event} status="past" />
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
