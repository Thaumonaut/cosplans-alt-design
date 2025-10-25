import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Package, Camera, CheckCircle2, Upload } from "lucide-react"

interface Activity {
  id: number
  type: "material" | "photo" | "completion" | "upload"
  title: string
  description: string
  time: string
}

const activities: Activity[] = [
  {
    id: 1,
    type: "material",
    title: "Materials ordered",
    description: "EVA foam and contact cement for Malenia armor",
    time: "2 hours ago",
  },
  {
    id: 2,
    type: "photo",
    title: "Progress photos added",
    description: "Uploaded 12 photos to Raiden Shogun project",
    time: "5 hours ago",
  },
  {
    id: 3,
    type: "completion",
    title: "Task completed",
    description: "Finished wig styling for Ciri cosplay",
    time: "Yesterday",
  },
  {
    id: 4,
    type: "upload",
    title: "Pattern uploaded",
    description: "Added kimono pattern to resources",
    time: "2 days ago",
  },
]

const activityIcons = {
  material: Package,
  photo: Camera,
  completion: CheckCircle2,
  upload: Upload,
}

const activityColors = {
  material: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  photo: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  completion: "bg-primary/10 text-primary",
  upload: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
}

export function RecentActivityWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type]
          return (
            <div key={activity.id} className="flex gap-3">
              <Avatar className={`size-10 ${activityColors[activity.type]}`}>
                <AvatarFallback className={activityColors[activity.type]}>
                  <Icon className="size-5" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-sm font-medium leading-tight">{activity.title}</p>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
