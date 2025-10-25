import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex h-screen">
      <div className="w-80 border-r p-4">
        <Skeleton className="mb-4 h-10 w-full" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        <Skeleton className="h-16 w-full" />
        <div className="flex-1 p-4">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-3/4" />
            ))}
          </div>
        </div>
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  )
}
