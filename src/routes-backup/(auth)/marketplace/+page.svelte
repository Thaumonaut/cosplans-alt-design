<script lang="ts">
  import { Star, MapPin, Clock, DollarSign, Scissors, Camera, Palette, Shirt, Package, Sparkles, Users } from 'lucide-svelte';
  import { Button, Card, CardContent, CardFooter, CardHeader, Badge, Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui';
  import CreationFlyout from '$lib/components/creation-flyout.svelte';
  import ServiceCreationForm from '$lib/components/service-creation-form.svelte';

  const serviceCategories = [
    { id: "all", label: "All Services", icon: Sparkles },
    { id: "wig-styling", label: "Wig Styling", icon: Scissors },
    { id: "photography", label: "Photography", icon: Camera },
    { id: "makeup", label: "Makeup", icon: Palette },
    { id: "costume-making", label: "Costume Making", icon: Shirt },
    { id: "prop-making", label: "Prop Making", icon: Package },
    { id: "group-cosplay", label: "Group Cosplay", icon: Users },
  ];

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
  ];

  let selectedCategory = $state("all");
  let viewMode = $state<"grid" | "list">("grid");
  let isServiceFlyoutOpen = $state(false);

  const filteredServices = $derived(
    selectedCategory === "all" ? services : services.filter((service) => service.category === selectedCategory)
  );
</script>

<svelte:head>
  <title>Marketplace - Cosplay Tracker</title>
</svelte:head>

<!-- Page Header Actions -->
<div class="flex items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div class="flex items-center gap-4">
    <h1 class="font-semibold">Marketplace</h1>
  </div>
  
  <div class="flex items-center gap-2">
    <Button size="sm" onclick={() => isServiceFlyoutOpen = true}>
      <Sparkles class="mr-2 size-4" />
      Offer Service
    </Button>
  </div>
</div>

<div class="space-y-6 p-6">
  <div class="flex gap-2 overflow-x-auto pb-2">
    {#each serviceCategories as category}
      <Button
        variant={selectedCategory === category.id ? "default" : "outline"}
        size="sm"
        onclick={() => selectedCategory = category.id}
        class="shrink-0"
      >
        <category.icon class="mr-2 size-4" />
        {category.label}
      </Button>
    {/each}
  </div>

  <div class="flex items-center justify-between">
    <p class="text-sm text-muted-foreground">
      {filteredServices.length} service{filteredServices.length !== 1 ? "s" : ""} available
    </p>
    <div class="flex gap-2">
      <Button 
        variant={viewMode === "grid" ? "default" : "outline"} 
        size="sm"
        onclick={() => viewMode = "grid"}
      >
        Grid
      </Button>
      <Button 
        variant={viewMode === "list" ? "default" : "outline"} 
        size="sm"
        onclick={() => viewMode = "list"}
      >
        List
      </Button>
    </div>
  </div>

  <div class={viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-4"}>
    {#each filteredServices as service (service.id)}
      <Card class="overflow-hidden">
        <div class="relative aspect-video overflow-hidden">
          <img
            src={service.image || "/placeholder.svg"}
            alt={service.title}
            class="size-full object-cover transition-transform hover:scale-105"
          />
          {#if service.provider.verified}
            <Badge class="absolute right-2 top-2 bg-primary">Verified</Badge>
          {/if}
        </div>
        <CardHeader class="space-y-3 pb-3">
          <div class="flex items-start justify-between gap-2">
            <h3 class="line-clamp-2 font-semibold leading-tight">{service.title}</h3>
          </div>
          <div class="flex items-center gap-2">
            <Avatar class="size-8">
              <AvatarImage src={service.provider.avatar || "/placeholder.svg"} />
              <AvatarFallback>{service.provider.name[0]}</AvatarFallback>
            </Avatar>
            <div class="flex-1 overflow-hidden">
              <p class="truncate text-sm font-medium">{service.provider.name}</p>
              <div class="flex items-center gap-1 text-xs text-muted-foreground">
                <Star class="size-3 fill-yellow-400 text-yellow-400" />
                <span class="font-medium">{service.provider.rating}</span>
                <span>({service.provider.reviewCount})</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent class="space-y-3 pb-3">
          <div class="flex flex-wrap gap-1">
            {#each service.tags as tag}
              <Badge variant="secondary" class="text-xs">
                {tag}
              </Badge>
            {/each}
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div class="flex items-center gap-1">
              <DollarSign class="size-3" />
              <span>
                ${service.price.min}-${service.price.max}
              </span>
            </div>
            <div class="flex items-center gap-1">
              <Clock class="size-3" />
              <span>{service.turnaround}</span>
            </div>
            <div class="col-span-2 flex items-center gap-1">
              <MapPin class="size-3" />
              <span>{service.location}</span>
            </div>
          </div>
          <p class="text-xs text-muted-foreground">{service.completedOrders} completed orders</p>
        </CardContent>
        <CardFooter class="pt-0">
          <Button class="w-full" size="sm">
            Request Commission
          </Button>
        </CardFooter>
      </Card>
    {/each}
  </div>
</div>

<CreationFlyout bind:open={isServiceFlyoutOpen} title="Offer a Service">
  <ServiceCreationForm />
</CreationFlyout>