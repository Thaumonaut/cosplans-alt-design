import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, UserPlus, Trash2, Crown, Shield, Mail, MoreVertical, Settings, Users } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function TeamSettingsPage() {
  const teams = [
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
  ]

  const currentTeamMembers = [
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
  ]

  const pendingInvites = [
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
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="max-w-full flex-1 overflow-x-hidden">
          <PageHeader title="Team Settings" searchPlaceholder="Search teams..." notificationCount={2}>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost">
                  <Plus className="size-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Team</DialogTitle>
                  <DialogDescription>Set up a new team for collaboration</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Team Name</Label>
                    <Input placeholder="Enter team name..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Team Type</Label>
                    <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                      <option>Personal</option>
                      <option>Public</option>
                      <option>Temporary</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea placeholder="What's this team for?" />
                  </div>
                  <Button className="w-full">Create Team</Button>
                </div>
              </DialogContent>
            </Dialog>
          </PageHeader>

          <div className="space-y-6 p-6">
            {/* Teams Overview */}
            <div>
              <h2 className="mb-4 text-xl font-semibold">Your Teams</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {teams.map((team) => (
                  <Card key={team.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{team.name}</CardTitle>
                          <CardDescription className="mt-1">{team.description}</CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Settings className="mr-2 size-4" />
                              Team Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <UserPlus className="mr-2 size-4" />
                              Invite Members
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 size-4" />
                              Delete Team
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{team.type}</Badge>
                          <Badge variant="outline">{team.role}</Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="size-4" />
                          {team.members}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Current Team Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Cosplay Warriors</CardTitle>
                    <CardDescription>Manage members and team settings</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="mr-2 size-4" />
                        Invite Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription>Send an invitation to join your team</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Email Address</Label>
                          <Input type="email" placeholder="member@example.com" />
                        </div>
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                            <option>Member</option>
                            <option>Admin</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>Personal Message (Optional)</Label>
                          <Textarea placeholder="Add a personal note..." />
                        </div>
                        <Button className="w-full">Send Invitation</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Team Members */}
                <div>
                  <h3 className="mb-3 font-semibold">Team Members ({currentTeamMembers.length})</h3>
                  <div className="space-y-2">
                    {currentTeamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{member.name}</span>
                              {member.role === "Owner" && <Crown className="size-4 text-amber-500" />}
                              {member.role === "Admin" && <Shield className="size-4 text-blue-500" />}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{member.email}</span>
                              <span>•</span>
                              <span>Joined {member.joinedDate}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{member.role}</Badge>
                          {member.role !== "Owner" && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost">
                                  <MoreVertical className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Change Role</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">Remove from Team</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pending Invites */}
                {pendingInvites.length > 0 && (
                  <div>
                    <h3 className="mb-3 font-semibold">Pending Invitations ({pendingInvites.length})</h3>
                    <div className="space-y-2">
                      {pendingInvites.map((invite) => (
                        <div
                          key={invite.id}
                          className="flex items-center justify-between rounded-lg border border-dashed p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                              <Mail className="size-4 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="font-medium">{invite.email}</div>
                              <div className="text-sm text-muted-foreground">
                                Invited by {invite.invitedBy} • {invite.sentDate}
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost">
                            Resend
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Team Settings */}
                <div className="space-y-4 border-t pt-6">
                  <h3 className="font-semibold">Team Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Allow member invites</div>
                        <div className="text-sm text-muted-foreground">Let team members invite others</div>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Public team</div>
                        <div className="text-sm text-muted-foreground">Make team visible in marketplace</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Project notifications</div>
                        <div className="text-sm text-muted-foreground">Notify team of project updates</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="space-y-4 border-t border-destructive/20 pt-6">
                  <h3 className="font-semibold text-destructive">Danger Zone</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start text-destructive bg-transparent">
                      <Trash2 className="mr-2 size-4" />
                      Delete Team
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      This action cannot be undone. All team data will be permanently deleted.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
