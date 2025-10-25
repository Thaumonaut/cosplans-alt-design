import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, DollarSign, Clock, ArrowRight, Star } from "lucide-react"
import Image from "next/image"

interface IdeaCardProps {
  character: string
  series: string
  image: string
  difficulty: "easy" | "medium" | "hard"
  estimatedCost: number
  estimatedTime: string
  tags: string[]
  notes: string
  inspiration: string[]
  dateAdded: string
  variant?: "grid" | "list"
}

const difficultyColors = {
  easy: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  hard: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
}

export function IdeaCard({
  character,
  series,
  image,
  difficulty,
  estimatedCost,
  estimatedTime,
  tags,
  notes,
  dateAdded,
  variant = "grid",
}: IdeaCardProps) {
  if (variant === "list") {
    return (
      <Card className="group overflow-hidden transition-all hover:shadow-md">
        <div className="flex gap-4 p-4">
          <div className="relative size-32 shrink-0 overflow-hidden rounded-lg bg-muted">
            <Image src={image || "/placeholder.svg"} alt={character} fill className="object-cover" />
          </div>
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="text-balance font-semibold leading-tight">{character}</h3>
                  <p className="text-sm text-muted-foreground">{series}</p>
                </div>
                <Badge className={difficultyColors[difficulty]} variant="secondary">
                  {difficulty}
                </Badge>
              </div>
              <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{notes}</p>
              <div className="flex flex-wrap gap-1.5">
                {tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="size-4" />
                  <span>${estimatedCost}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="size-4" />
                  <span>{estimatedTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-4" />
                  <span>{new Date(dateAdded).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Star className="size-4" />
                </Button>
                <Button size="sm">
                  Start Planning
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
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
            src={image || "/placeholder.svg"}
            alt={character}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute right-3 top-3 flex gap-2">
            <Badge className={difficultyColors[difficulty]} variant="secondary">
              {difficulty}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-3 top-3 bg-background/80 backdrop-blur hover:bg-background"
          >
            <Star className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="text-balance font-semibold leading-tight">{character}</h3>
            <p className="text-sm text-muted-foreground">{series}</p>
          </div>

          <p className="line-clamp-2 text-sm text-muted-foreground">{notes}</p>

          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 border-t bg-muted/30 p-4">
        <div className="flex w-full items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <DollarSign className="size-4" />
            <span>${estimatedCost}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="size-4" />
            <span>{estimatedTime}</span>
          </div>
        </div>
        <Button className="w-full" size="sm">
          Start Planning
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
