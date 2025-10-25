import { Skeleton } from "@/components/ui/skeleton"

export default function TimelineLoading() {
  return (
    <div className="p-6">
      <div className="mb-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  )
}
