<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    Plus, 
    UserPlus, 
    Trash2, 
    Crown, 
    Shield, 
    Mail, 
    MoreVertical, 
    Settings, 
    Users,
    Loader2
  } from 'lucide-svelte';
  import { 
    Button, 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle,
    Avatar,
    AvatarFallback,
    AvatarImage,
    Badge,
    Input,
    Label,
    Textarea,
    Switch,
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuSeparator,
    Dialog,
    Select
  } from '$lib/components/ui';
  import { teamService, type Team, type TeamMember } from '$lib/api/services/teamService';
  import { teams, currentTeam } from '$lib/stores/teams';
  import { user, authActions } from '$lib/stores/auth-store';
  import { toast } from '$lib/stores/toast';
  import { get } from 'svelte/store';

  let loading = $state(false);
  let loadingMembers = $state(false);
  let isLoadingInProgress = $state(false);
  let showCreateTeamDialog = $state(false);
  let showInviteMemberDialog = $state(false);
  
  let allTeams = $state<Team[]>([]);
  let currentTeamData = $state<Team | null>(null);
  let teamMembers = $state<TeamMember[]>([]);
  let pendingInvites = $state<any[]>([]); // For future implementation

  // Create team form
  let newTeamName = $state('');
  let newTeamType = $state<'personal' | 'private'>('private');
  let newTeamDescription = $state('');

  // Invite member form
  let inviteEmail = $state('');
  let inviteRole = $state<'editor' | 'viewer'>('editor');

  // Load teams and members
  async function loadData() {
    // Prevent multiple simultaneous loads
    if (isLoadingInProgress) {
      console.log('[TeamSettings] Load already in progress, skipping');
      return;
    }
    
    try {
      isLoadingInProgress = true;
      loading = true;
      
      const currentUser = get(user);
      if (!currentUser) {
        console.warn('[TeamSettings] No user available, cannot load teams');
        toast.error('Not Authenticated', 'Please sign in to view teams');
        loading = false;
        return;
      }

      // Load all teams
      console.log('[TeamSettings] Loading teams for user:', currentUser.id);
      try {
        allTeams = await teamService.list(currentUser.id);
        console.log('[TeamSettings] Loaded teams:', allTeams.length);
      } catch (listError: any) {
        console.error('[TeamSettings] teamService.list() failed:', listError);
        throw listError; // Re-throw to be caught by outer catch
      }
      
      // Set current team (use selected team or first team)
      const selectedTeam = get(currentTeam);
      currentTeamData = selectedTeam || allTeams[0] || null;
      console.log('[TeamSettings] Current team:', currentTeamData?.name || 'none');

      // Load members for current team
      if (currentTeamData) {
        await loadTeamMembers(currentTeamData.id);
      } else {
        console.warn('[TeamSettings] No team available to load members');
      }
    } catch (error: any) {
      console.error('[TeamSettings] Failed to load teams:', error);
      console.error('[TeamSettings] Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        stack: error?.stack
      });
      toast.error('Failed to Load Teams', error?.message || 'Could not load your teams');
    } finally {
      loading = false;
      isLoadingInProgress = false;
    }
  }

  async function loadTeamMembers(teamId: string) {
    try {
      loadingMembers = true;
      console.log('[TeamSettings] Loading members for team:', teamId);
      teamMembers = await teamService.getMembers(teamId);
      console.log('[TeamSettings] Loaded members:', teamMembers.length);
    } catch (error: any) {
      console.error('[TeamSettings] Failed to load team members:', error);
      console.error('[TeamSettings] Member load error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        stack: error?.stack
      });
      toast.error('Failed to Load Members', error?.message || 'Could not load team members');
    } finally {
      loadingMembers = false;
    }
  }

  async function handleCreateTeam() {
    if (!newTeamName.trim()) {
      toast.error('Team Name Required', 'Please enter a team name');
      return;
    }

    try {
      const created = await teamService.create({
        name: newTeamName.trim(),
        type: newTeamType,
      });

      toast.success('Team Created', `${created.name} has been created successfully`);
      
      // Reset form
      newTeamName = '';
      newTeamType = 'private';
      newTeamDescription = '';
      showCreateTeamDialog = false;

      // Reload teams
      await loadData();
    } catch (error: any) {
      console.error('Failed to create team:', error);
      toast.error('Failed to Create Team', error?.message || 'Could not create team');
    }
  }

  async function handleInviteMember() {
    if (!inviteEmail.trim()) {
      toast.error('Email Required', 'Please enter an email address');
      return;
    }

    if (!currentTeamData) {
      toast.error('No Team Selected', 'Please select a team first');
      return;
    }

    try {
      await teamService.invite(currentTeamData.id, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      toast.success('Member Invited', `Invitation sent to ${inviteEmail}`);
      
      // Reset form
      inviteEmail = '';
      inviteRole = 'editor';
      showInviteMemberDialog = false;

      // Reload members
      await loadTeamMembers(currentTeamData.id);
    } catch (error: any) {
      console.error('Failed to invite member:', error);
      toast.error('Failed to Invite Member', error?.message || 'Could not send invitation');
    }
  }

  async function handleRemoveMember(member: TeamMember) {
    if (!currentTeamData) return;
    
    if (!confirm(`Are you sure you want to remove ${member.user?.name || member.user?.email || 'this member'} from the team?`)) {
      return;
    }

    try {
      await teamService.removeMember(currentTeamData.id, member.userId);
      toast.success('Member Removed', 'Member has been removed from the team');
      await loadTeamMembers(currentTeamData.id);
    } catch (error: any) {
      console.error('Failed to remove member:', error);
      toast.error('Failed to Remove Member', error?.message || 'Could not remove member');
    }
  }

  async function handleChangeRole(member: TeamMember, newRole: 'owner' | 'editor' | 'viewer') {
    if (!currentTeamData) return;

    try {
      await teamService.updateMemberRole(currentTeamData.id, member.userId, newRole);
      toast.success('Role Updated', 'Member role has been updated');
      await loadTeamMembers(currentTeamData.id);
    } catch (error: any) {
      console.error('Failed to update role:', error);
      toast.error('Failed to Update Role', error?.message || 'Could not update member role');
    }
  }

  async function handleSwitchTeam(team: Team) {
    currentTeamData = team;
    await loadTeamMembers(team.id);
    // Update current team in store
    await teams.setCurrent(team.id);
  }

  function formatDate(dateString?: string) {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return 'Unknown';
    }
  }

  function getInitials(name?: string, email?: string) {
    if (name) {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  }

  function getRoleDisplayName(role: string) {
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  function getTeamMemberCount(teamId: string) {
    // For now, return count from current team members if it matches
    if (currentTeamData?.id === teamId) {
      return teamMembers.length;
    }
    return 0; // Would need to load separately for other teams
  }

  // Track if we've already attempted to load data
  let hasLoaded = $state(false);

  onMount(async () => {
    // Wait for user to be available before loading
    let attempts = 0;
    const maxAttempts = 20; // 2 seconds total
    
    while (attempts < maxAttempts) {
      const currentUser = get(user);
      if (currentUser) {
        if (!hasLoaded) {
          hasLoaded = true;
          await loadData();
        }
        return;
      }
      
      // Wait 100ms before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    // If user still not available, try to get from Supabase directly
    if (!hasLoaded) {
      try {
        const { supabase } = await import('$lib/supabase');
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          authActions.setUser(authUser);
          hasLoaded = true;
          await loadData();
          return;
        }
      } catch (err) {
        console.error('[TeamSettings] Failed to get user:', err);
      }
      
      // Still no user - show error
      if (!hasLoaded) {
        toast.error('Not Authenticated', 'Please sign in to view teams');
        loading = false;
      }
    }
  });
</script>

<svelte:head>
  <title>Team Settings - Cosplay Tracker</title>
</svelte:head>

<div class="space-y-6 p-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold">Team Settings</h1>
      <p class="text-muted-foreground">Manage your teams and collaboration settings</p>
    </div>
    <Button onclick={() => showCreateTeamDialog = true}>
      <Plus class="mr-2 size-4" />
      Create Team
    </Button>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-20">
      <Loader2 class="mr-2 size-5 animate-spin text-muted-foreground" />
      <span class="text-sm text-muted-foreground">Loading teams...</span>
    </div>
  {:else}
  <!-- Teams Overview -->
  <div>
    <h2 class="mb-4 text-xl font-semibold">Your Teams</h2>
      {#if allTeams.length === 0}
        <Card>
          <CardContent class="py-12 text-center">
            <Users class="mx-auto mb-4 size-12 text-muted-foreground" />
            <p class="mb-2 text-lg font-semibold">No teams yet</p>
            <p class="mb-4 text-sm text-muted-foreground">Create your first team to start collaborating</p>
            <Button onclick={() => showCreateTeamDialog = true}>
              <Plus class="mr-2 size-4" />
              Create Team
            </Button>
          </CardContent>
        </Card>
      {:else}
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {#each allTeams as team (team.id)}
            <button 
              type="button"
              class="w-full text-left h-full"
              onclick={() => handleSwitchTeam(team)}
              aria-label="Select team {team.name}"
            >
            <Card 
              class="transition-all hover:shadow-md h-full flex flex-col {currentTeamData?.id === team.id ? 'ring-2 ring-primary' : ''}"
            >
          <CardHeader class="flex-shrink-0">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <CardTitle class="text-lg">{team.name}</CardTitle>
                    <CardDescription class="mt-1">
                      {team.type === 'personal' ? 'Personal workspace' : 'Team collaboration'}
                    </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="flex-shrink-0 mt-auto">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                    <Badge variant="secondary" class="h-[22px]">{team.type === 'personal' ? 'Personal' : 'Team'}</Badge>
              </div>
              <div class="flex items-center gap-1 text-sm text-muted-foreground">
                <Users class="size-4" />
                    {getTeamMemberCount(team.id)}
              </div>
            </div>
          </CardContent>
        </Card>
            </button>
      {/each}
    </div>
      {/if}
  </div>

  <!-- Current Team Details -->
    {#if currentTeamData}
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <div>
              <CardTitle>{currentTeamData.name}</CardTitle>
          <CardDescription>Manage members and team settings</CardDescription>
        </div>
        <Button onclick={() => showInviteMemberDialog = true}>
          <UserPlus class="mr-2 size-4" />
          Invite Member
        </Button>
      </div>
    </CardHeader>
    <CardContent class="space-y-6">
      <!-- Team Members -->
      <div>
            <h3 class="mb-3 font-semibold">
              Team Members 
              {#if loadingMembers}
                <Loader2 class="ml-2 inline size-4 animate-spin" />
              {:else}
                ({teamMembers.length})
              {/if}
            </h3>
            {#if loadingMembers}
              <div class="flex items-center justify-center py-8">
                <Loader2 class="mr-2 size-5 animate-spin text-muted-foreground" />
                <span class="text-sm text-muted-foreground">Loading members...</span>
              </div>
            {:else if teamMembers.length === 0}
              <div class="rounded-lg border border-dashed p-8 text-center">
                <Users class="mx-auto mb-2 size-8 text-muted-foreground" />
                <p class="text-sm text-muted-foreground">No members yet. Invite someone to get started!</p>
              </div>
            {:else}
        <div class="space-y-2">
                {#each teamMembers as member (member.id)}
            <div class="flex items-center justify-between rounded-lg border p-3">
              <div class="flex items-center gap-3">
                <Avatar>
                        <AvatarImage 
                          src={member.user?.avatarUrl || '/placeholder-user.jpg'} 
                          alt={member.user?.name || member.user?.email || 'Team member'}
                        />
                        <AvatarFallback>
                          {getInitials(member.user?.name, member.user?.email)}
                        </AvatarFallback>
                </Avatar>
                <div>
                  <div class="flex items-center gap-2">
                          <span class="font-medium">{member.user?.name || member.user?.email || 'Unknown'}</span>
                          {#if member.role === 'owner'}
                      <Crown class="size-4 text-amber-500" />
                          {:else if member.role === 'editor'}
                      <Shield class="size-4 text-blue-500" />
                    {/if}
                  </div>
                  <div class="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{member.user?.email}</span>
                          {#if member.joinedAt}
                    <span>•</span>
                            <span>Joined {formatDate(member.joinedAt)}</span>
                          {/if}
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                      <Badge variant="outline">{getRoleDisplayName(member.role)}</Badge>
                      {#if member.role !== 'owner'}
                  <DropdownMenu>
                          {#snippet trigger()}
                            <Button variant="ghost" size="icon">
                      <MoreVertical class="size-4" />
                    </Button>
                          {/snippet}
                          {#snippet children()}
                            <DropdownMenuItem onclick={() => handleChangeRole(member, 'editor')}>
                              Change to Editor
                            </DropdownMenuItem>
                            <DropdownMenuItem onclick={() => handleChangeRole(member, 'viewer')}>
                              Change to Viewer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              variant="destructive"
                              onclick={() => handleRemoveMember(member)}
                            >
                              Remove from Team
                            </DropdownMenuItem>
                          {/snippet}
                  </DropdownMenu>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
          </div>
        </CardContent>
      </Card>
    {:else}
      <Card>
        <CardContent class="py-12 text-center">
          <p class="text-muted-foreground">Select a team to view details</p>
    </CardContent>
  </Card>
    {/if}
  {/if}
</div>

<!-- Create Team Dialog -->
<Dialog 
  bind:open={showCreateTeamDialog}
  title="Create New Team"
  description="Set up a new team for collaboration"
>
      <div class="space-y-4">
        <div class="space-y-2">
          <Label>Team Name</Label>
      <Input 
        bind:value={newTeamName}
        placeholder="Enter team name..." 
      />
        </div>
        <div class="space-y-2">
          <Label>Team Type</Label>
      <Select 
        bind:value={newTeamType}
        options={[
          { value: 'private', label: 'Private Team' },
          { value: 'personal', label: 'Personal' }
        ]}
      />
        </div>
        <div class="space-y-2">
      <Label>Description (Optional)</Label>
      <Textarea 
        bind:value={newTeamDescription}
        placeholder="What's this team for?" 
      />
        </div>
    <div class="flex gap-2">
      <Button 
        class="flex-1" 
        onclick={handleCreateTeam}
        disabled={!newTeamName.trim()}
      >
        Create Team
      </Button>
      <Button 
        variant="outline" 
        class="flex-1"
        onclick={() => {
          showCreateTeamDialog = false;
          newTeamName = '';
          newTeamType = 'private';
          newTeamDescription = '';
        }}
      >
        Cancel
      </Button>
      </div>
    </div>
  </Dialog>

<!-- Invite Member Dialog -->
<Dialog 
  bind:open={showInviteMemberDialog}
  title="Invite Team Member"
  description="Send an invitation to join your team"
>
      <div class="space-y-4">
        <div class="space-y-2">
          <Label>Email Address</Label>
      <Input 
        type="email" 
        bind:value={inviteEmail}
        placeholder="member@example.com" 
      />
        </div>
        <div class="space-y-2">
          <Label>Role</Label>
      <Select 
        bind:value={inviteRole}
        options={[
          { value: 'editor', label: 'Editor' },
          { value: 'viewer', label: 'Viewer' }
        ]}
      />
        </div>
    <div class="flex gap-2">
      <Button 
        class="flex-1" 
        onclick={handleInviteMember}
        disabled={!inviteEmail.trim()}
      >
        Send Invitation
      </Button>
      <Button 
        variant="outline" 
        class="flex-1"
        onclick={() => {
          showInviteMemberDialog = false;
          inviteEmail = '';
          inviteRole = 'editor';
        }}
      >
        Cancel
      </Button>
      </div>
    </div>
  </Dialog>
