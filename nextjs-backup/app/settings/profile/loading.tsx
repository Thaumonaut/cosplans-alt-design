import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full">
      <div className="max-w-full flex-1 space-y-6 p-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  )
}
