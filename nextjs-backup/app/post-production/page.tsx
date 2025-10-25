"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  ImageIcon,
  Instagram,
  Twitter,
  Facebook,
  Calendar,
  FileText,
  Download,
  Share2,
  Edit3,
  Check,
  Clock,
  Sparkles,
  Layout,
  Camera,
  Palette,
  Settings,
} from "lucide-react"
import { useState } from "react"

const workflowTemplates = [
  {
    id: "photographer",
    name: "Photographer",
    icon: Camera,
    sections: ["Photo Editing", "Social Media", "Client Delivery", "Notes"],
  },
  {
    id: "prop-maker",
    name: "Prop Maker",
    icon: Palette,
    sections: ["Documentation", "Social Media", "Process Notes", "Future Reference"],
  },
  {
    id: "cosplayer",
    name: "Cosplayer",
    icon: Sparkles,
    sections: ["Photo Selection", "Social Media", "Event Recap", "Portfolio"],
  },
  {
    id: "custom",
    name: "Custom",
    icon: Layout,
    sections: ["Flexible Layout"],
  },
]

const socialPlatforms = [
  { name: "Instagram", icon: Instagram, color: "text-pink-500" },
  { name: "Twitter", icon: Twitter, color: "text-blue-400" },
  { name: "Facebook", icon: Facebook, color: "text-blue-600" },
]

export default function PostProductionPage() {
  const [selectedTemplate, setSelectedTemplate] = useState("photographer")
  const [activeTab, setActiveTab] = useState("editing")

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="max-w-full flex-1 overflow-x-hidden">
          <PageHeader
            searchPlaceholder="Search projects..."
            notifications={[
              {
                title: "Editing complete",
                description: "45 photos ready for social media",
              },
            ]}
          >
            <Button size="sm" variant="outline">
              <Settings className="size-4" />
            </Button>
            <Button size="sm">
              <Plus className="size-4" />
            </Button>
          </PageHeader>

          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-balance text-3xl font-bold leading-tight">Post Production</h1>
              <p className="text-pretty text-muted-foreground">
                Organize your final workflow, share your work, and document your process
              </p>
            </div>

            {/* Workflow Template Selector */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Workflow Template</CardTitle>
                <CardDescription>
                  Choose a template that matches your workflow or create a custom layout
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {workflowTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`flex flex-col items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
                        selectedTemplate === template.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <template.icon className="size-8 text-primary" />
                      <span className="font-medium">{template.name}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Main Workflow Area */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="editing">
                  <Edit3 className="mr-2 size-4" />
                  Editing
                </TabsTrigger>
                <TabsTrigger value="social">
                  <Share2 className="mr-2 size-4" />
                  Social Media
                </TabsTrigger>
                <TabsTrigger value="delivery">
                  <Download className="mr-2 size-4" />
                  Delivery
                </TabsTrigger>
                <TabsTrigger value="notes">
                  <FileText className="mr-2 size-4" />
                  Notes
                </TabsTrigger>
              </TabsList>

              {/* Photo Editing Tab */}
              <TabsContent value="editing" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-3">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Photo Editing Progress</CardTitle>
                      <CardDescription>Track your editing workflow and organize photos</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Raw Photos</p>
                            <p className="text-2xl font-bold">120</p>
                          </div>
                          <Badge variant="secondary">Imported</Badge>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Edited Photos</p>
                            <p className="text-2xl font-bold">45 / 120</p>
                          </div>
                          <Badge>In Progress</Badge>
                        </div>
                        <Progress value={37.5} className="h-2" />
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Favorites Selected</p>
                            <p className="text-2xl font-bold">12</p>
                          </div>
                          <Badge variant="outline">Ready</Badge>
                        </div>
                        <Progress value={100} className="h-2" />
                      </div>

                      <div className="grid gap-3 pt-4">
                        <Button className="w-full">
                          <ImageIcon className="mr-2 size-4" />
                          Open in Editor
                        </Button>
                        <Button variant="outline" className="w-full bg-transparent">
                          <Download className="mr-2 size-4" />
                          Export Edited Photos
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Check className="mr-2 size-4" />
                        Mark Batch Complete
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <ImageIcon className="mr-2 size-4" />
                        Add Watermark
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Download className="mr-2 size-4" />
                        Batch Export
                      </Button>
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Share2 className="mr-2 size-4" />
                        Share Preview
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Photo Gallery */}
                <Card>
                  <CardHeader>
                    <CardTitle>Photo Gallery</CardTitle>
                    <CardDescription>View and organize your edited photos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border">
                          <img
                            src={`/cosplay-photo-.jpg?height=300&width=300&query=cosplay photo ${i}`}
                            alt={`Photo ${i}`}
                            className="size-full object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                            <div className="flex size-full items-center justify-center gap-2">
                              <Button size="sm" variant="secondary">
                                <Edit3 className="size-4" />
                              </Button>
                              <Button size="sm" variant="secondary">
                                <Share2 className="size-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Social Media Tab */}
              <TabsContent value="social" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Schedule Posts</CardTitle>
                      <CardDescription>Plan and schedule your social media content</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Platform</Label>
                        <Select defaultValue="instagram">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {socialPlatforms.map((platform) => (
                              <SelectItem key={platform.name} value={platform.name.toLowerCase()}>
                                <div className="flex items-center gap-2">
                                  <platform.icon className={`size-4 ${platform.color}`} />
                                  {platform.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Caption</Label>
                        <Textarea
                          placeholder="Write your caption here... Include hashtags and mentions"
                          className="min-h-32"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Schedule Date</Label>
                          <Input type="date" />
                        </div>
                        <div className="space-y-2">
                          <Label>Schedule Time</Label>
                          <Input type="time" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Select Photos</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {[1, 2, 3, 4].map((i) => (
                            <button
                              key={i}
                              className="aspect-square overflow-hidden rounded-lg border-2 border-dashed border-border hover:border-primary"
                            >
                              <img
                                src={`/diverse-group-candid-photo.png?height=100&width=100&query=photo ${i}`}
                                alt={`Select ${i}`}
                                className="size-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <Button className="w-full">
                        <Calendar className="mr-2 size-4" />
                        Schedule Post
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Scheduled Posts</CardTitle>
                      <CardDescription>Upcoming social media posts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        {
                          platform: "Instagram",
                          date: "Jan 25, 2025",
                          time: "6:00 PM",
                          status: "scheduled",
                        },
                        {
                          platform: "Twitter",
                          date: "Jan 26, 2025",
                          time: "12:00 PM",
                          status: "scheduled",
                        },
                        {
                          platform: "Facebook",
                          date: "Jan 27, 2025",
                          time: "3:00 PM",
                          status: "draft",
                        },
                      ].map((post, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                          <div className="flex items-center gap-3">
                            {post.platform === "Instagram" && <Instagram className="size-5 text-pink-500" />}
                            {post.platform === "Twitter" && <Twitter className="size-5 text-blue-400" />}
                            {post.platform === "Facebook" && <Facebook className="size-5 text-blue-600" />}
                            <div>
                              <p className="font-medium">{post.platform}</p>
                              <p className="text-sm text-muted-foreground">
                                {post.date} at {post.time}
                              </p>
                            </div>
                          </div>
                          <Badge variant={post.status === "scheduled" ? "default" : "secondary"}>
                            {post.status === "scheduled" ? (
                              <>
                                <Clock className="mr-1 size-3" />
                                Scheduled
                              </>
                            ) : (
                              "Draft"
                            )}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Delivery Tab */}
              <TabsContent value="delivery" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Client Delivery</CardTitle>
                    <CardDescription>Prepare and deliver final files to clients or collaborators</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Export Format</Label>
                        <Select defaultValue="jpg">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="jpg">JPEG</SelectItem>
                            <SelectItem value="png">PNG</SelectItem>
                            <SelectItem value="raw">RAW</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Resolution</Label>
                        <Select defaultValue="high">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High (4K)</SelectItem>
                            <SelectItem value="medium">Medium (1080p)</SelectItem>
                            <SelectItem value="web">Web Optimized</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Watermark</Label>
                        <Select defaultValue="none">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="corner">Corner</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Delivery Notes</Label>
                      <Textarea placeholder="Add any notes or instructions for the recipient..." />
                    </div>

                    <div className="flex gap-3">
                      <Button className="flex-1">
                        <Download className="mr-2 size-4" />
                        Download Package
                      </Button>
                      <Button variant="outline" className="flex-1 bg-transparent">
                        <Share2 className="mr-2 size-4" />
                        Share Link
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Process Documentation</CardTitle>
                      <CardDescription>Document your workflow for future reference</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>What Worked Well</Label>
                        <Textarea
                          placeholder="Note successful techniques, settings, or approaches..."
                          className="min-h-32"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Challenges & Solutions</Label>
                        <Textarea placeholder="Document any issues and how you solved them..." className="min-h-32" />
                      </div>
                      <Button className="w-full">
                        <FileText className="mr-2 size-4" />
                        Save Notes
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Future Reference</CardTitle>
                      <CardDescription>Save important details for next time</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Equipment Used</Label>
                        <Textarea placeholder="List cameras, lenses, lighting, props..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Settings & Techniques</Label>
                        <Textarea placeholder="Camera settings, editing presets, special techniques..." />
                      </div>
                      <div className="space-y-2">
                        <Label>Improvements for Next Time</Label>
                        <Textarea placeholder="Ideas and improvements for future projects..." />
                      </div>
                      <Button variant="outline" className="w-full bg-transparent">
                        <Download className="mr-2 size-4" />
                        Export Documentation
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
