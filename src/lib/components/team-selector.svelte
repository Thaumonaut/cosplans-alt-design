<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { Check, ChevronDown, Users, Lock } from 'lucide-svelte'
  import { DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '$lib/components/ui'
  import { teams, currentTeam } from '$lib/stores/teams'
  import { user } from '$lib/stores/auth-store'
  import { get } from 'svelte/store'
  import type { Team } from '$lib/api/services/teamService'

  const typeIcons = {
    personal: Lock,
    private: Users,
  }

  const typeLabels = {
    personal: 'Personal',
    private: 'Private',
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
      <button
        class="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-sidebar-accent"
        disabled={$teams.loading}
      >
        <div class="flex flex-1 items-center gap-2 overflow-hidden">
          <svelte:component this={IconComponent} class="size-4 shrink-0 text-muted-foreground" />
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
    <DropdownMenuLabel>Switch Team</DropdownMenuLabel>
    <DropdownMenuSeparator />
    
    {#if $teams.items.length === 0}
      <DropdownMenuItem disabled>No teams available</DropdownMenuItem>
    {:else}
      {#each Object.entries(groupedTeams) as [type, teamList]}
        {@const TypeIcon = typeIcons[type as keyof typeof typeIcons] || Users}
        <DropdownMenuLabel class="flex items-center gap-2 text-xs text-muted-foreground">
          <svelte:component this={TypeIcon} class="size-3" />
          {typeLabels[type as keyof typeof typeLabels] || type}
        </DropdownMenuLabel>
        
        {#each teamList as team}
          <DropdownMenuItem
            onclick={() => handleTeamSwitch(team)}
            class="flex items-center justify-between"
          >
            <span class="truncate">{team.name}</span>
            {#if $currentTeam?.id === team.id}
              <Check class="size-4 shrink-0" />
            {/if}
          </DropdownMenuItem>
        {/each}
      {/each}
    {/if}
    
    <DropdownMenuSeparator />
    <DropdownMenuItem onclick={() => goto('/teams')}>
      <Users class="mr-2 size-4" />
      Manage Teams
    </DropdownMenuItem>
  {/snippet}
</DropdownMenu>