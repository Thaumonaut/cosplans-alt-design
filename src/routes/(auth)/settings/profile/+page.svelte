<script lang="ts">
  import { Camera, Save, Globe, Instagram, Twitter, Facebook } from 'lucide-svelte';
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
    Input,
    Label,
    Textarea,
    Switch,
    Badge
  } from '$lib/components/ui';
</script>

<svelte:head>
  <title>Profile Settings - Cosplay Tracker</title>
</svelte:head>

<div class="space-y-6 p-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold">Profile Settings</h1>
      <p class="text-muted-foreground">Update your personal information and profile picture</p>
    </div>
    <Button>
      <Save class="mr-2 size-4" />
      Save Changes
    </Button>
  </div>

  <!-- Profile Information -->
  <Card>
    <CardHeader>
      <CardTitle>Profile Information</CardTitle>
      <CardDescription>Update your personal information and profile picture</CardDescription>
    </CardHeader>
    <CardContent class="space-y-6">
      <!-- Avatar Upload -->
      <div class="flex items-center gap-6">
        <Avatar class="size-24">
          <AvatarImage src="/placeholder.svg?height=96&width=96" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div class="space-y-2">
          <Button variant="outline">
            <Camera class="mr-2 size-4" />
            Change Photo
          </Button>
          <p class="text-sm text-muted-foreground">JPG, PNG or GIF. Max size 5MB.</p>
        </div>
      </div>

      <!-- Basic Info -->
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2">
          <Label>Display Name</Label>
          <Input value="John Doe" />
        </div>
        <div class="space-y-2">
          <Label>Username</Label>
          <Input value="johndoe" />
        </div>
        <div class="space-y-2">
          <Label>Email</Label>
          <Input type="email" value="johndoe@example.com" />
        </div>
        <div class="space-y-2">
          <Label>Location</Label>
          <Input value="Los Angeles, CA" />
        </div>
      </div>

      <!-- Bio -->
      <div class="space-y-2">
        <Label>Bio</Label>
        <Textarea
          value="Passionate cosplayer specializing in armor builds and prop making. Always looking for new challenges!"
          rows={4}
        />
        <p class="text-sm text-muted-foreground">Brief description for your profile</p>
      </div>

      <!-- Skills/Specialties -->
      <div class="space-y-2">
        <Label>Skills & Specialties</Label>
        <div class="flex flex-wrap gap-2">
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

  <!-- Social Links -->
  <Card>
    <CardHeader>
      <CardTitle>Social Links</CardTitle>
      <CardDescription>Connect your social media accounts</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="space-y-2">
        <Label class="flex items-center gap-2">
          <Globe class="size-4" />
          Website
        </Label>
        <Input placeholder="https://yourwebsite.com" />
      </div>
      <div class="space-y-2">
        <Label class="flex items-center gap-2">
          <Instagram class="size-4" />
          Instagram
        </Label>
        <Input placeholder="@username" />
      </div>
      <div class="space-y-2">
        <Label class="flex items-center gap-2">
          <Twitter class="size-4" />
          Twitter/X
        </Label>
        <Input placeholder="@username" />
      </div>
      <div class="space-y-2">
        <Label class="flex items-center gap-2">
          <Facebook class="size-4" />
          Facebook
        </Label>
        <Input placeholder="facebook.com/username" />
      </div>
    </CardContent>
  </Card>

  <!-- Privacy Settings -->
  <Card>
    <CardHeader>
      <CardTitle>Privacy & Visibility</CardTitle>
      <CardDescription>Control who can see your profile and activity</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <div class="font-medium">Public Profile</div>
          <div class="text-sm text-muted-foreground">Make your profile visible to everyone</div>
        </div>
        <Switch checked />
      </div>
      <div class="flex items-center justify-between">
        <div>
          <div class="font-medium">Show in Marketplace</div>
          <div class="text-sm text-muted-foreground">Display your services in marketplace</div>
        </div>
        <Switch checked />
      </div>
      <div class="flex items-center justify-between">
        <div>
          <div class="font-medium">Show Project Activity</div>
          <div class="text-sm text-muted-foreground">Let others see your project updates</div>
        </div>
        <Switch checked />
      </div>
      <div class="flex items-center justify-between">
        <div>
          <div class="font-medium">Allow Messages</div>
          <div class="text-sm text-muted-foreground">Receive messages from other users</div>
        </div>
        <Switch checked />
      </div>
    </CardContent>
  </Card>

  <!-- Notification Preferences -->
  <Card>
    <CardHeader>
      <CardTitle>Notifications</CardTitle>
      <CardDescription>Manage your notification preferences</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <div class="font-medium">Email Notifications</div>
          <div class="text-sm text-muted-foreground">Receive updates via email</div>
        </div>
        <Switch checked />
      </div>
      <div class="flex items-center justify-between">
        <div>
          <div class="font-medium">Project Updates</div>
          <div class="text-sm text-muted-foreground">Notifications for project milestones</div>
        </div>
        <Switch checked />
      </div>
      <div class="flex items-center justify-between">
        <div>
          <div class="font-medium">Team Activity</div>
          <div class="text-sm text-muted-foreground">Updates from your team members</div>
        </div>
        <Switch checked />
      </div>
      <div class="flex items-center justify-between">
        <div>
          <div class="font-medium">Commission Requests</div>
          <div class="text-sm text-muted-foreground">Alerts for new commission inquiries</div>
        </div>
        <Switch checked />
      </div>
    </CardContent>
  </Card>

  <!-- Account Security -->
  <Card>
    <CardHeader>
      <CardTitle>Account Security</CardTitle>
      <CardDescription>Manage your password and security settings</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="space-y-2">
        <Label>Current Password</Label>
        <Input type="password" />
      </div>
      <div class="space-y-2">
        <Label>New Password</Label>
        <Input type="password" />
      </div>
      <div class="space-y-2">
        <Label>Confirm New Password</Label>
        <Input type="password" />
      </div>
      <Button>Update Password</Button>
    </CardContent>
  </Card>
</div>