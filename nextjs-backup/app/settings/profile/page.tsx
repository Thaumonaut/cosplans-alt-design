import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Camera, Save, Globe, Instagram, Twitter, Facebook } from "lucide-react"

export default function ProfileSettingsPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="max-w-full flex-1 overflow-x-hidden">
          <PageHeader title="Profile Settings" searchPlaceholder="Search settings..." notificationCount={0}>
            <Button>
              <Save className="mr-2 size-4" />
              Save Changes
            </Button>
          </PageHeader>

          <div className="space-y-6 p-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and profile picture</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-center gap-6">
                  <Avatar className="size-24">
                    <AvatarImage src="/placeholder.svg?height=96&width=96" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline">
                      <Camera className="mr-2 size-4" />
                      Change Photo
                    </Button>
                    <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max size 5MB.</p>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input defaultValue="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input defaultValue="johndoe" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" defaultValue="johndoe@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input defaultValue="Los Angeles, CA" />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea
                    defaultValue="Passionate cosplayer specializing in armor builds and prop making. Always looking for new challenges!"
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground">Brief description for your profile</p>
                </div>

                {/* Skills/Specialties */}
                <div className="space-y-2">
                  <Label>Skills & Specialties</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge>Armor Crafting</Badge>
                    <Badge>Prop Making</Badge>
                    <Badge>Wig Styling</Badge>
                    <Badge>Photography</Badge>
                    <Button size="sm" variant="outline">
                      + Add Skill
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>Connect your social media accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="size-4" />
                    Website
                  </Label>
                  <Input placeholder="https://yourwebsite.com" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Instagram className="size-4" />
                    Instagram
                  </Label>
                  <Input placeholder="@username" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Twitter className="size-4" />
                    Twitter/X
                  </Label>
                  <Input placeholder="@username" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Facebook className="size-4" />
                    Facebook
                  </Label>
                  <Input placeholder="facebook.com/username" />
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Visibility</CardTitle>
                <CardDescription>Control who can see your profile and activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Public Profile</div>
                    <div className="text-sm text-muted-foreground">Make your profile visible to everyone</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Show in Marketplace</div>
                    <div className="text-sm text-muted-foreground">Display your services in marketplace</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Show Project Activity</div>
                    <div className="text-sm text-muted-foreground">Let others see your project updates</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Allow Messages</div>
                    <div className="text-sm text-muted-foreground">Receive messages from other users</div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-muted-foreground">Receive updates via email</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Project Updates</div>
                    <div className="text-sm text-muted-foreground">Notifications for project milestones</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Team Activity</div>
                    <div className="text-sm text-muted-foreground">Updates from your team members</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Commission Requests</div>
                    <div className="text-sm text-muted-foreground">Alerts for new commission inquiries</div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Account Security */}
            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>Manage your password and security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" />
                </div>
                <Button>Update Password</Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
