import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Event {
  id: number
  title: string
  date: string
  location: string
  type: "convention" | "photoshoot" | "meetup"
  cosplays: string[]
}

const events: Event[] = [
  {
    id: 1,
    title: "Anime Expo 2025",
    date: "Nov 8, 2025",
    location: "Los Angeles, CA",
    type: "convention",
    cosplays: ["Malenia", "Raiden Shogun"],
  },
  {
    id: 2,
    title: "Forest Photoshoot",
    date: "Nov 15, 2025",
    location: "Griffith Park",
    type: "photoshoot",
    cosplays: ["Ciri"],
  },
  {
    id: 3,
    title: "Genshin Meetup",
    date: "Nov 22, 2025",
    location: "Santa Monica Pier",
    type: "meetup",
    cosplays: ["Raiden Shogun"],
  },
]

const typeColors = {
  convention: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  photoshoot: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  meetup: "bg-primary/10 text-primary",
}

export function UpcomingEventsWidget() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Upcoming Events</CardTitle>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="flex gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="size-6" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="font-semibold leading-tight">{event.title}</h4>
                  <p className="text-sm text-muted-foreground">{event.date}</p>
                </div>
                <Badge className={typeColors[event.type]} variant="secondary">
                  {event.type}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="size-3.5" />
                  <span>{event.cosplays.join(", ")}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
