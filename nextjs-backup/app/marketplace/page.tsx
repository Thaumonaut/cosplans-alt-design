"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreationFlyout } from "@/components/creation-flyout"
import { ServiceCreationForm } from "@/components/service-creation-form"
import {
  Star,
  MapPin,
  Clock,
  DollarSign,
  Scissors,
  Camera,
  Palette,
  Shirt,
  Package,
  Sparkles,
  Users,
} from "lucide-react"

const serviceCategories = [
  { id: "all", label: "All Services", icon: Sparkles },
  { id: "wig-styling", label: "Wig Styling", icon: Scissors },
  { id: "photography", label: "Photography", icon: Camera },
  { id: "makeup", label: "Makeup", icon: Palette },
  { id: "costume-making", label: "Costume Making", icon: Shirt },
  { id: "prop-making", label: "Prop Making", icon: Package },
  { id: "group-cosplay", label: "Group Cosplay", icon: Users },
]

const services = [
  {
    id: 1,
    title: "Professional Wig Styling & Cutting",
    provider: {
      name: "Sarah Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.9,
      reviewCount: 127,
      verified: true,
    },
    category: "wig-styling",
    price: { min: 50, max: 150 },
    turnaround: "3-5 days",
    location: "Los Angeles, CA",
    image: "/colorful-anime-wig-styling.jpg",
    tags: ["Anime", "Game Characters", "Long Wigs"],
    completedOrders: 250,
  },
  {
    id: 2,
    title: "Convention & Cosplay Photography",
    provider: {
      name: "Mike Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 5.0,
      reviewCount: 89,
      verified: true,
    },
    category: "photography",
    price: { min: 100, max: 300 },
    turnaround: "1-2 weeks",
    location: "New York, NY",
    image: "/cosplay-photoshoot-studio.jpg",
    tags: ["Studio", "Outdoor", "Editing Included"],
    completedOrders: 180,
  },
  {
    id: 3,
    title: "Character Makeup & SFX",
    provider: {
      name: "Emma Thompson",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.8,
      reviewCount: 156,
      verified: true,
    },
    category: "makeup",
    price: { min: 75, max: 200 },
    turnaround: "Same day",
    location: "Chicago, IL",
    image: "/cosplay-makeup-special-effects.jpg",
    tags: ["SFX", "Body Paint", "Prosthetics"],
    completedOrders: 320,
  },
  {
    id: 4,
    title: "Custom Costume Commissions",
    provider: {
      name: "Alex Kim",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.9,
      reviewCount: 94,
      verified: true,
    },
    category: "costume-making",
    price: { min: 200, max: 800 },
    turnaround: "4-8 weeks",
    location: "Seattle, WA",
    image: "/detailed-cosplay-costume-armor.jpg",
    tags: ["Armor", "Detailed Work", "All Sizes"],
    completedOrders: 145,
  },
  {
    id: 5,
    title: "Weapon & Prop Fabrication",
    provider: {
      name: "Jordan Lee",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 5.0,
      reviewCount: 73,
      verified: true,
    },
    category: "prop-making",
    price: { min: 80, max: 400 },
    turnaround: "2-4 weeks",
    location: "Austin, TX",
    image: "/cosplay-prop-weapon-sword.jpg",
    tags: ["3D Printing", "EVA Foam", "LED Effects"],
    completedOrders: 210,
  },
  {
    id: 6,
    title: "Group Cosplay Coordination",
    provider: {
      name: "Taylor Martinez",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.7,
      reviewCount: 45,
      verified: true,
    },
    category: "group-cosplay",
    price: { min: 150, max: 500 },
    turnaround: "Varies",
    location: "Remote",
    image: "/group-cosplay-team-photo.jpg",
    tags: ["Planning", "Coordination", "Remote"],
    completedOrders: 67,
  },
]

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isServiceFlyoutOpen, setIsServiceFlyoutOpen] = useState(false)

  const filteredServices =
    selectedCategory === "all" ? services : services.filter((service) => service.category === selectedCategory)

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="max-w-full flex-1 overflow-x-hidden">
          <PageHeader title="Marketplace" searchPlaceholder="Search services..." notifications={3}>
            <Button size="sm" onClick={() => setIsServiceFlyoutOpen(true)}>
              <Sparkles className="mr-2 size-4" />
              Offer Service
            </Button>
          </PageHeader>

          <div className="space-y-6 p-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {serviceCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="shrink-0"
                >
                  <category.icon className="mr-2 size-4" />
                  {category.label}
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredServices.length} service{filteredServices.length !== 1 ? "s" : ""} available
              </p>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
                <TabsList>
                  <TabsTrigger value="grid">Grid</TabsTrigger>
                  <TabsTrigger value="list">List</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className={viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-4"}>
              {filteredServices.map((service) => (
                <Card key={service.id} className="overflow-hidden">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={service.image || "/placeholder.svg"}
                      alt={service.title}
                      className="size-full object-cover transition-transform hover:scale-105"
                    />
                    {service.provider.verified && <Badge className="absolute right-2 top-2 bg-primary">Verified</Badge>}
                  </div>
                  <CardHeader className="space-y-3 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 font-semibold leading-tight">{service.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-8">
                        <AvatarImage src={service.provider.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{service.provider.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium">{service.provider.name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="size-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{service.provider.rating}</span>
                          <span>({service.provider.reviewCount})</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-3">
                    <div className="flex flex-wrap gap-1">
                      {service.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="size-3" />
                        <span>
                          ${service.price.min}-${service.price.max}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="size-3" />
                        <span>{service.turnaround}</span>
                      </div>
                      <div className="col-span-2 flex items-center gap-1">
                        <MapPin className="size-3" />
                        <span>{service.location}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{service.completedOrders} completed orders</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button className="w-full" size="sm">
                      Request Commission
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
      <CreationFlyout
        isOpen={isServiceFlyoutOpen}
        onClose={() => setIsServiceFlyoutOpen(false)}
        title="Offer a Service"
      >
        <ServiceCreationForm />
      </CreationFlyout>
    </SidebarProvider>
  )
}
