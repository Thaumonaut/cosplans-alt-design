<script lang="ts">
  import { onMount } from 'svelte';
  import { Sun, Moon, Bell, Mail } from 'lucide-svelte';
  import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle,
    Switch,
    Label,
    Separator
  } from '$lib/components/ui';
  import { appSettings, updateSettings } from '$lib/stores/settings';
  import { theme, toggleTheme } from '$lib/stores/theme';
  import { get } from 'svelte/store';

  let loading = $state(true);
  let settings = $state(get(appSettings));
  let themeMode = $state<'light' | 'dark'>('light');

  // Subscribe to settings changes
  $effect(() => {
    const unsubscribe = appSettings.subscribe((s) => {
      settings = s;
    });
    return unsubscribe;
  });

  // Subscribe to theme changes
  $effect(() => {
    const unsubscribe = theme.subscribe((t) => {
      themeMode = t.resolvedMode;
    });
    return unsubscribe;
  });

  onMount(() => {
    appSettings.init();
    loading = false;
  });

  function handleThemeToggle() {
    toggleTheme();
  }

  function handleNotificationToggle(enabled: boolean) {
    updateSettings({ notifications: enabled });
  }

  function handleEmailNotificationsToggle(enabled: boolean) {
    // For now, this is the same as general notifications
    // In the future, this could be separate
    updateSettings({ notifications: enabled });
  }
</script>

<svelte:head>
  <title>Preferences - Settings - Cosplay Tracker</title>
</svelte:head>

<div class="space-y-6 p-6">
  <!-- Header -->
  <div>
    <h1 class="text-3xl font-bold">Preferences</h1>
    <p class="text-muted-foreground">Customize your application preferences and notification settings</p>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-20">
      <div class="text-sm text-muted-foreground">Loading preferences...</div>
    </div>
  {:else}
    <!-- Theme Preferences -->
    <Card>
      <CardHeader>
        <CardTitle>Theme</CardTitle>
        <CardDescription>Choose between light and dark mode</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            {#if themeMode === 'light'}
              <Sun class="size-5 text-muted-foreground" />
            {:else}
              <Moon class="size-5 text-muted-foreground" />
            {/if}
            <div>
              <Label for="theme-toggle" class="text-base font-medium">Dark Mode</Label>
              <p class="text-sm text-muted-foreground">
                Switch to dark mode for a more comfortable viewing experience in low light
              </p>
            </div>
          </div>
          <Switch
            checked={themeMode === 'dark'}
            onchange={handleThemeToggle}
          />
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
          <div class="flex items-center gap-3">
            <Bell class="size-5 text-muted-foreground" />
            <div>
              <Label for="notifications-toggle" class="text-base font-medium">Enable Notifications</Label>
              <p class="text-sm text-muted-foreground">
                Receive in-app notifications for tasks, comments, and updates
              </p>
            </div>
          </div>
          <Switch
            checked={settings.notifications}
            onchange={handleNotificationToggle}
          />
        </div>

        <Separator />

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Mail class="size-5 text-muted-foreground" />
            <div>
              <Label for="email-notifications-toggle" class="text-base font-medium">Email Notifications</Label>
              <p class="text-sm text-muted-foreground">
                Receive email notifications for important updates and invitations
              </p>
            </div>
          </div>
          <Switch
            checked={settings.notifications}
            onchange={handleEmailNotificationsToggle}
            disabled={!settings.notifications}
          />
        </div>
      </CardContent>
    </Card>
  {/if}
</div>

