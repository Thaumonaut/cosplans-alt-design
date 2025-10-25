import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, MapPin, CheckSquare, ArrowRight, Camera, Star } from "lucide-react"

interface EventCardProps {
  name: string
  date: string
  endDate: string
  location: string
  type: "convention" | "photoshoot" | "meetup"
  cosplays: Array<{
    character: string
    series: string
    day: string
  }>
  checklist?: {
    total: number
    completed: number
  }
  daysUntil?: number
  photos?: number
  rating?: number
  status: "upcoming" | "past"
}

const typeColors = {
  convention: "bg-primary/10 text-primary",
  photoshoot: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  meetup: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
}

export function EventCard({
  name,
  date,
  endDate,
  location,
  type,
  cosplays,
  checklist,
  daysUntil,
  photos,
  rating,
  status,
}: EventCardProps) {
  const checklistProgress = checklist ? (checklist.completed / checklist.total) * 100 : 0

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="flex flex-col gap-6 p-6 lg:flex-row">
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-balance text-xl font-semibold leading-tight">{name}</h3>
                <Badge className={typeColors[type]} variant="secondary">
                  {type}
                </Badge>
              </div>
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  <span>
                    {new Date(date).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                  </span>
                  {daysUntil !== undefined && (
                    <Badge variant="outline" className="ml-2">
                      {daysUntil} days away
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  <span>{location}</span>
                </div>
              </div>
            </div>
            <Button>
              View Details
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Planned Cosplays</h4>
            <div className="space-y-2">
              {cosplays.map((cosplay, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                  <div>
                    <p className="font-medium">{cosplay.character}</p>
                    <p className="text-sm text-muted-foreground">{cosplay.series}</p>
                  </div>
                  <Badge variant="outline">{cosplay.day}</Badge>
                </div>
              ))}
            </div>
          </div>

          {status === "upcoming" && checklist && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckSquare className="size-4" />
                  <span>Event Checklist</span>
                </div>
                <span className="font-medium">
                  {checklist.completed} / {checklist.total}
                </span>
              </div>
              <Progress value={checklistProgress} className="h-2" />
            </div>
          )}

          {status === "past" && (
            <div className="flex items-center gap-6 rounded-lg border bg-muted/30 p-3">
              {photos !== undefined && (
                <div className="flex items-center gap-2 text-sm">
                  <Camera className="size-4 text-muted-foreground" />
                  <span className="font-medium">{photos} photos</span>
                </div>
              )}
              {rating !== undefined && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${i < rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
