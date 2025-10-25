"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreationFlyout } from "@/components/creation-flyout"
import { ServiceCreationForm } from "@/components/service-creation-form"
import {
  Star,
  MapPin,
  Calendar,
  Award,
  Heart,
  MessageSquare,
  Settings,
  Plus,
  ExternalLink,
  Instagram,
  Twitter,
  Globe,
} from "lucide-react"

const portfolioItems = [
  {
    id: 1,
    title: "Jinx - Arcane",
    image: "/jinx-arcane-blue-hair-twin-braids.jpg",
    likes: 234,
    comments: 45,
    event: "Anime Expo 2024",
  },
  {
    id: 2,
    title: "Fantasy Warrior",
    image: "/fantasy-warrior-armor-red-hair.jpg",
    likes: 189,
    comments: 32,
    event: "Comic Con 2024",
  },
  {
    id: 3,
    title: "Cyberpunk Character",
    image: "/cyberpunk-character-neon-jacket.jpg",
    likes: 312,
    comments: 67,
    event: "PAX West 2024",
  },
  {
    id: 4,
    title: "Anime Character",
    image: "/anime-character-purple-kimono.jpg",
    likes: 276,
    comments: 54,
    event: "Sakura Con 2024",
  },
  {
    id: 5,
    title: "Fantasy Warrior",
    image: "/fantasy-warrior-white-hair-sword.jpg",
    likes: 198,
    comments: 41,
    event: "Dragon Con 2024",
  },
  {
    id: 6,
    title: "Purple Katana",
    image: "/purple-katana-sword.jpg",
    likes: 156,
    comments: 28,
    event: "Katsucon 2024",
  },
]

const services = [
  {
    id: 1,
    title: "Professional Wig Styling",
    description:
      "Custom wig styling and cutting for anime and game characters. Specializing in long wigs and complex styles.",
    price: { min: 50, max: 150 },
    turnaround: "3-5 days",
    tags: ["Anime", "Game Characters", "Long Wigs"],
    active: true,
  },
  {
    id: 2,
    title: "Costume Consultation",
    description: "One-on-one consultation for costume planning, material selection, and construction techniques.",
    price: { min: 30, max: 60 },
    turnaround: "1 hour session",
    tags: ["Planning", "Materials", "Techniques"],
    active: true,
  },
]

const stats = [
  { label: "Projects Completed", value: "47" },
  { label: "Average Rating", value: "4.9" },
  { label: "Total Reviews", value: "127" },
  { label: "Response Time", value: "< 2 hours" },
]

const reviews = [
  {
    id: 1,
    author: "Emily R.",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    date: "2 weeks ago",
    comment:
      "Amazing wig styling! Sarah transformed my basic wig into an exact match for my character. Highly recommend!",
    service: "Professional Wig Styling",
  },
  {
    id: 2,
    author: "Marcus T.",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    date: "1 month ago",
    comment:
      "The consultation was incredibly helpful. Got great advice on materials and techniques that saved me time and money.",
    service: "Costume Consultation",
  },
  {
    id: 3,
    author: "Lisa K.",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 4,
    date: "1 month ago",
    comment: "Great work on the wig! Very professional and delivered on time. Will definitely commission again.",
    service: "Professional Wig Styling",
  },
]

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("portfolio")
  const [isServiceFlyoutOpen, setIsServiceFlyoutOpen] = useState(false)

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="max-w-full flex-1 overflow-x-hidden">
          <PageHeader title="Profile" searchPlaceholder="Search profile..." notifications={3}>
            <Button size="sm" variant="outline">
              <Settings className="mr-2 size-4" />
              Edit Profile
            </Button>
          </PageHeader>

          <div className="space-y-6 p-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col gap-6 md:flex-row">
                  <Avatar className="size-32 shrink-0">
                    <AvatarImage src="/placeholder.svg?height=128&width=128" />
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold">Sarah Chen</h1>
                        <Badge className="bg-primary">Verified</Badge>
                      </div>
                      <p className="text-muted-foreground">Professional Cosplayer & Wig Stylist</p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="size-4" />
                        <span>Los Angeles, CA</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="size-4" />
                        <span>Member since 2022</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="size-4" />
                        <span>250+ Completed Orders</span>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed">
                      Passionate cosplayer with 8+ years of experience. Specializing in wig styling, costume
                      construction, and character accuracy. Love bringing characters to life and helping others achieve
                      their cosplay dreams!
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Instagram className="mr-2 size-4" />
                        Instagram
                      </Button>
                      <Button size="sm" variant="outline">
                        <Twitter className="mr-2 size-4" />
                        Twitter
                      </Button>
                      <Button size="sm" variant="outline">
                        <Globe className="mr-2 size-4" />
                        Website
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="portfolio" className="mt-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {portfolioItems.map((item) => (
                    <Card key={item.id} className="group overflow-hidden">
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          className="size-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="absolute bottom-0 left-0 right-0 translate-y-full p-4 transition-transform group-hover:translate-y-0">
                          <h3 className="font-semibold text-white">{item.title}</h3>
                          <p className="text-sm text-white/80">{item.event}</p>
                          <div className="mt-2 flex gap-4 text-sm text-white/80">
                            <div className="flex items-center gap-1">
                              <Heart className="size-4" />
                              <span>{item.likes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="size-4" />
                              <span>{item.comments}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="services" className="mt-6">
                <div className="mb-4 flex justify-end">
                  <Button size="sm" onClick={() => setIsServiceFlyoutOpen(true)}>
                    <Plus className="mr-2 size-4" />
                    Add Service
                  </Button>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {services.map((service) => (
                    <Card key={service.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold">{service.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>
                                ${service.price.min}-${service.price.max}
                              </span>
                              <span>•</span>
                              <span>{service.turnaround}</span>
                            </div>
                          </div>
                          <Badge variant={service.active ? "default" : "secondary"}>
                            {service.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {service.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                            <ExternalLink className="mr-2 size-4" />
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <Avatar className="size-10 shrink-0">
                            <AvatarImage src={review.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{review.author[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">{review.author}</p>
                                <p className="text-xs text-muted-foreground">{review.date}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                {[...Array(review.rating)].map((_, i) => (
                                  <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {review.service}
                            </Badge>
                            <p className="text-sm leading-relaxed">{review.comment}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Service Creation Flyout */}
      <CreationFlyout
        isOpen={isServiceFlyoutOpen}
        onClose={() => setIsServiceFlyoutOpen(false)}
        title="Create New Service"
      >
        <ServiceCreationForm />
      </CreationFlyout>
    </SidebarProvider>
  )
}
