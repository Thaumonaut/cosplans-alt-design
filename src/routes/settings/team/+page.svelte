<script lang="ts">
  import { 
    Plus, 
    UserPlus, 
    Trash2, 
    Crown, 
    Shield, 
    Mail, 
    MoreVertical, 
    Settings, 
    Users 
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
    Dialog
  } from '$lib/components/ui';

  interface Team {
    id: number;
    name: string;
    type: string;
    members: number;
    role: string;
    description: string;
  }

  interface TeamMember {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar: string;
    joinedDate: string;
  }

  interface PendingInvite {
    id: number;
    email: string;
    invitedBy: string;
    sentDate: string;
  }

  const teams: Team[] = [
    {
      id: 1,
      name: "Cosplay Warriors",
      type: "Public",
      members: 8,
      role: "Owner",
      description: "Main cosplay team for conventions and group projects",
    },
    {
      id: 2,
      name: "Personal Projects",
      type: "Personal",
      members: 1,
      role: "Owner",
      description: "Solo cosplay builds and experiments",
    },
    {
      id: 3,
      name: "Con 2024 Prep",
      type: "Temporary",
      members: 5,
      role: "Admin",
      description: "Temporary team for upcoming convention",
    },
  ];

  const currentTeamMembers: TeamMember[] = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "Owner",
      avatar: "/placeholder.svg?height=40&width=40",
      joinedDate: "Jan 2023",
    },
    {
      id: 2,
      name: "Sarah Chen",
      email: "sarah@example.com",
      role: "Admin",
      avatar: "/placeholder.svg?height=40&width=40",
      joinedDate: "Mar 2023",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "Member",
      avatar: "/placeholder.svg?height=40&width=40",
      joinedDate: "Jun 2023",
    },
    {
      id: 4,
      name: "Emily Rodriguez",
      email: "emily@example.com",
      role: "Member",
      avatar: "/placeholder.svg?height=40&width=40",
      joinedDate: "Aug 2023",
    },
  ];

  const pendingInvites: PendingInvite[] = [
    {
      id: 1,
      email: "alex@example.com",
      invitedBy: "John Doe",
      sentDate: "2 days ago",
    },
    {
      id: 2,
      email: "taylor@example.com",
      invitedBy: "Sarah Chen",
      sentDate: "5 days ago",
    },
  ];

  let showCreateTeamDialog = $state(false);
  let showInviteMemberDialog = $state(false);
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

  <!-- Teams Overview -->
  <div>
    <h2 class="mb-4 text-xl font-semibold">Your Teams</h2>
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {#each teams as team (team.id)}
        <Card>
          <CardHeader>
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <CardTitle class="text-lg">{team.name}</CardTitle>
                <CardDescription class="mt-1">{team.description}</CardDescription>
              </div>
              <DropdownMenu>
                <Button variant="ghost" size="icon" slot="trigger">
                  <MoreVertical class="size-4" />
                </Button>
                <div slot="content">
                  <DropdownMenuItem>
                    <Settings class="mr-2 size-4" />
                    Team Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <UserPlus class="mr-2 size-4" />
                    Invite Members
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem class="text-destructive">
                    <Trash2 class="mr-2 size-4" />
                    Delete Team
                  </DropdownMenuItem>
                </div>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Badge variant="secondary">{team.type}</Badge>
                <Badge variant="outline">{team.role}</Badge>
              </div>
              <div class="flex items-center gap-1 text-sm text-muted-foreground">
                <Users class="size-4" />
                {team.members}
              </div>
            </div>
          </CardContent>
        </Card>
      {/each}
    </div>
  </div>

  <!-- Current Team Details -->
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <div>
          <CardTitle>Cosplay Warriors</CardTitle>
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
        <h3 class="mb-3 font-semibold">Team Members ({currentTeamMembers.length})</h3>
        <div class="space-y-2">
          {#each currentTeamMembers as member (member.id)}
            <div class="flex items-center justify-between rounded-lg border p-3">
              <div class="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-medium">{member.name}</span>
                    {#if member.role === "Owner"}
                      <Crown class="size-4 text-amber-500" />
                    {:else if member.role === "Admin"}
                      <Shield class="size-4 text-blue-500" />
                    {/if}
                  </div>
                  <div class="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{member.email}</span>
                    <span>•</span>
                    <span>Joined {member.joinedDate}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <Badge variant="outline">{member.role}</Badge>
                {#if member.role !== "Owner"}
                  <DropdownMenu>
                    <Button variant="ghost" size="icon" slot="trigger">
                      <MoreVertical class="size-4" />
                    </Button>
                    <div slot="content">
                      <DropdownMenuItem>Change Role</DropdownMenuItem>
                      <DropdownMenuItem class="text-destructive">Remove from Team</DropdownMenuItem>
                    </div>
                  </DropdownMenu>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Pending Invites -->
      {#if pendingInvites.length > 0}
        <div>
          <h3 class="mb-3 font-semibold">Pending Invitations ({pendingInvites.length})</h3>
          <div class="space-y-2">
            {#each pendingInvites as invite (invite.id)}
              <div class="flex items-center justify-between rounded-lg border border-dashed p-3">
                <div class="flex items-center gap-3">
                  <div class="flex size-10 items-center justify-center rounded-full bg-muted">
                    <Mail class="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div class="font-medium">{invite.email}</div>
                    <div class="text-sm text-muted-foreground">
                      Invited by {invite.invitedBy} • {invite.sentDate}
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  Resend
                </Button>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Team Settings -->
      <div class="space-y-4 border-t pt-6">
        <h3 class="font-semibold">Team Settings</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium">Allow member invites</div>
              <div class="text-sm text-muted-foreground">Let team members invite others</div>
            </div>
            <Switch />
          </div>
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium">Public team</div>
              <div class="text-sm text-muted-foreground">Make team visible in marketplace</div>
            </div>
            <Switch checked />
          </div>
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium">Project notifications</div>
              <div class="text-sm text-muted-foreground">Notify team of project updates</div>
            </div>
            <Switch checked />
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="space-y-4 border-t border-destructive/20 pt-6">
        <h3 class="font-semibold text-destructive">Danger Zone</h3>
        <div class="space-y-2">
          <Button variant="outline" class="w-full justify-start text-destructive bg-transparent">
            <Trash2 class="mr-2 size-4" />
            Delete Team
          </Button>
          <p class="text-sm text-muted-foreground">
            This action cannot be undone. All team data will be permanently deleted.
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
</div>

<!-- Create Team Dialog -->
{#if showCreateTeamDialog}
  <Dialog bind:open={showCreateTeamDialog}>
    <div class="space-y-4 p-6">
      <div>
        <h2 class="text-lg font-semibold">Create New Team</h2>
        <p class="text-sm text-muted-foreground">Set up a new team for collaboration</p>
      </div>
      <div class="space-y-4">
        <div class="space-y-2">
          <Label>Team Name</Label>
          <Input placeholder="Enter team name..." />
        </div>
        <div class="space-y-2">
          <Label>Team Type</Label>
          <select class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option>Personal</option>
            <option>Public</option>
            <option>Temporary</option>
          </select>
        </div>
        <div class="space-y-2">
          <Label>Description</Label>
          <Textarea placeholder="What's this team for?" />
        </div>
        <Button class="w-full">Create Team</Button>
      </div>
    </div>
  </Dialog>
{/if}

<!-- Invite Member Dialog -->
{#if showInviteMemberDialog}
  <Dialog bind:open={showInviteMemberDialog}>
    <div class="space-y-4 p-6">
      <div>
        <h2 class="text-lg font-semibold">Invite Team Member</h2>
        <p class="text-sm text-muted-foreground">Send an invitation to join your team</p>
      </div>
      <div class="space-y-4">
        <div class="space-y-2">
          <Label>Email Address</Label>
          <Input type="email" placeholder="member@example.com" />
        </div>
        <div class="space-y-2">
          <Label>Role</Label>
          <select class="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option>Member</option>
            <option>Admin</option>
          </select>
        </div>
        <div class="space-y-2">
          <Label>Personal Message (Optional)</Label>
          <Textarea placeholder="Add a personal note..." />
        </div>
        <Button class="w-full">Send Invitation</Button>
      </div>
    </div>
  </Dialog>
{/if}