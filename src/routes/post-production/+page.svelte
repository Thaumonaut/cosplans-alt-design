<script lang="ts">
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
  } from 'lucide-svelte';
  import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Progress, Textarea, Input, Label } from '$lib/components/ui';

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
  ];

  const socialPlatforms = [
    { name: "Instagram", icon: Instagram, color: "text-pink-500" },
    { name: "Twitter", icon: Twitter, color: "text-blue-400" },
    { name: "Facebook", icon: Facebook, color: "text-blue-600" },
  ];

  let selectedTemplate = $state("photographer");
  let activeTab = $state("editing");
</script>

<svelte:head>
  <title>Post Production - Cosplay Tracker</title>
</svelte:head>

<!-- Page Header Actions -->
<div class="flex items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div class="flex items-center gap-4">
    <h1 class="font-semibold">Post Production</h1>
  </div>
  
  <div class="flex items-center gap-2">
    <Button size="sm" variant="outline">
      <Settings class="size-4" />
    </Button>
    <Button size="sm">
      <Plus class="size-4" />
    </Button>
  </div>
</div>

<div class="p-6">
  <div class="mb-8">
    <h1 class="text-balance text-3xl font-bold leading-tight">Post Production</h1>
    <p class="text-pretty text-muted-foreground">
      Organize your final workflow, share your work, and document your process
    </p>
  </div>

  <!-- Workflow Template Selector -->
  <Card class="mb-6">
    <CardHeader>
      <CardTitle>Workflow Template</CardTitle>
      <CardDescription>
        Choose a template that matches your workflow or create a custom layout
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {#each workflowTemplates as template}
          <button
            onclick={() => selectedTemplate = template.id}
            class="flex flex-col items-center gap-3 rounded-lg border-2 p-4 transition-colors {selectedTemplate === template.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}"
          >
            <template.icon class="size-8 text-primary" />
            <span class="font-medium">{template.name}</span>
          </button>
        {/each}
      </div>
    </CardContent>
  </Card>

  <!-- Main Workflow Area -->
  <div class="space-y-6">
    <div class="flex gap-2">
      <Button 
        variant={activeTab === "editing" ? "default" : "outline"} 
        size="sm"
        onclick={() => activeTab = "editing"}
      >
        <Edit3 class="mr-2 size-4" />
        Editing
      </Button>
      <Button 
        variant={activeTab === "social" ? "default" : "outline"} 
        size="sm"
        onclick={() => activeTab = "social"}
      >
        <Share2 class="mr-2 size-4" />
        Social Media
      </Button>
      <Button 
        variant={activeTab === "delivery" ? "default" : "outline"} 
        size="sm"
        onclick={() => activeTab = "delivery"}
      >
        <Download class="mr-2 size-4" />
        Delivery
      </Button>
      <Button 
        variant={activeTab === "notes" ? "default" : "outline"} 
        size="sm"
        onclick={() => activeTab = "notes"}
      >
        <FileText class="mr-2 size-4" />
        Notes
      </Button>
    </div>

    {#if activeTab === "editing"}
      <!-- Photo Editing Tab -->
      <div class="space-y-6">
        <div class="grid gap-6 lg:grid-cols-3">
          <Card class="lg:col-span-2">
            <CardHeader>
              <CardTitle>Photo Editing Progress</CardTitle>
              <CardDescription>Track your editing workflow and organize photos</CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="space-y-1">
                    <p class="text-sm font-medium">Raw Photos</p>
                    <p class="text-2xl font-bold">120</p>
                  </div>
                  <Badge variant="secondary">Imported</Badge>
                </div>
                <Progress value={100} class="h-2" />
              </div>

              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="space-y-1">
                    <p class="text-sm font-medium">Edited Photos</p>
                    <p class="text-2xl font-bold">45 / 120</p>
                  </div>
                  <Badge>In Progress</Badge>
                </div>
                <Progress value={37.5} class="h-2" />
              </div>

              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="space-y-1">
                    <p class="text-sm font-medium">Favorites Selected</p>
                    <p class="text-2xl font-bold">12</p>
                  </div>
                  <Badge variant="outline">Ready</Badge>
                </div>
                <Progress value={100} class="h-2" />
              </div>

              <div class="grid gap-3 pt-4">
                <Button class="w-full">
                  <ImageIcon class="mr-2 size-4" />
                  Open in Editor
                </Button>
                <Button variant="outline" class="w-full bg-transparent">
                  <Download class="mr-2 size-4" />
                  Export Edited Photos
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent class="space-y-3">
              <Button variant="outline" class="w-full justify-start bg-transparent">
                <Check class="mr-2 size-4" />
                Mark Batch Complete
              </Button>
              <Button variant="outline" class="w-full justify-start bg-transparent">
                <ImageIcon class="mr-2 size-4" />
                Add Watermark
              </Button>
              <Button variant="outline" class="w-full justify-start bg-transparent">
                <Download class="mr-2 size-4" />
                Batch Export
              </Button>
              <Button variant="outline" class="w-full justify-start bg-transparent">
                <Share2 class="mr-2 size-4" />
                Share Preview
              </Button>
            </CardContent>
          </Card>
        </div>

        <!-- Photo Gallery -->
        <Card>
          <CardHeader>
            <CardTitle>Photo Gallery</CardTitle>
            <CardDescription>View and organize your edited photos</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {#each Array(8).fill(0) as _, i}
                <div class="group relative aspect-square overflow-hidden rounded-lg border">
                  <img
                    src="/cosplay-photo-.jpg?height=300&width=300&query=cosplay photo {i + 1}"
                    alt="Photo {i + 1}"
                    class="size-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div class="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <div class="flex size-full items-center justify-center gap-2">
                      <Button size="sm" variant="secondary">
                        <Edit3 class="size-4" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Share2 class="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </CardContent>
        </Card>
      </div>
    {:else if activeTab === "social"}
      <!-- Social Media Tab -->
      <div class="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Schedule Posts</CardTitle>
            <CardDescription>Plan and schedule your social media content</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label>Platform</Label>
              <select class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>

            <div class="space-y-2">
              <Label>Caption</Label>
              <Textarea
                placeholder="Write your caption here... Include hashtags and mentions"
                class="min-h-32"
              />
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <Label>Schedule Date</Label>
                <Input type="date" />
              </div>
              <div class="space-y-2">
                <Label>Schedule Time</Label>
                <Input type="time" />
              </div>
            </div>

            <div class="space-y-2">
              <Label>Select Photos</Label>
              <div class="grid grid-cols-4 gap-2">
                {#each Array(4).fill(0) as _, i}
                  <button
                    class="aspect-square overflow-hidden rounded-lg border-2 border-dashed border-border hover:border-primary"
                  >
                    <img
                      src="/diverse-group-candid-photo.png?height=100&width=100&query=photo {i + 1}"
                      alt="Select {i + 1}"
                      class="size-full object-cover"
                    />
                  </button>
                {/each}
              </div>
            </div>

            <Button class="w-full">
              <Calendar class="mr-2 size-4" />
              Schedule Post
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scheduled Posts</CardTitle>
            <CardDescription>Upcoming social media posts</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            {#each [
              { platform: "Instagram", date: "Jan 25, 2025", time: "6:00 PM", status: "scheduled" },
              { platform: "Twitter", date: "Jan 26, 2025", time: "12:00 PM", status: "scheduled" },
              { platform: "Facebook", date: "Jan 27, 2025", time: "3:00 PM", status: "draft" },
            ] as post}
              <div class="flex items-center justify-between rounded-lg border p-4">
                <div class="flex items-center gap-3">
                  {#if post.platform === "Instagram"}
                    <Instagram class="size-5 text-pink-500" />
                  {:else if post.platform === "Twitter"}
                    <Twitter class="size-5 text-blue-400" />
                  {:else if post.platform === "Facebook"}
                    <Facebook class="size-5 text-blue-600" />
                  {/if}
                  <div>
                    <p class="font-medium">{post.platform}</p>
                    <p class="text-sm text-muted-foreground">
                      {post.date} at {post.time}
                    </p>
                  </div>
                </div>
                <Badge variant={post.status === "scheduled" ? "default" : "secondary"}>
                  {#if post.status === "scheduled"}
                    <Clock class="mr-1 size-3" />
                    Scheduled
                  {:else}
                    Draft
                  {/if}
                </Badge>
              </div>
            {/each}
          </CardContent>
        </Card>
      </div>
    {:else if activeTab === "delivery"}
      <!-- Delivery Tab -->
      <Card>
        <CardHeader>
          <CardTitle>Client Delivery</CardTitle>
          <CardDescription>Prepare and deliver final files to clients or collaborators</CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="grid gap-4 sm:grid-cols-3">
            <div class="space-y-2">
              <Label>Export Format</Label>
              <select class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <option value="jpg">JPEG</option>
                <option value="png">PNG</option>
                <option value="raw">RAW</option>
              </select>
            </div>
            <div class="space-y-2">
              <Label>Resolution</Label>
              <select class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <option value="high">High (4K)</option>
                <option value="medium">Medium (1080p)</option>
                <option value="web">Web Optimized</option>
              </select>
            </div>
            <div class="space-y-2">
              <Label>Watermark</Label>
              <select class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <option value="none">None</option>
                <option value="corner">Corner</option>
                <option value="center">Center</option>
              </select>
            </div>
          </div>

          <div class="space-y-2">
            <Label>Delivery Notes</Label>
            <Textarea placeholder="Add any notes or instructions for the recipient..." />
          </div>

          <div class="flex gap-3">
            <Button class="flex-1">
              <Download class="mr-2 size-4" />
              Download Package
            </Button>
            <Button variant="outline" class="flex-1 bg-transparent">
              <Share2 class="mr-2 size-4" />
              Share Link
            </Button>
          </div>
        </CardContent>
      </Card>
    {:else}
      <!-- Notes Tab -->
      <div class="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Process Documentation</CardTitle>
            <CardDescription>Document your workflow for future reference</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label>What Worked Well</Label>
              <Textarea
                placeholder="Note successful techniques, settings, or approaches..."
                class="min-h-32"
              />
            </div>
            <div class="space-y-2">
              <Label>Challenges & Solutions</Label>
              <Textarea placeholder="Document any issues and how you solved them..." class="min-h-32" />
            </div>
            <Button class="w-full">
              <FileText class="mr-2 size-4" />
              Save Notes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Future Reference</CardTitle>
            <CardDescription>Save important details for next time</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label>Equipment Used</Label>
              <Textarea placeholder="List cameras, lenses, lighting, props..." />
            </div>
            <div class="space-y-2">
              <Label>Settings & Techniques</Label>
              <Textarea placeholder="Camera settings, editing presets, special techniques..." />
            </div>
            <div class="space-y-2">
              <Label>Improvements for Next Time</Label>
              <Textarea placeholder="Ideas and improvements for future projects..." />
            </div>
            <Button variant="outline" class="w-full bg-transparent">
              <Download class="mr-2 size-4" />
              Export Documentation
            </Button>
          </CardContent>
        </Card>
      </div>
    {/if}
  </div>
</div>