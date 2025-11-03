<script lang="ts">
  /**
   * Inline User Selector Component
   * Feature: 003-modern-task-ui
   * Purpose: Inline assignee selection with avatar and search
   */
  import { cn } from '$lib/utils'
  import { onMount } from 'svelte'

  interface User {
    id: string
    name: string
    email: string
    avatar?: string
  }

  interface Props {
    value?: string | null // User ID
    users?: User[]
    editable?: boolean
    onSave?: (userId: string | null) => Promise<void> | void
    placeholder?: string
    className?: string
    showAvatar?: boolean
    allowUnassign?: boolean
  }

  let {
    value = $bindable(null),
    users = [],
    editable = true,
    onSave,
    placeholder = 'Select assignee...',
    className = '',
    showAvatar = true,
    allowUnassign = true,
  }: Props = $props()

  let isOpen = $state(false)
  let isSaving = $state(false)
  let searchQuery = $state('')
  let dropdownElement: HTMLDivElement | null = $state(null)

  // Get selected user
  let selectedUser = $derived(() => {
    if (!value) return null
    return users.find(u => u.id === value) || null
  })

  // Filter users by search query
  let filteredUsers = $derived(() => {
    if (!searchQuery) return users
    const query = searchQuery.toLowerCase()
    return users.filter(u => 
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    )
  })

  // Get user initials for avatar fallback
  function getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  async function selectUser(userId: string | null) {
    if (!editable) return

    const previousValue = value
    value = userId
    isOpen = false
    searchQuery = ''

    if (onSave && value !== previousValue) {
      isSaving = true
      try {
        await onSave(value)
      } catch (err) {
        value = previousValue
        console.error('Failed to save user selection:', err)
      } finally {
        isSaving = false
      }
    }
  }

  function handleClickOutside(event: MouseEvent) {
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      isOpen = false
      searchQuery = ''
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  })
</script>

<div class={cn('relative inline-block', className)} bind:this={dropdownElement}>
  <!-- Trigger Button -->
  <button
    type="button"
    onclick={() => editable && (isOpen = !isOpen)}
    disabled={!editable || isSaving}
    class={cn(
      'inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm transition-colors',
      'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
      !editable && 'cursor-not-allowed opacity-60',
      isSaving && 'cursor-wait opacity-70'
    )}
  >
    {#if selectedUser()}
      <!-- Selected User -->
      {#if showAvatar}
        {#if selectedUser().avatar}
          <img
            src={selectedUser().avatar}
            alt={selectedUser().name}
            class="h-5 w-5 rounded-full object-cover"
          />
        {:else}
          <div class="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-medium text-white">
            {getInitials(selectedUser().name)}
          </div>
        {/if}
      {/if}
      <span class="font-medium">{selectedUser().name}</span>
    {:else}
      <span class="text-gray-500">{placeholder}</span>
    {/if}
    
    {#if isSaving}
      <svg class="h-4 w-4 animate-spin text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    {:else}
      <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    {/if}
  </button>

  <!-- Dropdown Menu -->
  {#if isOpen}
    <div class="absolute left-0 z-50 mt-1 w-64 rounded-lg border border-gray-200 bg-white shadow-lg">
      <!-- Search Input -->
      <div class="border-b border-gray-200 p-2">
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search users..."
          class="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <!-- User List -->
      <div class="max-h-60 overflow-y-auto p-1">
        {#if allowUnassign}
          <button
            type="button"
            onclick={() => selectUser(null)}
            class={cn(
              'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
              'hover:bg-gray-100',
              !value && 'bg-blue-50 text-blue-700'
            )}
          >
            <div class="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200">
              <svg class="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span class="text-gray-600">Unassigned</span>
          </button>
        {/if}

        {#each filteredUsers() as user (user.id)}
          <button
            type="button"
            onclick={() => selectUser(user.id)}
            class={cn(
              'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
              'hover:bg-gray-100',
              value === user.id && 'bg-blue-50 text-blue-700'
            )}
          >
            {#if user.avatar}
              <img
                src={user.avatar}
                alt={user.name}
                class="h-6 w-6 rounded-full object-cover"
              />
            {:else}
              <div class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-medium text-white">
                {getInitials(user.name)}
              </div>
            {/if}
            <div class="flex-1 truncate">
              <div class="font-medium">{user.name}</div>
              <div class="text-xs text-gray-500">{user.email}</div>
            </div>
            {#if value === user.id}
              <svg class="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            {/if}
          </button>
        {:else}
          <div class="px-3 py-4 text-center text-sm text-gray-500">
            No users found
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

