"use client"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function EquipmentPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="max-w-full flex-1 overflow-x-hidden">
          <PageHeader searchPlaceholder="Search equipment..." notifications={[]}>
            <Button size="icon">
              <Plus className="size-5" />
            </Button>
          </PageHeader>

          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-balance text-3xl font-bold leading-tight">Equipment</h1>
              <p className="text-pretty text-muted-foreground">Photography and event equipment</p>
            </div>

            <div className="flex min-h-[400px] items-center justify-center rounded-xl border-2 border-dashed">
              <div className="text-center">
                <p className="mb-2 text-lg font-medium text-muted-foreground">No equipment tracked yet</p>
                <p className="text-sm text-muted-foreground">Add cameras, lighting, and other event equipment</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
