<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { Check, ChevronDown, Users, Lock } from 'lucide-svelte'
  import { DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '$lib/components/ui'
  import { cn } from '$lib/utils'
  import { teams, currentTeam } from '$lib/stores/teams'
  import { user } from '$lib/stores/auth-store'
  import { get } from 'svelte/store'
  import type { Team } from '$lib/api/services/teamService'

  const typeIcons = {
    personal: Lock,
    private: Users,
  }

  const typeLabels = {
    personal: 'PERSONAL',
    private: 'PUBLIC',
  }

  onMount(async () => {
    const currentUser = get(user)
    if (currentUser) {
      await teams.load(currentUser.id)
    }
  })

  async function handleTeamSwitch(team: Team) {
    await teams.setCurrent(team.id)
    // Reload all stores to filter by new team
    // This would typically trigger reloads in other stores
    window.location.reload() // Simple approach for MVP
  }

  function getIcon(teamType: string) {
    return typeIcons[teamType as keyof typeof typeIcons] || Users
  }

  // Group teams by type
  const groupedTeams = $derived(
    $teams.items.reduce(
      (acc, team) => {
        if (!acc[team.type]) acc[team.type] = []
        acc[team.type].push(team)
        return acc
      },
      {} as Record<string, Team[]>
    )
  )
</script>

<DropdownMenu placement="bottom-start">
  {#snippet trigger()}
    {#if $currentTeam}
      {@const IconComponent = getIcon($currentTeam.type)}
      {@const Icon = IconComponent}
      <button
        class="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-sidebar-accent"
        disabled={$teams.loading}
      >
        <div class="flex flex-1 items-center gap-2 overflow-hidden">
          <Icon class="size-4 shrink-0 text-muted-foreground" />
          <span class="truncate text-sm font-medium">
            {$currentTeam.name}
          </span>
        </div>
        <ChevronDown class="size-4 shrink-0 text-muted-foreground" />
      </button>
    {:else}
      <button
        class="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-sidebar-accent"
        disabled={true}
      >
        <div class="flex flex-1 items-center gap-2 overflow-hidden">
          <Users class="size-4 shrink-0 text-muted-foreground" />
          <span class="truncate text-sm font-medium">Loading...</span>
        </div>
        <ChevronDown class="size-4 shrink-0 text-muted-foreground" />
      </button>
    {/if}
  {/snippet}

  {#snippet children()}
    {#if $teams.items.length === 0}
      <DropdownMenuItem disabled>No teams available</DropdownMenuItem>
    {:else}
      {@const groupEntries = Object.entries(groupedTeams)}
      {#each groupEntries as [type, teamList], i}
        {@const TypeIcon = typeIcons[type as keyof typeof typeIcons] || Users}
        {@const Icon = TypeIcon}
        <div class="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {typeLabels[type as keyof typeof typeLabels] || type}
        </div>
        
        {#each teamList as team}
          {@const TeamIcon = getIcon(team.type)}
          <DropdownMenuItem
            onclick={() => handleTeamSwitch(team)}
            class={cn(
              "flex items-center justify-between",
              $currentTeam?.id === team.id && "bg-[color-mix(in_srgb,var(--theme-primary)_12%,transparent)]"
            )}
          >
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <TeamIcon class="size-4 shrink-0 text-muted-foreground" />
              <span class="font-medium truncate">{team.name}</span>
            </div>
            {#if $currentTeam?.id === team.id}
              <Check class="size-4 shrink-0 text-[var(--theme-primary)]" />
            {/if}
          </DropdownMenuItem>
        {/each}
        
        {#if i < groupEntries.length - 1}
          <div class="border-t border-[var(--theme-border)] my-1"></div>
        {/if}
      {/each}
    {/if}
  {/snippet}
</DropdownMenu>