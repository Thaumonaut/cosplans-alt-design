<script lang="ts">
  import { Check, ChevronDown, Users, Lock, Globe } from 'lucide-svelte';
  import { DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '$lib/components/ui';
  import { cn } from '$lib/utils';

  type TeamType = 'personal' | 'public' | 'temp';

  interface Team {
    id: string;
    name: string;
    type: TeamType;
  }

  const teams: Team[] = [
    { id: '1', name: 'My Personal Projects', type: 'personal' },
    { id: '2', name: 'Cosplay Community', type: 'public' },
    { id: '3', name: 'Convention Group 2024', type: 'temp' },
    { id: '4', name: 'Photo Collab Team', type: 'temp' },
  ];

  const typeIcons = {
    personal: Lock,
    public: Globe,
    temp: Users,
  };

  const typeLabels = {
    personal: 'Personal',
    public: 'Public',
    temp: 'Temporary',
  };

  let selectedTeam = $state<Team>(teams[0]);


  const Icon = $derived(typeIcons[selectedTeam.type]);

  // Group teams by type
  const groupedTeams = $derived(teams.reduce((acc, team) => {
    if (!acc[team.type]) acc[team.type] = [];
    acc[team.type].push(team);
    return acc;
  }, {} as Record<TeamType, Team[]>));
</script>

<DropdownMenu placement="bottom-start">
  {#snippet trigger()}
    <button
      class="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-sidebar-accent"
    >
      <div class="flex flex-1 items-center gap-2 overflow-hidden">
        <Icon class="size-4 shrink-0 text-muted-foreground" />
        <span class="truncate text-sm font-medium">{selectedTeam.name}</span>
      </div>
      <ChevronDown class="size-4 shrink-0 text-muted-foreground" />
    </button>
  {/snippet}

  {#snippet children()}
    <DropdownMenuLabel>Switch Team</DropdownMenuLabel>
    <DropdownMenuSeparator />
    
    {#each Object.entries(groupedTeams) as [type, teamList]}
      {@const TypeIcon = typeIcons[type as TeamType]}
      <DropdownMenuLabel class="flex items-center gap-2 text-xs text-muted-foreground">
        <TypeIcon class="size-3" />
        {typeLabels[type as TeamType]}
      </DropdownMenuLabel>
      
      {#each teamList as team}
        <DropdownMenuItem
          onclick={() => {
            selectedTeam = team;
          }}
          class="flex items-center justify-between"
        >
          <span class="truncate">{team.name}</span>
          {#if selectedTeam.id === team.id}
            <Check class="size-4 shrink-0" />
          {/if}
        </DropdownMenuItem>
      {/each}
    {/each}
    
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <Users class="mr-2 size-4" />
      Create New Team
    </DropdownMenuItem>
  {/snippet}
</DropdownMenu>