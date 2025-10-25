import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    trend: "up" | "down"
  }
  icon: React.ReactNode
}

export function StatCard({ title, value, change, icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {change && (
              <div className="flex items-center gap-1 text-sm">
                {change.trend === "up" ? (
                  <TrendingUp className="size-4 text-primary" />
                ) : (
                  <TrendingDown className="size-4 text-destructive" />
                )}
                <span className={change.trend === "up" ? "text-primary" : "text-destructive"}>
                  {change.value}% from last month
                </span>
              </div>
            )}
          </div>
          <div className="rounded-lg bg-primary/10 p-3 text-primary">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}
