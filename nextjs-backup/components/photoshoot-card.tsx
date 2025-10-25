import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, MapPin, Camera, Heart, ArrowRight, User } from "lucide-react"
import Image from "next/image"

interface PhotoshootCardProps {
  title: string
  character: string
  series: string
  date: string
  location: string
  photographer: string
  photos: {
    total: number
    edited: number
    favorites: number
  }
  coverImage: string
  status: "planning" | "editing" | "completed"
  variant?: "grid" | "list"
}

const statusColors = {
  planning: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  editing: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
}

export function PhotoshootCard({
  title,
  character,
  series,
  date,
  location,
  photographer,
  photos,
  coverImage,
  status,
  variant = "grid",
}: PhotoshootCardProps) {
  const editProgress = (photos.edited / photos.total) * 100

  if (variant === "list") {
    return (
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="flex gap-4 p-4">
          <div className="relative h-32 w-48 shrink-0 overflow-hidden rounded-lg bg-muted">
            <Image src={coverImage || "/placeholder.svg"} alt={title} fill className="object-cover" />
          </div>
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="text-balance font-semibold leading-tight">{title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {character} - {series}
                  </p>
                </div>
                <Badge className={statusColors[status]} variant="secondary">
                  {status}
                </Badge>
              </div>
              <div className="mb-3 flex flex-col gap-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  <span>{new Date(date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  <span>{location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="size-4" />
                  <span>{photographer}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Camera className="size-4 text-muted-foreground" />
                  <span className="font-medium">{photos.total} photos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Heart className="size-4 text-muted-foreground" />
                  <span className="font-medium">{photos.favorites} favorites</span>
                </div>
              </div>
              <Button size="sm">
                View Gallery
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={coverImage || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute right-3 top-3">
            <Badge className={statusColors[status]} variant="secondary">
              {status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="text-balance font-semibold leading-tight">{title}</h3>
            <p className="text-sm text-muted-foreground">
              {character} - {series}
            </p>
          </div>

          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="size-4" />
              <span>{new Date(date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="size-4" />
              <span>{photographer}</span>
            </div>
          </div>

          {status === "editing" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Editing Progress</span>
                <span className="font-medium">
                  {photos.edited} / {photos.total}
                </span>
              </div>
              <Progress value={editProgress} className="h-2" />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t bg-muted/30 p-4 text-sm">
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Camera className="size-4" />
            <span>{photos.total}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Heart className="size-4" />
            <span>{photos.favorites}</span>
          </div>
        </div>
        <Button size="sm" variant="ghost">
          View Gallery
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
