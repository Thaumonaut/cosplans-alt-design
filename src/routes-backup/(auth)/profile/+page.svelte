<script lang="ts">
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
  } from 'lucide-svelte';
  import { Button, Card, CardContent, CardHeader, Badge, Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui';
  import CreationFlyout from '$lib/components/creation-flyout.svelte';
  import ServiceCreationForm from '$lib/components/service-creation-form.svelte';

  interface PortfolioItem {
    id: number;
    title: string;
    image: string;
    likes: number;
    comments: number;
    event: string;
  }

  interface Service {
    id: number;
    title: string;
    description: string;
    price: { min: number; max: number };
    turnaround: string;
    tags: string[];
    active: boolean;
  }

  interface Review {
    id: number;
    author: string;
    avatar: string;
    rating: number;
    date: string;
    comment: string;
    service: string;
  }

  const portfolioItems: PortfolioItem[] = [
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
  ];

  const services: Service[] = [
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
  ];

  const stats = [
    { label: "Projects Completed", value: "47" },
    { label: "Average Rating", value: "4.9" },
    { label: "Total Reviews", value: "127" },
    { label: "Response Time", value: "< 2 hours" },
  ];

  const reviews: Review[] = [
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
  ];

  let activeTab = $state("portfolio");
  let isServiceFlyoutOpen = $state(false);
</script>

<svelte:head>
  <title>Profile - Cosplay Tracker</title>
</svelte:head>

<div class="space-y-6 p-6">
  <!-- Profile Header -->
  <Card>
    <CardContent class="p-6">
      <div class="flex flex-col gap-6 md:flex-row">
        <Avatar class="size-32 shrink-0">
          <AvatarImage src="/placeholder.svg?height=128&width=128" />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
        <div class="flex-1 space-y-4">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-bold">Sarah Chen</h1>
              <Badge class="bg-primary">Verified</Badge>
            </div>
            <p class="text-muted-foreground">Professional Cosplayer & Wig Stylist</p>
          </div>
          <div class="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div class="flex items-center gap-1">
              <MapPin class="size-4" />
              <span>Los Angeles, CA</span>
            </div>
            <div class="flex items-center gap-1">
              <Calendar class="size-4" />
              <span>Member since 2022</span>
            </div>
            <div class="flex items-center gap-1">
              <Award class="size-4" />
              <span>250+ Completed Orders</span>
            </div>
          </div>
          <p class="text-sm leading-relaxed">
            Passionate cosplayer with 8+ years of experience. Specializing in wig styling, costume
            construction, and character accuracy. Love bringing characters to life and helping others achieve
            their cosplay dreams!
          </p>
          <div class="flex gap-2">
            <Button size="sm" variant="outline">
              <Instagram class="mr-2 size-4" />
              Instagram
            </Button>
            <Button size="sm" variant="outline">
              <Twitter class="mr-2 size-4" />
              Twitter
            </Button>
            <Button size="sm" variant="outline">
              <Globe class="mr-2 size-4" />
              Website
            </Button>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <Button size="sm" variant="outline">
            <Settings class="mr-2 size-4" />
            Edit Profile
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- Stats -->
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {#each stats as stat}
      <Card>
        <CardContent class="p-6">
          <div class="text-2xl font-bold">{stat.value}</div>
          <div class="text-sm text-muted-foreground">{stat.label}</div>
        </CardContent>
      </Card>
    {/each}
  </div>

  <!-- Tabs -->
  <div class="space-y-6">
    <div class="flex gap-2">
      <Button 
        variant={activeTab === "portfolio" ? "default" : "outline"} 
        size="sm"
        onclick={() => activeTab = "portfolio"}
      >
        Portfolio
      </Button>
      <Button 
        variant={activeTab === "services" ? "default" : "outline"} 
        size="sm"
        onclick={() => activeTab = "services"}
      >
        Services
      </Button>
      <Button 
        variant={activeTab === "reviews" ? "default" : "outline"} 
        size="sm"
        onclick={() => activeTab = "reviews"}
      >
        Reviews
      </Button>
    </div>

    {#if activeTab === "portfolio"}
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each portfolioItems as item (item.id)}
          <Card class="group overflow-hidden">
            <div class="relative aspect-square overflow-hidden">
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.title}
                class="size-full object-cover transition-transform group-hover:scale-105"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div class="absolute bottom-0 left-0 right-0 translate-y-full p-4 transition-transform group-hover:translate-y-0">
                <h3 class="font-semibold text-white">{item.title}</h3>
                <p class="text-sm text-white/80">{item.event}</p>
                <div class="mt-2 flex gap-4 text-sm text-white/80">
                  <div class="flex items-center gap-1">
                    <Heart class="size-4" />
                    <span>{item.likes}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <MessageSquare class="size-4" />
                    <span>{item.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        {/each}
      </div>
    {:else if activeTab === "services"}
      <div class="space-y-4">
        <div class="flex justify-end">
          <Button size="sm" onclick={() => isServiceFlyoutOpen = true}>
            <Plus class="mr-2 size-4" />
            Add Service
          </Button>
        </div>
        <div class="grid gap-4 lg:grid-cols-2">
          {#each services as service (service.id)}
            <Card>
              <CardHeader>
                <div class="flex items-start justify-between">
                  <div class="space-y-1">
                    <h3 class="font-semibold">{service.title}</h3>
                    <div class="flex items-center gap-2 text-sm text-muted-foreground">
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
              <CardContent class="space-y-3">
                <p class="text-sm text-muted-foreground">{service.description}</p>
                <div class="flex flex-wrap gap-1">
                  {#each service.tags as tag}
                    <Badge variant="secondary" class="text-xs">
                      {tag}
                    </Badge>
                  {/each}
                </div>
                <div class="flex gap-2">
                  <Button size="sm" variant="outline" class="flex-1 bg-transparent">
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" class="flex-1 bg-transparent">
                    <ExternalLink class="mr-2 size-4" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          {/each}
        </div>
      </div>
    {:else}
      <div class="space-y-4">
        {#each reviews as review (review.id)}
          <Card>
            <CardContent class="p-6">
              <div class="flex gap-4">
                <Avatar class="size-10 shrink-0">
                  <AvatarImage src={review.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{review.author[0]}</AvatarFallback>
                </Avatar>
                <div class="flex-1 space-y-2">
                  <div class="flex items-start justify-between">
                    <div>
                      <p class="font-medium">{review.author}</p>
                      <p class="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                    <div class="flex items-center gap-1">
                      {#each Array(review.rating).fill(0) as _}
                        <Star class="size-4 fill-yellow-400 text-yellow-400" />
                      {/each}
                    </div>
                  </div>
                  <Badge variant="secondary" class="text-xs">
                    {review.service}
                  </Badge>
                  <p class="text-sm leading-relaxed">{review.comment}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Service Creation Flyout -->
<CreationFlyout bind:open={isServiceFlyoutOpen} title="Create New Service">
  <ServiceCreationForm />
</CreationFlyout>