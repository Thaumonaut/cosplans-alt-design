<script lang="ts">
  import { Button } from '$lib/components/ui';
  import { ArrowRight, Users, Calendar, Zap } from 'lucide-svelte';
  import Logo from '$lib/components/Logo.svelte';
</script>

<svelte:head>
  <title>Cosplans - Cosplay Project Tracker</title>
  <meta name="description" content="Track your cosplay projects from inspiration to completion" />
</svelte:head>

<!-- Landing Page -->
<div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
  <!-- Navigation -->
  <nav class="flex items-center justify-between p-6">
    <a href="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
      <Logo size="md" />
      <span class="text-xl font-bold">Cosplans</span>
    </a>
    <div class="flex items-center gap-4">
      <Button variant="ghost" href="/dashboard">Sign In</Button>
      <Button href="/dashboard">Get Started</Button>
    </div>
  </nav>

  <!-- Hero Section -->
  <div class="container mx-auto px-6 py-20">
    <div class="text-center">
      <h1 class="mb-6 text-balance text-5xl font-bold leading-tight tracking-tight lg:text-6xl">
        Track Your Cosplay Journey
        <span class="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          From Idea to Convention
        </span>
      </h1>
      <p class="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
        Organize your cosplay projects, manage budgets, track progress, and collaborate with your team. 
        Everything you need to bring your favorite characters to life.
      </p>
      <div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Button size="lg" href="/dashboard" class="text-lg">
          Start Your First Project
          <ArrowRight class="ml-2 size-5" />
        </Button>
        <Button size="lg" variant="outline" class="text-lg">
          View Demo
        </Button>
      </div>
    </div>
  </div>

  <!-- Features Section -->
  <div class="container mx-auto px-6 py-20">
    <div class="text-center mb-16">
      <h2 class="mb-4 text-3xl font-bold">Everything You Need for Cosplay Success</h2>
      <p class="text-xl text-muted-foreground">
        Powerful tools designed specifically for cosplayers and costume creators
      </p>
    </div>

    <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <div class="rounded-xl border bg-card p-6 text-center">
        <div class="mb-4 flex justify-center">
          <div class="flex size-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
            <Calendar class="size-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <h3 class="mb-2 text-xl font-semibold">Project Planning</h3>
        <p class="text-muted-foreground">
          Plan your builds with timelines, deadlines, and milestone tracking. Never miss a convention again.
        </p>
      </div>

      <div class="rounded-xl border bg-card p-6 text-center">
        <div class="mb-4 flex justify-center">
          <div class="flex size-12 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-900">
            <Users class="size-6 text-pink-600 dark:text-pink-400" />
          </div>
        </div>
        <h3 class="mb-2 text-xl font-semibold">Team Collaboration</h3>
        <p class="text-muted-foreground">
          Work together on group cosplays. Share progress, assign tasks, and coordinate builds seamlessly.
        </p>
      </div>

      <div class="rounded-xl border bg-card p-6 text-center">
        <div class="mb-4 flex justify-center">
          <div class="flex size-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
            <Zap class="size-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h3 class="mb-2 text-xl font-semibold">Budget Management</h3>
        <p class="text-muted-foreground">
          Track expenses, manage materials inventory, and stay within budget with detailed cost analysis.
        </p>
      </div>
    </div>
  </div>

  <!-- CTA Section -->
  <div class="container mx-auto px-6 py-20">
    <div class="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-center text-white lg:p-16">
      <h2 class="mb-4 text-3xl font-bold lg:text-4xl">Ready to Level Up Your Cosplay Game?</h2>
      <p class="mb-8 text-xl opacity-90">
        Join thousands of cosplayers who trust Cosplans to manage their projects
      </p>
      <Button size="lg" variant="secondary" href="/dashboard" class="text-lg">
        Get Started for Free
        <ArrowRight class="ml-2 size-5" />
      </Button>
    </div>
  </div>

  <!-- Footer -->
  <footer class="border-t bg-background/50 py-8">
    <div class="container mx-auto px-6">
      <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div class="flex items-center gap-2">
          <Logo size="sm" />
          <span class="font-semibold">Cosplans</span>
        </div>
        <p class="text-sm text-muted-foreground">
          © 2025 Cosplans. Built for cosplayers, by cosplayers.
        </p>
      </div>
    </div>
  </footer>
</div>